import { supabase } from './client';
import { problemOf, type Problem } from './errors';

/**
 * Haftalık lider tablosu.
 *
 * Sıralama sunucuda yapılıyor ve yalnızca **katılmayı seçmiş** kullanıcıları
 * içeriyor. Katılım varsayılan olarak kapalı: hesap açan herkesin adını ve
 * çalışma temposunu diğer bütün kullanıcılara göstermek, kimsenin istemeden
 * vermiş olmaması gereken bir şeydir.
 *
 * Tablo hesapsız görülemiyor. Giriş yapmadan başkalarının adlarını
 * toplayabilen bir uç nokta, lider tablosu değil veri kaynağıdır.
 */

export type BoardEntry = {
  userId: string;
  name: string;
  xp: number;
  place: number;
  /** Bu satır oturumu açık kullanıcıya mı ait. */
  me: boolean;
};

export type MyPlace = {
  xp: number;
  place: number;
  /** Tabloya katılan toplam kişi sayısı. */
  total: number;
};

export type Board = {
  entries: BoardEntry[];
  /** Kullanıcı katılmamışsa ya da bu hafta hiç XP kazanmamışsa null. */
  mine: MyPlace | null;
};

type BoardRow = {
  user_id: string;
  display_name: string | null;
  xp: number;
  place: number;
};
type PlaceRow = { xp: number; place: number; total: number };

export async function fetchBoard(
  myUserId: string,
  limit = 50,
): Promise<{ ok: true; board: Board } | { ok: false; problem: Problem }> {
  const [list, mine] = await Promise.all([
    supabase.rpc('weekly_leaderboard', { limit_count: limit }),
    supabase.rpc('my_leaderboard_place'),
  ]);

  const failed = list.error ?? mine.error;
  if (failed) return { ok: false, problem: problemOf(failed) };

  const rows = (list.data ?? []) as BoardRow[];
  const place = ((mine.data ?? []) as PlaceRow[])[0] ?? null;

  return {
    ok: true,
    board: {
      entries: rows.map((r) => ({
        userId: r.user_id,
        // Sunucu kısıtı adsız katılıma izin vermiyor, ama istemci sunucunun
        // kuralına güvenip çökmemeli.
        name: r.display_name ?? '—',
        xp: r.xp,
        place: r.place,
        me: r.user_id === myUserId,
      })),
      mine: place ? { xp: place.xp, place: place.place, total: place.total } : null,
    },
  };
}

/**
 * Katılımı açar ya da kapatır.
 *
 * Açmak için bir ad gerekiyor; sunucudaki kısıt da bunu şart koşuyor.
 * Kapatmak adı silmiyor — kullanıcı yarın tekrar açmak isterse adını
 * yeniden yazmak zorunda kalmasın.
 */
export async function setParticipation(
  userId: string,
  optIn: boolean,
  displayName?: string,
): Promise<Problem | null> {
  const patch: Record<string, unknown> = { leaderboard_opt_in: optIn };
  if (displayName != null) {
    patch.display_name = displayName.trim();
    patch.display_name_set_at = new Date().toISOString();
  }

  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) return problemOf(error);

  // Ad, oturumun kendi verisine de yazılıyor. Profil ekranı onu her açılışta
  // ayrı bir sorguyla çekmek zorunda kalmasın diye: metadata jetonun içinde
  // geliyor ve çevrimdışıyken de elimizde oluyor.
  if (displayName != null) {
    const { error: metaError } = await supabase.auth.updateUser({
      data: { display_name: displayName.trim() },
    });
    // Profil satırı yazıldı; metadata yazılamadıysa ad yalnızca bir sonraki
    // açılışta gecikmeli görünür. Kullanıcıya hata göstermeye değmez.
    if (metaError) return null;
  }

  return null;
}

export type Participation = { optIn: boolean; displayName: string | null };

export async function fetchParticipation(
  userId: string,
): Promise<{ ok: true; value: Participation } | { ok: false; problem: Problem }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('leaderboard_opt_in, display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error) return { ok: false, problem: problemOf(error) };

  const row = (data ?? null) as {
    leaderboard_opt_in: boolean;
    display_name: string | null;
  } | null;
  return {
    ok: true,
    value: {
      optIn: row?.leaderboard_opt_in ?? false,
      displayName: row?.display_name ?? null,
    },
  };
}

/** Görünen ad kuralları — sunucudaki kısıtla aynı, ağ turunu beklememek için. */
export const NAME_MIN = 2;
export const NAME_MAX = 24;

export function nameProblem(name: string): string | null {
  const value = name.trim();
  if (value.length < NAME_MIN) return `Ad en az ${NAME_MIN} karakter olmalı.`;
  if (value.length > NAME_MAX) return `Ad en fazla ${NAME_MAX} karakter olabilir.`;
  return null;
}
