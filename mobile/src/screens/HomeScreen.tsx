import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Card } from '../components/Surfaces';
import { Press } from '../components/Buttons';
import { Avatar } from '../components/Avatar';
import { ProgressBar, ProgressRing } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii, shadows } from '../theme/tokens';
import { DAILY_GAME } from '../data/profile';
import { displayNameOf, greetingFor, initialOf, todayLine } from '../content/identity';
import { grammarOf } from '../content';
import { useApp } from '../state/AppContext';
import { avatarOf, initialsOf, weekEndsText } from '../content/board';
import { fetchBoard, type Board } from '../server/leaderboard';
import { useAuth } from '../state/AuthContext';
import { today } from '../state/days';
import { useGo } from '../navigation/useGo';
import { deckProgress, tr } from '../content/progress';

/** 06 · Ana Sayfa — "what should I do now?" answered in two seconds. */
export function HomeScreen() {
  const { go } = useGo();
  const { cefr, position, positions, xp, streak, setArenaMode, daily, mistakes } =
    useApp();
  const { user } = useAuth();

  // Selam ve altındaki satır tasarımda sabitti: "İyi akşamlar, Ali 👋" ve
  // "Bugün 3 görevin var". Sabah altıda açan kişi de iyi akşamlar diliyordu,
  // adı ne olursa olsun Ali'ydi ve görev sayısı hiç değişmiyordu.
  const name = displayNameOf(
    user?.user_metadata?.display_name as string | undefined,
    user?.email,
  );
  const todayXp = daily[today()] ?? 0;
  const mistakeCount = Object.keys(mistakes).length;

  /*
    Liderlik şeridi gerçek tablodan geliyor.

    Önce tasarımdan kalma üç sabit satır vardı ("Gözde 4.820 ▲", "Sen 4.480")
    ve liderlik ekranı gerçeğe bağlanınca iki ekran aynı öğrenci için farklı
    şeyler söylüyordu. Çelişen iki yalan, tek yalandan kötüdür.

    Hesap yoksa ya da kullanıcı tabloya katılmadıysa şerit hiç çizilmiyor:
    girilemeyen bir yarışın sıralamasını göstermenin anlamı yok.
  */
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    let alive = true;
    if (!user) {
      setBoard(null);
      return;
    }
    void fetchBoard(user.id, 3).then((result) => {
      if (alive && result.ok) setBoard(result.board);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  // "Where you left off" names the lesson the learner will actually land on.
  const lessons = useMemo(() => grammarOf(cefr), [cefr]);
  const at = Math.min(position('grammar', cefr), lessons.length - 1);
  const lesson = lessons[at];
  const remaining = lessons.length - at;

  /*
    Halkalar profil ekranıyla aynı kaynaktan besleniyor. Daha önce buradaki
    dört yüzde tasarımdan gelen sabitlerdi (%85, %60, %40, %15) ve profil
    gerçek sayıya geçince iki ekran birbiriyle çelişir olmuştu — aynı öğrenci
    için biri %85, diğeri %2 diyordu. Çelişen iki yalan, tek yalandan kötüdür.

    Halkada beş bölümün dördü gösteriliyor; beşincisi satıra sığmıyor ve
    kelime/gramer/dinleme/konuşma dördü günlük çalışmanın omurgası.
  */
  const RING_COLORS = [colors.primary, colors.secondary, colors.accent, colors.warning];
  const decks = deckProgress(positions, cefr);
  const rings = decks
    .filter((d) => d.kind !== 'reading')
    .map((d, i) => ({ ...d, color: RING_COLORS[i] }));
  const overall = Math.round(decks.reduce((n, d) => n + d.pct, 0) / decks.length);

  return (
    <Screen tabbed padTop={62} gap={14}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Avatar
              initials={initialOf(name)}
              from={colors.secondary}
              to={colors.accent}
              size={44}
              radius={15}
            />
            <View style={styles.online} />
          </View>
          <View>
            <Txt f="m" s={17} w={800}>
              {greetingFor(name)}
            </Txt>
            <Txt s={11.5} w={600} c={colors.textDim}>
              {todayLine(todayXp, streak)}
            </Txt>
          </View>
        </View>
        <Press
          onPress={() => go('notif')}
          accessibilityRole="button"
          accessibilityLabel="Bildirimler"
          style={styles.bell}>
          <Txt s={15}>🔔</Txt>
          <View style={styles.bellDot} />
        </Press>
      </View>

      <View style={styles.statRow}>
        <StatChip
          kicker="SEVİYE"
          value={cefr}
          tint={colors.primary}
          kickerColor={colors.blueSoft}
          fill="rgba(46,107,255,.2)"
          border="rgba(46,107,255,.3)"
        />
        <StatChip
          kicker="SERİ"
          value={streak ? `🔥 ${streak}` : '—'}
          tint={colors.warning}
          kickerColor={colors.warningSoft}
          fill="rgba(245,165,36,.18)"
          border="rgba(245,165,36,.3)"
        />
        <StatChip
          kicker="TOPLAM XP"
          value={tr(xp)}
          tint={colors.secondary}
          kickerColor={colors.violetSoft}
          fill="rgba(124,92,255,.2)"
          border="rgba(124,92,255,.32)"
        />
      </View>

      <Card radius={radii.section}>
        <View style={styles.goalHead}>
          <Txt f="m" s={14.5} w={700}>
            {cefr} seviyesinde ilerleme
          </Txt>
          <Txt f="mono" s={12} w={700} c={colors.textDim}>
            <Txt f="mono" s={12} w={700} c={colors.accent}>
              %{overall}
            </Txt>
            {' tamamlandı'}
          </Txt>
        </View>
        <ProgressBar pct={overall} height={10} glow={shadows.glowCyan} />
        <View style={styles.rings}>
          {rings.map((deck) => (
            <View key={deck.kind} style={styles.ringItem}>
              <ProgressRing size={50} thickness={6} pct={deck.pct} color={deck.color}>
                <View style={styles.ringInner}>
                  <Txt f="mono" s={11} w={700}>
                    %{deck.pct}
                  </Txt>
                </View>
              </ProgressRing>
              <Txt s={10.5} w={600} c={colors.textDim}>
                {deck.label}
              </Txt>
            </View>
          ))}
        </View>
      </Card>

      <Press onPress={() => go('lesson')} scale={0.99}>
        <Gradient
          colors={['rgba(46,107,255,.26)', 'rgba(124,92,255,.16)']}
          style={styles.continue}>
          <Gradient colors={gradients.brand} style={styles.continueBadge}>
            <Txt f="m" s={15} w={800}>
              {String(lesson.order).padStart(2, '0')}
            </Txt>
          </Gradient>
          <View style={styles.flex}>
            <Txt f="mono" s={10} w={700} c={colors.blueSoft} ls={0.1}>
              KALDIĞIN YER
            </Txt>
            <Txt f="m" s={17} w={800} style={styles.gap2}>
              {cefr} · Ders {lesson.order}
            </Txt>
            <Txt s={12} c={colors.textMuted} style={styles.gap3}>
              {lesson.topic} · {remaining} ders kaldı
            </Txt>
          </View>
          <Txt f="m" s={22} w={800}>
            ›
          </Txt>
        </Gradient>
      </Press>

      <Press onPress={() => go('coach')} scale={0.99} style={styles.coach}>
        <View style={styles.coachHead}>
          <Gradient colors={gradients.violetCyan} style={styles.coachBadge}>
            <Txt f="m" s={13} w={700}>
              📓
            </Txt>
          </Gradient>
          <Txt f="m" s={14.5} w={800}>
            Hata defterin
          </Txt>
          {mistakeCount > 0 ? (
            <View style={styles.coachStatus}>
              <Txt f="mono" s={10} w={700} c={colors.accentSoft}>
                {mistakeCount}
              </Txt>
            </View>
          ) : null}
        </View>
        {/* Burada "AI Koçun · HAZIR · 'Ali, dün Past Perfect'te zorlandın,
            3 dakika birlikte pratik yapalım'" yazıyordu. Böyle bir koç yok
            ve o cümle herkese aynı geliyordu. Koç ekranı gerçek hata
            defterini gösteriyor; kart da artık onu anlatıyor. */}
        <Txt s={13} lh={1.5} c={colors.textBody}>
          {mistakeCount > 0
            ? `${mistakeCount} soruda yanıldın. En çok zorlandıklarınla başla.`
            : 'Henüz yanlışın yok. Bir bölüm çöz, zorlandıkların buraya düşsün.'}
        </Txt>
        <View style={styles.coachCta}>
          <Txt f="m" s={12.5} w={700}>
            {mistakeCount > 0 ? 'Hatalarımı çalış' : 'Derse git'}
          </Txt>
        </View>
      </Press>

      {/* Burada "Gözde seni düelloya çağırdı · Kabul et" kartı vardı. Düello
          yazılmadı ve Play merkezinden de kaldırıldı; olmayan bir davetle
          ana sayfayı açmak, dokunulduğunda öğrenilen bir sözdü. */}
      <View style={styles.duelRow}>
        <Press
          onPress={() => {
            setArenaMode('time');
            go('arena');
          }}
          scale={0.99}
          style={styles.gameCard}>
          <Txt f="mono" s={10} w={700} c={colors.accentSoft} ls={0.1}>
            {DAILY_GAME.kicker}
          </Txt>
          <View style={styles.gameRing}>
            <Txt f="m" s={15} w={800}>
              W
            </Txt>
          </View>
          <Txt f="m" s={14} w={800}>
            {DAILY_GAME.title}
          </Txt>
          <Txt s={11} c={colors.textDim}>
            {DAILY_GAME.sub}
          </Txt>
        </Press>
      </View>

      {board && board.entries.length ? (
        <Press onPress={() => go('board')} scale={0.99} style={styles.board}>
          <View style={styles.boardHead}>
            <Txt f="m" s={14.5} w={700}>
              Liderlik
            </Txt>
            <Txt s={12} w={700} c={colors.textDim}>
              Tümü ›
            </Txt>
          </View>
          {board.entries.map((r) => {
            const tint = avatarOf(r.name);
            return (
              <View key={r.userId} style={[styles.boardRow, r.me && styles.boardRowMe]}>
                <Txt f="mono" s={12} w={700} c={colors.textDim} style={styles.rank}>
                  {r.place}
                </Txt>
                <Avatar
                  initials={initialsOf(r.name)}
                  from={tint[0]}
                  to={tint[1]}
                  size={28}
                />
                <Txt f="m" s={13} w={700} style={styles.flex}>
                  {r.name}
                </Txt>
                <Txt f="mono" s={12} w={700} c={colors.accent}>
                  {tr(r.xp)}
                </Txt>
              </View>
            );
          })}
          <Txt s={11} c={colors.textFaint} style={styles.boardFoot}>
            {weekEndsText()}
          </Txt>
        </Press>
      ) : null}
    </Screen>
  );
}

function StatChip({
  kicker,
  value,
  kickerColor,
  fill,
  border,
}: {
  kicker: string;
  value: string;
  tint: string;
  kickerColor: string;
  fill: string;
  border: string;
}) {
  return (
    <Gradient
      deg={140}
      colors={[fill, 'rgba(14,20,38,.9)']}
      style={[styles.statChip, { borderColor: border }]}>
      <Txt f="mono" s={10} w={700} c={kickerColor} ls={0.1}>
        {kicker}
      </Txt>
      <Txt f="m" s={21} w={800} style={styles.gap2}>
        {value}
      </Txt>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap2: { marginTop: 2 },
  gap3: { marginTop: 3 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  online: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2.5,
    borderColor: colors.bg,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: alpha.w10,
    backgroundColor: alpha.w04,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  statRow: { flexDirection: 'row', gap: 9 },
  statChip: { flex: 1, borderWidth: 1, borderRadius: radii.panel, padding: 12 },
  goalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  rings: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  ringItem: { flex: 1, alignItems: 'center', gap: 6 },
  ringInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceSlot,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(46,107,255,.34)',
    borderRadius: radii.section,
    padding: 16,
  },
  continueBadge: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.tileBrand,
  },
  coach: {
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,.32)',
    borderRadius: radii.section,
    padding: 16,
    backgroundColor: 'rgba(124,92,255,.1)',
  },
  coachHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  coachBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachStatus: {
    marginLeft: 'auto',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(34,211,238,.16)',
  },
  coachCta: {
    alignSelf: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.secondary,
  },
  // Tek karta düştü ama satır duruyor: yanına ikinci bir kart gelecek.
  duelRow: { flexDirection: 'row', gap: 10 },
  gameCard: {
    width: 126,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,.28)',
    borderRadius: radii.tile,
    padding: 14,
    backgroundColor: 'rgba(34,211,238,.09)',
    justifyContent: 'space-between',
  },
  gameRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(34,211,238,.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  board: {
    gap: 10,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.section,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  boardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  boardRowMe: {
    backgroundColor: 'rgba(46,107,255,.12)',
    borderWidth: 1,
    borderColor: 'rgba(46,107,255,.3)',
    borderRadius: radii.md,
    paddingHorizontal: 9,
    marginHorizontal: -9,
  },
  rank: { width: 22 },
  boardFoot: { paddingTop: 6, paddingHorizontal: 4 },
});
