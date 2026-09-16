import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Glow } from '../components/Glow';
import { GhostButton, PrimaryButton } from '../components/Buttons';
import { ResultDonut, SkillRadar, ProgressBar } from '../components/Progress';
import { FadeIn } from '../components/motion';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { TEST_RESULT } from '../data/questions';
import { useGo } from '../navigation/useGo';

/** 05 · Test Sonucu — CEFR level, six-skill breakdown and the radar. */
export function TestResultScreen() {
  const { go, reset } = useGo();

  return (
    <Screen
      padTop={70}
      padH={22}
      padBottom={26}
      gap={18}
      glows={[
        { rx: 230, ry: 170, cx: 0.5, cy: 0.12, color: colors.primary, opacity: 0.26, stop: 0.64 },
      ]}>
      <FadeIn style={styles.hero}>
        <Txt f="mono" s={11.5} w={700} c={colors.textDim} ls={0.16}>
          SEVİYE TESTİ TAMAMLANDI
        </Txt>
        <View style={styles.donutWrap}>
          <View style={styles.donutGlow} pointerEvents="none">
            <Glow
              glows={[
                { rx: 92, ry: 92, cx: 0.5, cy: 0.5, color: colors.secondary, opacity: 0.5, stop: 1 },
              ]}
            />
          </View>
          <ResultDonut
            pct={TEST_RESULT.ringPct}
            level={TEST_RESULT.level}
            caption="GENEL SEVİYE"
          />
        </View>
        <Txt s={13} lh={1.5} c={colors.textMuted} style={styles.summary}>
          {TEST_RESULT.summary}
        </Txt>
      </FadeIn>

      <Gradient deg={180} colors={gradients.card} style={styles.breakdown}>
        <SkillRadar />
        <View style={styles.skills}>
          {TEST_RESULT.skills.map((s) => (
            <View key={s.name} style={styles.skillRow}>
              <View style={styles.skillHead}>
                <Txt s={11.5} w={600} c={colors.textSubtle}>
                  {s.name}
                </Txt>
                <Txt f="m" s={11.5} w={700}>
                  {s.level}
                </Txt>
              </View>
              <ProgressBar pct={s.pct} height={5} />
            </View>
          ))}
        </View>
      </Gradient>

      <View style={styles.callouts}>
        <View style={[styles.callout, styles.strength]}>
          <Txt s={11} w={700} c={colors.successSoft}>
            {TEST_RESULT.strength.label}
          </Txt>
          <Txt f="m" s={15} w={800} style={styles.calloutValue}>
            {TEST_RESULT.strength.value}
          </Txt>
        </View>
        <View style={[styles.callout, styles.focus]}>
          <Txt s={11} w={700} c={colors.errorSoft}>
            {TEST_RESULT.focus.label}
          </Txt>
          <Txt f="m" s={15} w={800} style={styles.calloutValue}>
            {TEST_RESULT.focus.value}
          </Txt>
        </View>
      </View>

      <Spacer />

      <PrimaryButton label="B1 müfredatımı başlat" onPress={() => reset('home')} />
      <GhostButton label="Testi tekrar çöz" onPress={() => go('test')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  donutWrap: { marginTop: 14, alignItems: 'center', justifyContent: 'center' },
  donutGlow: { position: 'absolute', top: -18, left: -18, right: -18, bottom: -18 },
  summary: { marginTop: 12, textAlign: 'center', paddingHorizontal: 10 },
  breakdown: {
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.hero,
    padding: 18,
  },
  skills: { flex: 1, gap: 9, justifyContent: 'center' },
  skillRow: { gap: 4 },
  skillHead: { flexDirection: 'row', justifyContent: 'space-between' },
  callouts: { flexDirection: 'row', gap: 10 },
  callout: { flex: 1, borderRadius: radii.input, padding: 13, borderWidth: 1 },
  strength: { backgroundColor: 'rgba(34,197,94,.1)', borderColor: 'rgba(34,197,94,.28)' },
  focus: { backgroundColor: 'rgba(255,77,94,.1)', borderColor: 'rgba(255,77,94,.28)' },
  calloutValue: { marginTop: 3 },
});
