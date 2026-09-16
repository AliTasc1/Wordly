import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton } from '../components/Buttons';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { ACHIEVEMENTS, ACHIEVEMENTS_HEADER } from '../data/profile';
import { useBack } from '../navigation/useGo';

/** 27 · Başarımlar — badge collection with locked and in-progress states. */
export function AchievementsScreen() {
  const back = useBack('profile');

  return (
    <Screen tabbed padTop={62} gap={13}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View>
          <Txt f="m" s={17} w={800}>
            {ACHIEVEMENTS_HEADER.title}
          </Txt>
          <Txt s={11} w={600} c={colors.textDim}>
            {ACHIEVEMENTS_HEADER.sub}
          </Txt>
        </View>
      </View>

      <ProgressBar
        pct={ACHIEVEMENTS_HEADER.pct}
        from={colors.warning}
        to={colors.orange}
        height={8}
      />

      <View style={styles.grid}>
        {ACHIEVEMENTS.map((a) => {
          const unlocked = a.pct === 100;
          const card = (
            <>
              <View
                style={[
                  styles.badge,
                  unlocked
                    ? {
                        backgroundColor: `${a.tint}33`,
                        borderColor: `${a.tint}80`,
                        boxShadow: `0px 8px 22px ${a.tint}40`,
                      }
                    : styles.badgeLocked,
                ]}>
                <Txt s={21} style={!unlocked && styles.lockedGlyph}>
                  {a.glyph}
                </Txt>
              </View>
              <Txt f="m" s={13} w={800} style={styles.name}>
                {a.name}
              </Txt>
              <Txt s={10.5} lh={1.4} c={colors.textDim} style={styles.sub}>
                {a.sub}
              </Txt>
              <ProgressBar pct={a.pct} from={a.tint} to={a.tint} height={4} style={styles.bar} />
              <Txt f="mono" s={9.5} w={700} c={colors.textFaint} style={styles.progress}>
                {a.progress}
              </Txt>
            </>
          );

          return unlocked ? (
            <Gradient
              key={a.name}
              deg={160}
              colors={[`${a.tint}26`, 'rgba(14,20,38,.95)']}
              style={[styles.card, { borderColor: `${a.tint}59` }]}>
              {card}
            </Gradient>
          ) : (
            <View key={a.name} style={[styles.card, styles.cardLocked]}>
              {card}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '48%', flexGrow: 1, padding: 14, borderRadius: radii.tile, borderWidth: 1 },
  cardLocked: { backgroundColor: colors.surface, borderColor: alpha.w07 },
  badge: {
    width: 46,
    height: 46,
    borderRadius: radii.input,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeLocked: {
    backgroundColor: alpha.w04,
    borderStyle: 'dashed',
    borderColor: alpha.w16,
  },
  lockedGlyph: { opacity: 0.6 },
  name: { marginTop: 10 },
  sub: { marginTop: 2 },
  bar: { marginTop: 9 },
  progress: { marginTop: 5 },
});
