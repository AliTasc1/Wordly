import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { press } from '../audio/feel';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press } from '../components/Buttons';
import { LiveWaveform, REC_WAVE, Waveform } from '../components/Waveform';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { speakingOf } from '../content';
import { useApp } from '../state/AppContext';
import { useStudySession } from '../state/useStudySession';
import { primeVoices, speakLine, stopSpeech } from '../audio/speech';
import { useRecorder } from '../audio/recorder';
import { useBack } from '../navigation/useGo';

/** Saniyeyi `0:07` biçiminde yazar. */
function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

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
  useStudySession();
  const back = useBack('lesson');
  const { cefr, position, setPosition, fire } = useApp();

  // Ekrandan çıkınca model ses susmalı.
  useEffect(() => {
    primeVoices();
    return stopSpeech;
  }, []);

  const items = useMemo(() => speakingOf(cefr), [cefr]);
  const index = Math.min(position('speaking', cefr), items.length - 1);
  const item = items[index];

  const recorder = useRecorder();
  const [step, setStep] = useState(0);
  const [phrases, setPhrases] = useState(false);

  const last = step === item.prompts.length - 1;

  /** Bulunulan yönergenin model okunuşu — kendi kaydıyla karşılaştırmak için. */
  const sayPrompt = () => {
    press();
    speakLine(item.prompts[step], { level: item.level });
  };

  const nextStep = () => {
    recorder.discard();
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
        {
          rx: 210,
          ry: 160,
          cx: 0.5,
          cy: 0.08,
          color: colors.secondary,
          opacity: 0.24,
          stop: 0.62,
        },
      ]}
      footer={
        <View style={styles.recorder}>
          <Txt s={12} w={600} c={colors.textDim}>
            {recorder.phase === 'recording'
              ? `Kaydediliyor · ${clock(recorder.seconds)}`
              : recorder.phase === 'ready'
                ? 'Kaydın hazır — model sesle karşılaştır'
                : recorder.phase === 'asking'
                  ? 'Mikrofon izni bekleniyor…'
                  : 'Cevabını yüksek sesle söyle'}
          </Txt>

          {/* Dalga artık mikrofondan geliyor: sessizlikte düzleşiyor. Eskiden
              sabit bir desen oynuyordu ve mikrofon kapalıyken bile kıpırdayıp
              sesin alındığına dair yanlış bir güvence veriyordu. */}
          {recorder.phase === 'recording' ? (
            <LiveWaveform
              level={recorder.level}
              tick={recorder.tick}
              height={36}
              style={styles.recWave}
            />
          ) : (
            <Waveform heights={REC_WAVE} idle height={36} style={styles.recWave} />
          )}

          <Press
            onPress={recorder.phase === 'recording' ? recorder.stop : recorder.start}
            disabled={recorder.phase === 'asking'}
            scale={0.95}
            accessibilityRole="button"
            accessibilityLabel={
              recorder.phase === 'recording' ? 'Kaydı durdur' : 'Kayda başla'
            }>
            <Gradient
              colors={recorder.phase === 'recording' ? gradients.danger : gradients.brand}
              style={[
                styles.mic,
                recorder.phase === 'recording' ? styles.micLive : styles.micIdle,
              ]}>
              <Txt s={recorder.phase === 'recording' ? 24 : 28}>
                {recorder.phase === 'recording' ? '■' : '🎙'}
              </Txt>
            </Gradient>
          </Press>

          {/* Kayıt varken karşılaştırma: kendi sesi ve model ses yan yana.
              Puan vermiyoruz — konuşma tanıma servisi olmadan üretilecek her
              sayı uydurma olurdu. Kararı öğrencinin kulağına bırakmak hem
              dürüst hem öğretici. */}
          {recorder.phase === 'ready' ? (
            <View style={styles.compare}>
              <Press onPress={recorder.playBack} style={styles.compareButton}>
                <Txt f="m" s={12.5} w={700} c={colors.text}>
                  ▶ Kendi sesin
                </Txt>
              </Press>
              <Press onPress={sayPrompt} style={styles.compareButton}>
                <Txt f="m" s={12.5} w={700} c={colors.accentSoft}>
                  ▶ Model ses
                </Txt>
              </Press>
              <Press onPress={recorder.discard} style={styles.compareGhost}>
                <Txt f="m" s={12.5} w={700} c={colors.textGhost}>
                  Tekrar dene
                </Txt>
              </Press>
            </View>
          ) : null}

          {recorder.problem ? (
            <Txt s={11} lh={1.5} c={colors.errorTint} style={styles.recNote}>
              {recorder.problem}
            </Txt>
          ) : (
            <Txt s={11} lh={1.5} c={colors.textFaint} style={styles.recNote}>
              Otomatik telaffuz puanı henüz açık değil. Kaydını model sesle karşılaştırarak
              çalış.
            </Txt>
          )}

          <Press onPress={nextStep} style={styles.recAction}>
            <Txt f="m" s={12} w={700} c={colors.textSubtle}>
              {last ? 'Senaryoyu bitir' : 'Sonraki yönerge'}
            </Txt>
          </Press>
        </View>
      }>
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
              <Press
                key={phrase.en}
                scale={0.995}
                onPress={() => speakLine(phrase.en, { level: item.level })}
                accessibilityRole="button"
                accessibilityLabel={`Kalıbı dinle: ${phrase.en}`}
                style={styles.phrase}>
                <View style={styles.phraseRow}>
                  <Txt s={13.5} w={600} lh={1.5} style={styles.flex}>
                    {phrase.en}
                  </Txt>
                  <Txt s={12}>🔊</Txt>
                </View>
                <Txt s={12} lh={1.5} c={colors.textDim}>
                  {phrase.tr}
                </Txt>
              </Press>
            ))}
          </View>
        ) : null}
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
  phraseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recorder: { paddingTop: 16, paddingHorizontal: 18, alignItems: 'center', gap: 12 },
  recWave: { width: '100%' },
  mic: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIdle: {
    boxShadow:
      '0px 0px 0px 10px rgba(46,107,255,.12), 0px 18px 40px rgba(46,107,255,.42)',
  },
  micLive: {
    boxShadow: '0px 0px 0px 12px rgba(255,77,94,.16), 0px 18px 40px rgba(255,77,94,.4)',
  },
  recNote: { marginTop: -4 },
  compare: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  compareButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: alpha.w14,
    backgroundColor: alpha.w06,
  },
  compareGhost: { paddingVertical: 10, paddingHorizontal: 10 },
  recAction: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: alpha.w12,
    backgroundColor: alpha.w04,
  },
});
