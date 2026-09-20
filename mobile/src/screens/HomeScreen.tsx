import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Card } from '../components/Surfaces';
import { Press } from '../components/Buttons';
import { Avatar } from '../components/Avatar';
import { ProgressBar, ProgressRing } from '../components/Progress';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { DAILY_GAME } from '../data/profile';
import { displayNameOf, greetingFor, initialOf, todayLine } from '../content/identity';
import { grammarOf } from '../content';
import { durationText, goalProgress, goalText } from '../content/goal';
import { useApp } from '../state/AppContext';
import { avatarOf, initialsOf, weekEndsText } from '../content/board';
import { fetchBoard, type Board } from '../server/leaderboard';
import { useAuth } from '../state/AuthContext';
import { today } from '../state/days';
import { useGo } from '../navigation/useGo';
import { deckProgress, tr } from '../content/progress';

/** 06 · Ana Sayfa — "what should I do now?" answered in two seconds. */
export function HomeScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();
  const { cefr, position, positions, xp, streak, setArenaMode, daily, mistakes, dailyTime, goal } =
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

  // Kurulumda seçilen günlük süre uzun zaman hiçbir şey yapmıyordu. Artık
  // gerçek ölçülen süreyle karşılaştırılıyor ve ilk kartta duruyor —
  // görünmeyen hedef, hedef değildir.
  const today_ = goalProgress(goal.studiedToday, dailyTime);
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
  const RING_COLORS = [t.colors.primary, t.colors.secondary, t.colors.accent, t.colors.warning];
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
              from={t.colors.secondary}
              to={t.colors.accent}
              size={44}
              radius={15}
            />
            <View style={styles.online} />
          </View>
          <View>
            <Txt f="m" s={font.title} w={800}>
              {greetingFor(name)}
            </Txt>
            <Txt s={font.caption} w={600} c={t.colors.textDim}>
              {todayLine(todayXp, streak)}
            </Txt>
          </View>
        </View>
        <Press
          onPress={() => go('notif')}
          accessibilityRole="button"
          accessibilityLabel="Bildirimler"
          style={styles.bell}>
          <Txt s={font.callout}>🔔</Txt>
          <View style={styles.bellDot} />
        </Press>
      </View>

      <View style={styles.statRow}>
        <StatChip
          kicker="SEVİYE"
          value={cefr}
          kickerColor={t.colors.blueSoft}
          fill={tint(t.colors.primary, 0.2)}
          border={tint(t.colors.primary, 0.3)}
        />
        <StatChip
          kicker="SERİ"
          value={streak ? `🔥 ${streak}` : '—'}
          kickerColor={t.colors.warningSoft}
          fill={tint(t.colors.warning, 0.18)}
          border={tint(t.colors.warning, 0.3)}
        />
        <StatChip
          kicker="TOPLAM XP"
          value={tr(xp)}
          kickerColor={t.colors.violetSoft}
          fill={tint(t.colors.secondary, 0.2)}
          border={tint(t.colors.secondary, 0.32)}
        />
      </View>

      <Card radius={radii.section}>
        <View style={styles.goalHead}>
          <Txt f="m" s={font.body} w={700}>
            Bugünkü hedefin
          </Txt>
          <Txt f="mono" s={font.caption} w={700} c={today_.done ? t.colors.success : t.colors.textDim}>
            {durationText(today_.studied)} / {durationText(today_.goal)}
          </Txt>
        </View>
        <ProgressBar
          pct={today_.pct}
          height={10}
          from={today_.done ? t.colors.success : t.colors.primary}
          to={today_.done ? t.colors.success : t.colors.accent}
        />
        <Txt s={font.caption} c={today_.done ? t.colors.successSoft : t.colors.textDim}>
          {today_.done ? '✓ ' : ''}
          {goalText(today_)}
        </Txt>
      </Card>

      <Card radius={radii.section}>
        <View style={styles.goalHead}>
          <Txt f="m" s={font.body} w={700}>
            {cefr} seviyesinde ilerleme
          </Txt>
          <Txt f="mono" s={font.caption} w={700} c={t.colors.textDim}>
            <Txt f="mono" s={font.caption} w={700} c={t.colors.accent}>
              %{overall}
            </Txt>
            {' tamamlandı'}
          </Txt>
        </View>
        <ProgressBar pct={overall} height={10} glow={t.shadows.glowCyan} />
        <View style={styles.rings}>
          {rings.map((deck) => (
            <View key={deck.kind} style={styles.ringItem}>
              <ProgressRing size={50} thickness={6} pct={deck.pct} color={deck.color}>
                <View style={styles.ringInner}>
                  <Txt f="mono" s={font.caption} w={700}>
                    %{deck.pct}
                  </Txt>
                </View>
              </ProgressRing>
              <Txt s={font.label} w={600} c={t.colors.textDim}>
                {deck.label}
              </Txt>
            </View>
          ))}
        </View>
      </Card>

      <Press onPress={() => go('lesson')} scale={0.99}>
        <Gradient
          colors={[tint(t.colors.primary, 0.26), tint(t.colors.secondary, 0.16)]}
          style={styles.continue}>
          <Gradient colors={t.gradients.brand} style={styles.continueBadge}>
            <Txt f="m" s={font.callout} w={800} c={t.colors.onBrand}>
              {String(lesson.order).padStart(2, '0')}
            </Txt>
          </Gradient>
          <View style={styles.flex}>
            <Txt f="mono" s={font.label} w={700} c={t.colors.blueSoft} ls={0.1}>
              KALDIĞIN YER
            </Txt>
            <Txt f="m" s={font.title} w={800} style={styles.gap2}>
              {cefr} · Ders {lesson.order}
            </Txt>
            <Txt s={font.caption} c={t.colors.textMuted} style={styles.gap3}>
              {lesson.topic} · {remaining} ders kaldı
            </Txt>
          </View>
          <Txt f="m" s={font.display} w={800}>
            ›
          </Txt>
        </Gradient>
      </Press>

      <Press onPress={() => go('coach')} scale={0.99} style={styles.coach}>
        <View style={styles.coachHead}>
          <Gradient colors={t.gradients.violet} style={styles.coachBadge}>
            <Txt f="m" s={font.footnote} w={700} c={t.colors.onBrand}>
              📓
            </Txt>
          </Gradient>
          <Txt f="m" s={font.body} w={800}>
            Hata defterin
          </Txt>
          {mistakeCount > 0 ? (
            <View style={styles.coachStatus}>
              <Txt f="mono" s={font.label} w={700} c={t.colors.accentSoft}>
                {mistakeCount}
              </Txt>
            </View>
          ) : null}
        </View>
        {/* Burada "AI Koçun · HAZIR · 'Ali, dün Past Perfect'te zorlandın,
            3 dakika birlikte pratik yapalım'" yazıyordu. Böyle bir koç yok
            ve o cümle herkese aynı geliyordu. Koç ekranı gerçek hata
            defterini gösteriyor; kart da artık onu anlatıyor. */}
        <Txt s={font.footnote} lh={1.5} c={t.colors.textBody}>
          {mistakeCount > 0
            ? `${mistakeCount} soruda yanıldın. En çok zorlandıklarınla başla.`
            : 'Henüz yanlışın yok. Bir bölüm çöz, zorlandıkların buraya düşsün.'}
        </Txt>
        <View style={styles.coachCta}>
          <Txt f="m" s={font.footnote} w={700}>
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
          <Txt f="mono" s={font.label} w={700} c={t.colors.accentSoft} ls={0.1}>
            {DAILY_GAME.kicker}
          </Txt>
          <View style={styles.gameRing}>
            <Txt f="m" s={font.callout} w={800}>
              W
            </Txt>
          </View>
          <Txt f="m" s={font.body} w={800}>
            {DAILY_GAME.title}
          </Txt>
          <Txt s={font.caption} c={t.colors.textDim}>
            {DAILY_GAME.sub}
          </Txt>
        </Press>
      </View>

      {board && board.entries.length ? (
        <Press onPress={() => go('board')} scale={0.99} style={styles.board}>
          <View style={styles.boardHead}>
            <Txt f="m" s={font.body} w={700}>
              Liderlik
            </Txt>
            <Txt s={font.caption} w={700} c={t.colors.textDim}>
              Tümü ›
            </Txt>
          </View>
          {board.entries.map((r) => {
            const tint = avatarOf(r.name);
            return (
              <View key={r.userId} style={[styles.boardRow, r.me && styles.boardRowMe]}>
                <Txt f="mono" s={font.caption} w={700} c={t.colors.textDim} style={styles.rank}>
                  {r.place}
                </Txt>
                <Avatar
                  initials={initialsOf(r.name)}
                  from={t.colors[tint[0]]}
                  to={t.colors[tint[1]]}
                  size={28}
                />
                <Txt f="m" s={font.footnote} w={700} style={styles.flex}>
                  {r.name}
                </Txt>
                <Txt f="mono" s={font.caption} w={700} c={t.colors.accent}>
                  {tr(r.xp)}
                </Txt>
              </View>
            );
          })}
          <Txt s={font.caption} c={t.colors.textFaint} style={styles.boardFoot}>
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
  kickerColor: string;
  fill: string;
  border: string;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Gradient
      deg={140}
      colors={[fill, tint(t.colors.surface, 0.9)]}
      style={[styles.statChip, { borderColor: border }]}>
      <Txt f="mono" s={font.label} w={700} c={kickerColor} ls={0.1}>
        {kicker}
      </Txt>
      <Txt f="m" s={font.display} w={800} style={styles.gap2}>
        {value}
      </Txt>
    </Gradient>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    gap2: { marginTop: 2 },
    gap3: { marginTop: 4 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    online: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 13,
      height: 13,
      borderRadius: 7,
      backgroundColor: t.colors.success,
      borderWidth: 2.5,
      borderColor: t.colors.bg,
    },
    bell: {
      width: 40,
      height: 40,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: t.alpha.w10,
      backgroundColor: t.alpha.w04,
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
      backgroundColor: t.colors.error,
    },
    statRow: { flexDirection: 'row', gap: 10 },
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
      backgroundColor: t.colors.sunken,
      alignItems: 'center',
      justifyContent: 'center',
    },
    continue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderWidth: 1,
      borderColor: tint(t.colors.primary, 0.34),
      borderRadius: radii.section,
      padding: 16,
    },
    continueBadge: {
      width: 52,
      height: 52,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: t.shadows.tileBrand,
    },
    coach: {
      gap: 10,
      borderWidth: 1,
      borderColor: tint(t.colors.secondary, 0.32),
      borderRadius: radii.section,
      padding: 16,
      backgroundColor: tint(t.colors.secondary, 0.1),
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
      paddingHorizontal: 10,
      borderRadius: radii.sm,
      backgroundColor: tint(t.colors.accent, 0.16),
    },
    coachCta: {
      alignSelf: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: radii.md,
      backgroundColor: t.colors.secondary,
    },
    // Tek karta düştü ama satır duruyor: yanına ikinci bir kart gelecek.
    duelRow: { flexDirection: 'row', gap: 10 },
    gameCard: {
      width: 126,
      borderWidth: 1,
      borderColor: tint(t.colors.accent, 0.28),
      borderRadius: radii.tile,
      padding: 14,
      backgroundColor: tint(t.colors.accent, 0.09),
      justifyContent: 'space-between',
    },
    gameRing: {
      width: 46,
      height: 46,
      borderRadius: 23,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: tint(t.colors.accent, 0.5),
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 8,
    },
    board: {
      gap: 10,
      borderWidth: 1,
      borderColor: t.alpha.w08,
      borderRadius: radii.section,
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: t.colors.surface,
    },
    boardHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    boardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
    boardRowMe: {
      backgroundColor: tint(t.colors.primary, 0.12),
      borderWidth: 1,
      borderColor: tint(t.colors.primary, 0.3),
      borderRadius: radii.md,
      paddingHorizontal: 10,
      marginHorizontal: -9,
    },
    rank: { width: 22 },
    boardFoot: { paddingTop: 6, paddingHorizontal: 4 },
  });
