import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press, PrimaryButton } from '../components/Buttons';
import { Card, Chip } from '../components/Surfaces';
import { ProgressBar } from '../components/Progress';
import { Waveform } from '../components/Waveform';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii, shadows } from '../theme/tokens';
import { LISTENING } from '../data/questions';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 12 · Dinleme — player, speed control, transcript and a cloze. */
export function ListenScreen() {
  const { go } = useGo();
  const back = useBack('lesson');
  const { fire } = useApp();

  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [transcript, setTranscript] = useState(false);
  const [blank, setBlank] = useState<number | null>(null);

  const cloze = LISTENING.cloze;
  const blankText = blank === null ? cloze.placeholder : cloze.options[blank];
  const blankCorrect = blank === cloze.answer;

  return (
    <Screen padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View style={styles.flex}>
          <Txt f="m" s={16} w={800}>
            {LISTENING.title}
          </Txt>
          <Txt s={11} w={600} c={colors.textDim}>
            {LISTENING.meta}
          </Txt>
        </View>
      </View>

      <Gradient
        deg={150}
        colors={['rgba(34,211,238,.18)', 'rgba(14,20,38,.94)']}
        style={styles.player}>
        <Waveform tall height={72} />

        <View style={styles.controls}>
          <Press
            onPress={() => fire('5 saniye geri', 'Tekrar dinliyorsun')}
            accessibilityRole="button"
            accessibilityLabel="5 saniye geri"
            style={styles.smallBtn}>
            <Txt f="mono" s={12} w={700}>
              -5s
            </Txt>
          </Press>

          <Press
            onPress={() => setPlaying((p) => !p)}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Duraklat' : 'Oynat'}>
            <Gradient colors={gradients.cyan} style={styles.playBtn}>
              <Txt f="m" s={18} w={700}>
                {playing ? '❚❚' : '▶'}
              </Txt>
            </Gradient>
          </Press>

          <Press
            onPress={() => setSpeedIndex((i) => (i + 1) % LISTENING.speeds.length)}
            accessibilityRole="button"
            accessibilityLabel="Oynatma hızı"
            style={styles.smallBtn}>
            <Txt f="mono" s={11} w={700}>
              {LISTENING.speeds[speedIndex]}
            </Txt>
          </Press>
        </View>

        <View style={styles.scrubber}>
          <Txt f="mono" s={11} w={700} c={colors.textDim}>
            {LISTENING.elapsed}
          </Txt>
          <ProgressBar
            pct={LISTENING.progress}
            from={colors.accent}
            to={colors.primary}
            height={5}
            track={alpha.w12}
            style={styles.flex}
          />
          <Txt f="mono" s={11} w={700} c={colors.textDim}>
            {LISTENING.duration}
          </Txt>
        </View>
      </Gradient>

      <Press
        onPress={() => setTranscript((t) => !t)}
        scale={0.99}
        accessibilityRole="button"
        accessibilityState={{ expanded: transcript }}
        style={styles.transcriptToggle}>
        <Txt s={15}>📝</Txt>
        <Txt f="m" s={13} w={700} style={styles.flex}>
          Transkript
        </Txt>
        <Txt f="mono" s={11} w={700} c={colors.textDim}>
          {transcript ? 'GİZLE' : 'GÖSTER'}
        </Txt>
      </Press>

      {transcript ? (
        <View style={styles.transcript}>
          <Txt s={13.5} lh={1.6} c={colors.textBright}>
            {LISTENING.transcript.before}
            <Txt s={13.5} lh={1.6} style={styles.highlight}>
              {LISTENING.transcript.highlight}
            </Txt>
            {LISTENING.transcript.after}
          </Txt>
          <Txt s={12} lh={1.6} c={colors.textDim}>
            {LISTENING.transcript.translation}
          </Txt>
        </View>
      ) : null}

      <Card>
        <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.14}>
          {cloze.kicker}
        </Txt>
        <Txt s={16.5} w={600} lh={1.6}>
          {cloze.before}
          <Txt
            s={16.5}
            w={700}
            c={
              blank === null
                ? colors.textGhost
                : blankCorrect
                  ? colors.mintSoft
                  : colors.errorTint
            }
            style={
              blank === null
                ? styles.blankIdle
                : blankCorrect
                  ? styles.blankOk
                  : styles.blankBad
            }>
            {blankText}
          </Txt>
          {cloze.after}
        </Txt>
        <View style={styles.clozeOptions}>
          {cloze.options.map((option, i) => (
            <Chip
              key={option}
              label={option}
              active={blank === i}
              padV={10}
              padH={13}
              onPress={() => {
                setBlank(i);
                const toast = i === cloze.answer ? cloze.correctToast : cloze.wrongToast;
                fire(toast.title, toast.note);
              }}
            />
          ))}
        </View>
      </Card>

      <Spacer />

      <PrimaryButton
        label="Sonraki bölüm · Okuma"
        height={54}
        size={15.5}
        shadow={shadows.ctaBrand}
        onPress={() => go('read')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  player: {
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,.28)',
    borderRadius: radii.hero,
    padding: 20,
    gap: 16,
  },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 14, justifyContent: 'center' },
  smallBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: alpha.w14,
    backgroundColor: alpha.w05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.ctaCyan,
  },
  scrubber: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  transcriptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.input,
    padding: 13,
  },
  transcript: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.panel,
    padding: 15,
    gap: 10,
  },
  highlight: { backgroundColor: 'rgba(46,107,255,.28)' },
  blankIdle: { backgroundColor: alpha.w08 },
  blankOk: { backgroundColor: 'rgba(34,197,94,.22)' },
  blankBad: { backgroundColor: 'rgba(255,77,94,.22)' },
  clozeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
