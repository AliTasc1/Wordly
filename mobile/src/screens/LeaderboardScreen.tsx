import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Avatar } from '../components/Avatar';
import { BackButton } from '../components/Buttons';
import { ScreenHeading, StatTile } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import {
  ACTIVE_LEAGUE,
  BOARD_PROMOTION,
  BOARD_ROWS,
  BOARD_STATS,
  LEAGUES,
  moveColor,
} from '../data/leaderboard';
import { useBack } from '../navigation/useGo';

/** 19 · Liderlik — weekly leagues with the promotion cut-off marked. */
export function LeaderboardScreen() {
  const back = useBack('play');

  return (
    <Screen padTop={62} gap={13}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <ScreenHeading kicker="HAFTALIK LİG" title="Altın Lig" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.leagues}>
        {LEAGUES.map((league) => {
          const active = league.name === ACTIVE_LEAGUE;
          return (
            <View
              key={league.name}
              style={[styles.league, active ? styles.leagueActive : styles.leagueIdle]}>
              <Txt s={13}>{league.glyph}</Txt>
              <Txt f="m" s={12} w={700} c={active ? colors.text : colors.textFaint}>
                {league.name}
              </Txt>
            </View>
          );
        })}
      </ScrollView>

      <Gradient
        colors={['rgba(245,165,36,.2)', 'rgba(14,20,38,.92)']}
        style={styles.promotion}>
        <View style={styles.promotionIcon}>
          <Txt s={20}>{BOARD_PROMOTION.glyph}</Txt>
        </View>
        <View style={styles.flex}>
          <Txt f="m" s={13.5} w={700}>
            {BOARD_PROMOTION.title}
          </Txt>
          <Txt s={11.5} c={colors.textDim}>
            {BOARD_PROMOTION.sub}
          </Txt>
        </View>
      </Gradient>

      <View style={styles.board}>
        {BOARD_ROWS.map((row) => (
          <React.Fragment key={row.rank}>
            <View style={[styles.row, row.name === 'Sen' && styles.rowMe]}>
              <Txt f="mono" s={12.5} w={700} c={colors.textDim} style={styles.rank}>
                {row.rank}
              </Txt>
              <Avatar initials={row.initials} from={row.avatar[0]} to={row.avatar[1]} size={34} />
              <View style={styles.flex}>
                <Txt f="m" s={13.5} w={700}>
                  {row.name}
                </Txt>
                <Txt s={10.5} w={600} c={colors.textFaint}>
                  {row.meta}
                </Txt>
              </View>
              <View style={styles.rowRight}>
                <Txt f="mono" s={12.5} w={700} c={colors.accent}>
                  {row.xp}
                </Txt>
                <Txt f="m" s={10} w={700} c={moveColor(row.move)}>
                  {row.move}
                </Txt>
              </View>
            </View>

            {row.divider ? (
              <View style={styles.divider}>
                <Gradient
                  deg={90}
                  colors={['transparent', 'rgba(34,197,94,.5)', 'transparent']}
                  style={styles.dividerLine}
                />
                <Txt f="mono" s={9.5} w={700} c={colors.successSoft} ls={0.1}>
                  {BOARD_PROMOTION.dividerLabel}
                </Txt>
                <Gradient
                  deg={90}
                  colors={['transparent', 'rgba(34,197,94,.5)', 'transparent']}
                  style={styles.dividerLine}
                />
              </View>
            ) : null}
          </React.Fragment>
        ))}
      </View>

      <View style={styles.stats}>
        {BOARD_STATS.map((s) => (
          <StatTile key={s.label} value={s.value} label={s.label} tint={s.tint} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  leagues: { gap: 7, paddingBottom: 4 },
  league: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  leagueActive: { backgroundColor: 'rgba(245,165,36,.2)', borderColor: colors.warning },
  leagueIdle: { backgroundColor: alpha.w04, borderColor: alpha.w10 },
  promotion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,165,36,.32)',
    borderRadius: radii.tile,
    padding: 14,
  },
  promotionIcon: {
    width: 46,
    height: 46,
    borderRadius: radii.input,
    backgroundColor: 'rgba(245,165,36,.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.section,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 10,
    borderRadius: radii.card,
  },
  rowMe: {
    backgroundColor: 'rgba(46,107,255,.14)',
    borderWidth: 1,
    borderColor: 'rgba(46,107,255,.34)',
  },
  rank: { width: 24 },
  rowRight: { alignItems: 'flex-end' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  dividerLine: { flex: 1, height: 1 },
  stats: { flexDirection: 'row', gap: 9 },
});
