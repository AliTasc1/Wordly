import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen, Spacer } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press } from '../components/Buttons';
import { REC_WAVE, Waveform } from '../components/Waveform';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { speakingOf } from '../content';
import { useApp } from '../state/AppContext';
import { useBack } from '../navigation/useGo';

/**
 * 14 · Konuşma — a scenario, the prompts to answer, and the phrases to lean on.
 *
 * The design showed an AI partner replying in a chat and a five-axis
 * pronunciation score. Both need a backend that does not exist yet, and a
 * fabricated score would teach the learner nothing true about their speaking,
 * so the screen shows the real scenario content instead and says plainly that
 * scoring is not live.
 */
export function SpeakScreen() {
  const back = useBack('lesson');
  const { cefr, position, setPosition, fire } = useApp();

  const items = useMemo(() => speakingOf(cefr), [cefr]);
  const index = Math.min(position('speaking', cefr), items.length - 1);
  const item = items[index];

  const [recording, setRecording] = useState(false);
  const [step, setStep] = useState(0);
  const [phrases, setPhrases] = useState(false);

  const last = step === item.prompts.length - 1;

  const toggleRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (recording) fire('Kayıt alındı', 'Otomatik puanlama henüz açık değil');
    setRecording((r) => !r);
  };

  const nextStep = () => {
    setRecording(false);
    if (last) {
      setPosition('speaking', cefr, (index + 1) % items.length);
      setStep(0);
      setPhrases(false);
      fire('Senaryo tamamlandı', 'Sıradaki senaryo hazır');
      return;
    }
    setStep((n) => n + 1);
  };

  return (
    <Screen
      padTop={0}
      padH={0}
      padBottom={34}
      gap={0}
      glows={[
        { rx: 210, ry: 160, cx: 0.5, cy: 0.08, color: colors.secondary, opacity: 0.24, stop: 0.62 },
      ]}>
      <View style={styles.header}>
        <BackButton onPress={back} strong />
        <View style={styles.flex}>
          <Txt f="m" s={15} w={800}>
            {item.title}
          </Txt>
          <Txt s={11} w={600} c={colors.textDim}>
            {item.level} · {index + 1}/{items.length}
          </Txt>
        </View>
        <Press onPress={nextStep} style={styles.finish}>
          <Txt f="m" s={11.5} w={700} c={colors.textSubtle}>
            {last ? 'Bitir' : 'Atla'}
          </Txt>
        </Press>
      </View>

      <View style={styles.body}>
        <View style={styles.situation}>
          <Txt f="mono" s={10} w={700} c={colors.violetSoft} ls={0.12}>
            DURUM
          </Txt>
          <Txt s={14} lh={1.6} c={colors.textBright} style={styles.situationEn}>
            {item.situation}
          </Txt>
          <Txt s={12.5} lh={1.55} c={colors.textDim}>
            {item.situationTr}
          </Txt>
        </View>

        <View style={styles.promptCard}>
          <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.14}>
            YÖNERGE {step + 1}/{item.prompts.length}
          </Txt>
          <Txt f="m" s={18} w={700} lh={1.4} style={styles.promptEn}>
            {item.prompts[step]}
          </Txt>
          <Txt s={12.5} lh={1.55} c={colors.textDim}>
            {item.promptsTr[step]}
          </Txt>
        </View>

        <Press
          onPress={() => setPhrases((p) => !p)}
          scale={0.99}
          accessibilityRole="button"
          accessibilityState={{ expanded: phrases }}
          style={styles.phraseToggle}>
          <Txt s={15}>💬</Txt>
          <Txt f="m" s={13} w={700} style={styles.flex}>
            İşe yarar kalıplar
          </Txt>
          <Txt f="mono" s={11} w={700} c={colors.textDim}>
            {phrases ? 'GİZLE' : 'GÖSTER'}
          </Txt>
        </Press>

        {phrases ? (
          <View style={styles.phraseList}>
            {item.usefulPhrases.map((phrase) => (
              <View key={phrase.en} style={styles.phrase}>
                <Txt s={13.5} w={600} lh={1.5}>
                  {phrase.en}
                </Txt>
                <Txt s={12} lh={1.5} c={colors.textDim}>
                  {phrase.tr}
                </Txt>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <Spacer />

      <View style={styles.recorder}>
        <Txt s={12} w={600} c={colors.textDim}>
          {recording ? 'Kaydediliyor — yönergeyi cevapla' : 'Cevabını yüksek sesle söyle'}
        </Txt>
        <Waveform heights={REC_WAVE} idle={!recording} height={36} style={styles.recWave} />

        <Press
          onPress={toggleRecording}
          scale={0.95}
          accessibilityRole="button"
          accessibilityLabel={recording ? 'Kaydı durdur' : 'Kayda başla'}>
          <Gradient
            colors={recording ? gradients.danger : gradients.brand}
            style={[styles.mic, recording ? styles.micLive : styles.micIdle]}>
            <Txt s={recording ? 24 : 28}>{recording ? '■' : '🎙'}</Txt>
          </Gradient>
        </Press>

        <Txt s={11} c={colors.textFaint} style={styles.recNote}>
          Otomatik telaffuz puanı henüz açık değil.
        </Txt>

        <Press onPress={nextStep} style={styles.recAction}>
          <Txt f="m" s={12} w={700} c={colors.textSubtle}>
            {last ? 'Senaryoyu bitir' : 'Sonraki yönerge'}
          </Txt>
        </Press>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 62,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  finish: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: alpha.w14,
    backgroundColor: alpha.w05,
  },
  body: { paddingHorizontal: 18, gap: 12 },
  situation: {
    backgroundColor: 'rgba(124,92,255,.1)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,.26)',
    borderRadius: radii.section,
    padding: 15,
  },
  situationEn: { marginTop: 6, marginBottom: 4 },
  promptCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w10,
    borderRadius: radii.section,
    padding: 16,
  },
  promptEn: { marginTop: 7, marginBottom: 5 },
  phraseToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.input,
    padding: 13,
  },
  phraseList: {
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.panel,
    padding: 15,
    gap: 12,
  },
  phrase: { gap: 3 },
  recorder: { paddingTop: 16, paddingHorizontal: 18, alignItems: 'center', gap: 12 },
  recWave: { width: '100%' },
  mic: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  micIdle: {
    boxShadow: '0px 0px 0px 10px rgba(46,107,255,.12), 0px 18px 40px rgba(46,107,255,.42)',
  },
  micLive: {
    boxShadow: '0px 0px 0px 12px rgba(255,77,94,.16), 0px 18px 40px rgba(255,77,94,.4)',
  },
  recNote: { marginTop: -4 },
  recAction: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: alpha.w12,
    backgroundColor: alpha.w04,
  },
});
