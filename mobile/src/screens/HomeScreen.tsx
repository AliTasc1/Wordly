import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Card } from '../components/Surfaces';
import { Press } from '../components/Buttons';
import { Avatar } from '../components/Avatar';
import { ProgressBar, ProgressRing } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii, shadows } from '../theme/tokens';
import {
  COACH_CARD,
  CONTINUE_CARD,
  DAILY_GAME,
  DAILY_RINGS,
  USER,
} from '../data/profile';
import { BOARD_PREVIEW, moveColor } from '../data/leaderboard';
import { DUEL_INVITE } from '../data/social';
import { useGo } from '../navigation/useGo';

/** 06 · Ana Sayfa — "what should I do now?" answered in two seconds. */
export function HomeScreen() {
  const { go } = useGo();

  return (
    <Screen tabbed padTop={62} gap={14}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Avatar
              initials={USER.initials}
              from={colors.secondary}
              to={colors.accent}
              size={44}
              radius={15}
            />
            <View style={styles.online} />
          </View>
          <View>
            <Txt f="m" s={17} w={800}>
              {USER.greeting}
            </Txt>
            <Txt s={11.5} w={600} c={colors.textDim}>
              {USER.tasks}
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
          value={USER.level}
          tint={colors.primary}
          kickerColor={colors.blueSoft}
          fill="rgba(46,107,255,.2)"
          border="rgba(46,107,255,.3)"
        />
        <StatChip
          kicker="SERİ"
          value={USER.streak}
          tint={colors.warning}
          kickerColor={colors.warningSoft}
          fill="rgba(245,165,36,.18)"
          border="rgba(245,165,36,.3)"
        />
        <StatChip
          kicker="HAFTALIK"
          value={USER.weeklyRank}
          tint={colors.secondary}
          kickerColor={colors.violetSoft}
          fill="rgba(124,92,255,.2)"
          border="rgba(124,92,255,.32)"
        />
      </View>

      <Card radius={radii.section}>
        <View style={styles.goalHead}>
          <Txt f="m" s={14.5} w={700}>
            Günlük hedef
          </Txt>
          <Txt f="mono" s={12} w={700} c={colors.textDim}>
            <Txt f="mono" s={12} w={700} c={colors.accent}>
              {USER.daily.earned}
            </Txt>
            {` / ${USER.daily.goal} XP`}
          </Txt>
        </View>
        <ProgressBar pct={USER.daily.pct} height={10} glow={shadows.glowCyan} />
        <View style={styles.rings}>
          {DAILY_RINGS.map((r) => (
            <View key={r.name} style={styles.ringItem}>
              <ProgressRing size={50} thickness={6} pct={r.pct} color={r.color}>
                <View style={styles.ringInner}>
                  <Txt f="mono" s={11} w={700}>
                    %{r.pct}
                  </Txt>
                </View>
              </ProgressRing>
              <Txt s={10.5} w={600} c={colors.textDim}>
                {r.name}
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
              {CONTINUE_CARD.badge}
            </Txt>
          </Gradient>
          <View style={styles.flex}>
            <Txt f="mono" s={10} w={700} c={colors.blueSoft} ls={0.1}>
              {CONTINUE_CARD.kicker}
            </Txt>
            <Txt f="m" s={17} w={800} style={styles.gap2}>
              {CONTINUE_CARD.title}
            </Txt>
            <Txt s={12} c={colors.textMuted} style={styles.gap3}>
              {CONTINUE_CARD.sub}
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
              AI
            </Txt>
          </Gradient>
          <Txt f="m" s={14.5} w={800}>
            {COACH_CARD.title}
          </Txt>
          <View style={styles.coachStatus}>
            <Txt f="mono" s={10} w={700} c={colors.accentSoft}>
              {COACH_CARD.status}
            </Txt>
          </View>
        </View>
        <Txt s={13} lh={1.5} c={colors.textBody}>
          {COACH_CARD.message}
        </Txt>
        <View style={styles.coachCta}>
          <Txt f="m" s={12.5} w={700}>
            {COACH_CARD.cta}
          </Txt>
        </View>
      </Press>

      <View style={styles.duelRow}>
        <Press onPress={() => go('duel')} scale={0.99} style={styles.duelCard}>
          <Avatar initials="G" from={colors.orange} to={colors.error} size={30} />
          <Txt f="m" s={13} w={700}>
            {DUEL_INVITE.title}
          </Txt>
          <Txt s={11.5} c={colors.textDim}>
            {DUEL_INVITE.sub}
          </Txt>
          <Gradient colors={gradients.brand} style={styles.duelCta}>
            <Txt f="m" s={11} w={800} ls={0.06}>
              {DUEL_INVITE.acceptLong}
            </Txt>
          </Gradient>
        </Press>

        <Press onPress={() => go('arena')} scale={0.99} style={styles.gameCard}>
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

      <Press onPress={() => go('board')} scale={0.99} style={styles.board}>
        <View style={styles.boardHead}>
          <Txt f="m" s={14.5} w={700}>
            Altın Lig · 3 gün kaldı
          </Txt>
          <Txt s={12} w={700} c={colors.textDim}>
            Tümü ›
          </Txt>
        </View>
        {BOARD_PREVIEW.map((r) => (
          <View key={r.rank} style={[styles.boardRow, r.name === 'Sen' && styles.boardRowMe]}>
            <Txt f="mono" s={12} w={700} c={colors.textDim} style={styles.rank}>
              {r.rank}
            </Txt>
            <Avatar initials={r.initials} from={r.avatar[0]} to={r.avatar[1]} size={28} />
            <Txt f="m" s={13} w={700} style={styles.flex}>
              {r.name}
            </Txt>
            <Txt f="mono" s={12} w={700} c={colors.accent}>
              {r.xp}
            </Txt>
            <Txt f="m" s={11} w={700} c={moveColor(r.move)} style={styles.move}>
              {r.move}
            </Txt>
          </View>
        ))}
      </Press>
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
  goalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
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
  coachBadge: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
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
  duelRow: { flexDirection: 'row', gap: 10 },
  duelCard: {
    flex: 1,
    gap: 8,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.tile,
    padding: 14,
    backgroundColor: colors.surface,
  },
  duelCta: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: radii.chip,
  },
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
  boardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
  move: { width: 16 },
});
