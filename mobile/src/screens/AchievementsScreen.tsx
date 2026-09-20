import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton } from '../components/Buttons';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { radii } from '../theme/tokens';
import { achievementsOf, facts, summarize } from '../content/achievements';
import { useApp } from '../state/AppContext';
import { useBack } from '../navigation/useGo';

/** 27 · Başarımlar — badge collection with locked and in-progress states. */
export function AchievementsScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const back = useBack('profile');
  const { positions, xp, streak } = useApp();

  const list = useMemo(
    () => achievementsOf(facts(positions, xp, streak)),
    [positions, xp, streak],
  );
  const summary = useMemo(() => summarize(list), [list]);

  return (
    <Screen tabbed padTop={62} gap={13}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View>
          <Txt f="m" s={17} w={800}>
            Başarımlar
          </Txt>
          <Txt s={11} w={600} c={t.colors.textDim}>
            {summary.unlocked} / {summary.total} açıldı
          </Txt>
        </View>
      </View>

      <ProgressBar pct={summary.pct} from={t.colors.warning} to={t.colors.orange} height={8} />

      <View style={styles.grid}>
        {list.map((a) => {
          const unlocked = a.done;
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
              <Txt s={10.5} lh={1.4} c={t.colors.textDim} style={styles.sub}>
                {a.sub}
              </Txt>
              <ProgressBar pct={a.pct} from={a.tint} to={a.tint} height={4} style={styles.bar} />
              <Txt f="mono" s={9.5} w={700} c={t.colors.textFaint} style={styles.progress}>
                {a.progress}
              </Txt>
            </>
          );

          return unlocked ? (
            <Gradient
              key={a.name}
              deg={160}
              colors={[`${a.tint}26`, tint(t.colors.surface, 0.95)]}
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

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    card: { width: '48%', flexGrow: 1, padding: 14, borderRadius: radii.tile, borderWidth: 1 },
    cardLocked: { backgroundColor: t.colors.surface, borderColor: t.alpha.w07 },
    badge: {
      width: 46,
      height: 46,
      borderRadius: radii.input,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    badgeLocked: {
      backgroundColor: t.alpha.w04,
      borderStyle: 'dashed',
      borderColor: t.alpha.w16,
    },
    lockedGlyph: { opacity: 0.6 },
    name: { marginTop: 10 },
    sub: { marginTop: 2 },
    bar: { marginTop: 9 },
    progress: { marginTop: 5 },
  });
