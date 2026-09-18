import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Glow } from '../components/Glow';
import { GhostButton, PrimaryButton } from '../components/Buttons';
import { ResultDonut, ProgressBar } from '../components/Progress';
import { FadeIn } from '../components/motion';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { LEVELS } from '../content';
import { PASS_RATIO } from '../content/score';
import { CEFR } from '../data/curriculum';
import { useApp } from '../state/AppContext';
import { useGo } from '../navigation/useGo';

/**
 * 05 · Test Sonucu — the level the test found, and how each level scored.
 *
 * The design showed a six-skill radar (reading, listening, speaking…). The
 * placement test is a grammar and usage test and measures none of those
 * separately, so the breakdown reports what was actually asked: the score at
 * each CEFR level.
 */
export function TestResultScreen() {
  const { go, reset } = useGo();
  const { testResult } = useApp();

  if (!testResult) {
    return (
      <Screen padTop={70} padH={22} padBottom={26} gap={18}>
        <Spacer />
        <Txt f="m" s={18} w={800} style={styles.center}>
          Henüz test çözmedin
        </Txt>
        <Txt s={13} lh={1.5} c={colors.textMuted} style={styles.center}>
          Seviyeni belirlemek için kısa testi çözebilirsin.
        </Txt>
        <Spacer />
        <PrimaryButton label="Teste başla" onPress={() => go('test')} />
        <GhostButton label="Şimdilik geç" onPress={() => reset('home')} />
      </Screen>
    );
  }

  const { level, byLevel, right, asked } = testResult;
  const summary = CEFR[level];

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
            pct={Math.round((right / asked) * 100)}
            level={level}
            caption="GENEL SEVİYE"
          />
        </View>
        <Txt s={13} lh={1.5} c={colors.textMuted} style={styles.summary}>
          {asked} sorudan {right} doğru. {summary.description}
        </Txt>
      </FadeIn>

      <Gradient deg={180} colors={gradients.card} style={styles.breakdown}>
        <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.14}>
          SEVİYE SEVİYE
        </Txt>
        {LEVELS.map((l) => {
          const bucket = byLevel[l];
          if (bucket.asked === 0) return null;
          const pct = Math.round((bucket.right / bucket.asked) * 100);
          const passed = bucket.right / bucket.asked >= PASS_RATIO;
          return (
            <View key={l} style={styles.skillRow}>
              <View style={styles.skillHead}>
                <Txt s={11.5} w={600} c={colors.textSubtle}>
                  {l}
                </Txt>
                <Txt f="m" s={11.5} w={700} c={passed ? colors.mintSoft : colors.textDim}>
                  {bucket.right}/{bucket.asked}
                </Txt>
              </View>
              <ProgressBar
                pct={pct}
                height={5}
                from={passed ? colors.success : colors.warning}
                to={passed ? colors.accent : colors.warningText}
              />
            </View>
          );
        })}
      </Gradient>

      <View style={styles.note}>
        <Txt s={11.5} lh={1.55} c={colors.textDim}>
          Seviyen, alt seviyeleri de geçtiğin en yüksek basamak olarak belirlenir. Tek tek
          doğru bilinen ileri sorular seviyeyi yukarı çekmez.
        </Txt>
      </View>

      <Spacer />

      <PrimaryButton label={`${level} müfredatımı başlat`} onPress={() => reset('home')} />
      <GhostButton label="Testi tekrar çöz" onPress={() => go('test')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  hero: { alignItems: 'center' },
  donutWrap: { marginTop: 14, alignItems: 'center', justifyContent: 'center' },
  donutGlow: { position: 'absolute', top: -18, left: -18, right: -18, bottom: -18 },
  summary: { marginTop: 12, textAlign: 'center', paddingHorizontal: 10 },
  breakdown: {
    gap: 9,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.hero,
    padding: 18,
  },
  skillRow: { gap: 4 },
  skillHead: { flexDirection: 'row', justifyContent: 'space-between' },
  note: {
    backgroundColor: alpha.w04,
    borderRadius: radii.input,
    padding: 13,
  },
});
