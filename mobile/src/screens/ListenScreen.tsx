import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press, PrimaryButton } from '../components/Buttons';
import { Card } from '../components/Surfaces';
import { AnswerFeedback, QuizOption } from '../components/QuizOption';
import { GlossedText } from '../components/GlossedText';
import { ProgressBar } from '../components/Progress';
import { Waveform } from '../components/Waveform';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii, shadows } from '../theme/tokens';
import { listeningOf } from '../content';
import { useQuiz } from '../state/useQuiz';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

const SPEEDS = ['1×', '0.75×', '0.5×'];

/** 12 · Dinleme — player, transcript and comprehension questions. */
export function ListenScreen() {
  const { go } = useGo();
  const back = useBack('lesson');
  const { cefr, position, setPosition, fire } = useApp();

  const items = useMemo(() => listeningOf(cefr), [cefr]);
  const index = Math.min(position('listening', cefr), items.length - 1);
  const item = items[index];

  const [speedIndex, setSpeedIndex] = useState(0);
  // The transcript opens by default while there is no audio to listen to;
  // hiding it would leave the screen with nothing the learner can actually do.
  const [transcript, setTranscript] = useState(true);
  const [asked, setAsked] = useState(0);
  const [right, setRight] = useState(0);

  const question = item.questions[asked];
  const quiz = useQuiz(question.answer, (_, correct) => {
    if (correct) {
      setRight((n) => n + 1);
      fire('Doğru! +20 XP', question.note);
    }
  });

  const last = asked === item.questions.length - 1;

  const nextQuestion = () => {
    quiz.reset();
    if (last) {
      setPosition('listening', cefr, (index + 1) % items.length);
      setAsked(0);
      setRight(0);
      go('read');
      return;
    }
    setAsked((n) => n + 1);
  };

  return (
    <Screen padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View style={styles.flex}>
          <Txt f="m" s={16} w={800}>
            {item.title}
          </Txt>
          <Txt s={11} w={600} c={colors.textDim}>
            {item.level} · {item.lines.length} replik · {index + 1}/{items.length}
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
            onPress={() => fire('Ses kaydı hazırlanıyor', 'Şimdilik transkriptten çalışabilirsin')}
            accessibilityRole="button"
            accessibilityLabel="5 saniye geri"
            style={styles.smallBtn}>
            <Txt f="mono" s={12} w={700}>
              -5s
            </Txt>
          </Press>

          <Press
            onPress={() => fire('Ses kaydı henüz eklenmedi', 'Diyaloğu transkriptten okuyabilirsin')}
            accessibilityRole="button"
            accessibilityLabel="Oynat">
            <Gradient colors={gradients.cyan} style={styles.playBtn}>
              <Txt f="m" s={18} w={700}>
                ▶
              </Txt>
            </Gradient>
          </Press>

          <Press
            onPress={() => setSpeedIndex((i) => (i + 1) % SPEEDS.length)}
            accessibilityRole="button"
            accessibilityLabel="Oynatma hızı"
            style={styles.smallBtn}>
            <Txt f="mono" s={11} w={700}>
              {SPEEDS[speedIndex]}
            </Txt>
          </Press>
        </View>

        <View style={styles.scrubber}>
          <Txt f="mono" s={11} w={700} c={colors.textDim}>
            0:00
          </Txt>
          <ProgressBar
            pct={0}
            from={colors.accent}
            to={colors.primary}
            height={5}
            track={alpha.w12}
            style={styles.flex}
          />
          <Txt f="mono" s={11} w={700} c={colors.textDim}>
            {item.minutes}:00
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
          {item.lines.map((line, i) => (
            <View key={i} style={styles.line}>
              <Txt f="mono" s={10} w={700} c={colors.accentSoft} ls={0.08}>
                {line.who.toUpperCase()}
              </Txt>
              <GlossedText
                text={line.en}
                glossary={item.glossary}
                size={13.5}
                onWord={(gloss) => fire(gloss.w, gloss.tr)}
              />
              <Txt s={12} lh={1.6} c={colors.textDim}>
                {line.tr}
              </Txt>
            </View>
          ))}
        </View>
      ) : null}

      <Card>
        <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.14}>
          SORU {asked + 1}/{item.questions.length} · {right} doğru
        </Txt>
        <Txt f="m" s={17} w={700} lh={1.4}>
          {question.q}
        </Txt>
        {question.options.map((option, i) => (
          <QuizOption
            key={`${asked}-${option}`}
            label={option}
            mark={quiz.markOf(i)}
            state={quiz.stateOf(i)}
            onPress={() => quiz.pick(i)}
          />
        ))}
        {quiz.answered ? (
          <AnswerFeedback
            correct={quiz.correct}
            title={
              quiz.correct
                ? 'Doğru! +20 XP'
                : `Yanlış — doğrusu: ${question.options[question.answer]}`
            }
            note={question.note}
            titleSize={13.5}
            noteSize={12}
            radius={radii.card}
          />
        ) : null}
      </Card>

      <Spacer />

      <PrimaryButton
        label={last ? 'Sonraki bölüm · Okuma' : 'Sonraki soru'}
        height={54}
        size={15.5}
        shadow={shadows.ctaBrand}
        onPress={nextQuestion}
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
    gap: 14,
  },
  line: { gap: 3 },
});
