import { supabase } from './client';
import {
  merge,
  type Base,
  type DailyRow,
  type DefaultProfile,
  type LocalState,
  type MergeResult,
  type MistakeRow,
  type PositionRow,
  type ProfileRow,
  type ServerState,
} from './merge';

/**
 * Sunucuyla gidiş dönüş.
 *
 * Karar verme işi burada değil — o tamamen `merge.ts` içinde ve sınanıyor.
 * Burası yalnızca okuma, yazma ve hata taşıma yapıyor.
 *
 * Değişmez kural: **eşitleme cihazdaki veriyi kaybettirmez.** Ağ koparsa,
 * sunucu hata verirse ya da yazmanın yarısı geçerse, yerelde olan yerinde
 * kalır ve taban güncellenmez; bir sonraki tur aynı işi baştan dener.
 */

export type SyncOutcome =
  | { ok: true; applied: MergeResult['local']; base: Base }
  | { ok: false; reason: string };

/** Tek seferde gönderilen en fazla satır. */
const CHUNK = 200;

function chunked<T>(items: T[], size = CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function pull(userId: string): Promise<ServerState> {
  const [positions, savedWords, mistakes, daily, profile] = await Promise.all([
    supabase.from('positions').select('kind, level, position').eq('user_id', userId),
    supabase.from('saved_words').select('card_id').eq('user_id', userId),
    supabase
      .from('mistakes')
      .select('key, kind, level, content_id, q, text, answer, times, at')
      .eq('user_id', userId),
    supabase.from('daily_xp').select('day, device_id, xp, seconds').eq('user_id', userId),
    supabase
      .from('profiles')
      .select('cefr, goals, daily_time, skills, test_result, arena, updated_at')
      .eq('id', userId)
      .maybeSingle(),
  ]);

  const failed =
    positions.error ?? savedWords.error ?? mistakes.error ?? daily.error ?? profile.error;
  if (failed) throw failed;

  return {
    positions: (positions.data ?? []) as PositionRow[],
    savedWords: (savedWords.data ?? []).map((r: { card_id: string }) => r.card_id),
    mistakes: (mistakes.data ?? []) as MistakeRow[],
    daily: (daily.data ?? []) as DailyRow[],
    profile: (profile.data ?? null) as ProfileRow | null,
  };
}

async function push(
  userId: string,
  deviceId: string,
  plan: MergeResult['push'],
): Promise<void> {
  // Sıra önemli: önce ekleme ve güncelleme, sonra silme. Tersi olsaydı ve
  // arada bağlantı koparsa, silinen satırlar gitmiş ama yerlerine geçecek
  // güncellemeler yazılmamış olurdu.
  for (const rows of chunked(plan.positions)) {
    const { error } = await supabase.from('positions').upsert(
      rows.map((r) => ({ ...r, user_id: userId })),
      { onConflict: 'user_id,kind,level' },
    );
    if (error) throw error;
  }

  for (const rows of chunked(plan.daily)) {
    const { error } = await supabase.from('daily_xp').upsert(
      rows.map((r) => ({ ...r, user_id: userId, device_id: deviceId })),
      { onConflict: 'user_id,day,device_id' },
    );
    if (error) throw error;
  }

  for (const words of chunked(plan.savedWordsAdd)) {
    // `ignoreDuplicates` şart: bu tablonun yalnızca insert ve delete
    // politikası var, update yok. Sıradan bir upsert çakışmada UPDATE
    // deneyip RLS'e takılırdı. Zaten güncellenecek bir alan da yok —
    // satırın varlığı bilginin kendisi.
    const { error } = await supabase.from('saved_words').upsert(
      words.map((card_id) => ({ user_id: userId, card_id })),
      {
        onConflict: 'user_id,card_id',
        ignoreDuplicates: true,
      },
    );
    if (error) throw error;
  }

  for (const rows of chunked(plan.mistakesUpsert)) {
    const { error } = await supabase.from('mistakes').upsert(
      rows.map((r) => ({ ...r, user_id: userId })),
      { onConflict: 'user_id,key' },
    );
    if (error) throw error;
  }

  if (plan.profile) {
    const { error } = await supabase
      .from('profiles')
      .upsert({ ...plan.profile, id: userId, updated_at: new Date().toISOString() });
    if (error) throw error;
  }

  for (const words of chunked(plan.savedWordsRemove)) {
    const { error } = await supabase
      .from('saved_words')
      .delete()
      .eq('user_id', userId)
      .in('card_id', words);
    if (error) throw error;
  }

  for (const keys of chunked(plan.mistakesRemove)) {
    const { error } = await supabase
      .from('mistakes')
      .delete()
      .eq('user_id', userId)
      .in('key', keys);
    if (error) throw error;
  }
}

/**
 * Bir eşitleme turu.
 *
 * Taban yalnızca **yazma bittikten sonra** dönüyor; çağıran onu kaydediyor.
 * Yazma yarıda kalırsa taban eski kalır, yani bir sonraki turda gönderilmemiş
 * satırlar yeniden gönderilir. Bütün yazmalar idempotent (upsert ve anahtar
 * bazlı silme), bu yüzden tekrar etmek zarar vermiyor.
 */
export async function syncOnce(
  userId: string,
  deviceId: string,
  local: LocalState,
  base: Base,
  defaults: DefaultProfile,
): Promise<SyncOutcome> {
  try {
    const server = await pull(userId);
    const result = merge(local, server, base, deviceId, defaults);
    await push(userId, deviceId, result.push);
    return { ok: true, applied: result.local, base: result.base };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}
