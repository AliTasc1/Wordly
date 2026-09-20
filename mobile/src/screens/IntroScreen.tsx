import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen, Spacer } from '../components/Screen';
import { Press, PrimaryButton } from '../components/Buttons';
import { DashedRing, StripeArt } from '../components/StripeArt';
import { Txt } from '../components/Txt';
import { radii } from '../theme/tokens';
import { INTRO } from '../data/onboarding';
import { useGo } from '../navigation/useGo';

/** 02 · Tanıtım — value proposition and social proof. */
export function IntroScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();

  return (
    <Screen
      padTop={76}
      padH={24}
      padBottom={32}
      gap={24}
      glows={[
        { rx: 210, ry: 160, cx: 0.8, cy: 0.08, color: t.colors.accent, opacity: 0.14, stop: 0.62 },
      ]}>
      <View style={styles.topRow}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Press onPress={() => go('goal')} scale={0.96}>
          <Txt s={13} w={600} c={t.colors.textDim}>
            {INTRO.skip}
          </Txt>
        </Press>
      </View>

      <StripeArt label={INTRO.art} height={300} radius={radii.screen}>
        <View style={styles.ringWrap} pointerEvents="none">
          <DashedRing />
        </View>
      </StripeArt>

      <View style={styles.copy}>
        <Txt f="m" s={30} w={800} lh={1.18} ls={-0.02}>
          {INTRO.title}
        </Txt>
        <Txt s={14.5} lh={1.55} c={t.colors.textDim}>
          {INTRO.body}
        </Txt>
      </View>

      <View style={styles.stats}>
        {INTRO.stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Txt f="m" s={19} w={800} c={s.tint}>
              {s.value}
            </Txt>
            <Txt s={11} c={t.colors.textDim}>
              {s.label}
            </Txt>
          </View>
        ))}
      </View>

      <Spacer />
      <PrimaryButton label={INTRO.cta} onPress={() => go('goal')} />
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dots: { flexDirection: 'row', gap: 6 },
    dot: { width: 10, height: 5, borderRadius: 9, backgroundColor: t.alpha.w16 },
    dotActive: { width: 26, backgroundColor: t.colors.primary },
    ringWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    copy: { gap: 12 },
    stats: { flexDirection: 'row', gap: 10 },
    stat: {
      flex: 1,
      backgroundColor: t.alpha.w04,
      borderWidth: 1,
      borderColor: t.alpha.w07,
      borderRadius: radii.input,
      padding: 12,
    },
  });
