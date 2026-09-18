import React, { useEffect, useMemo, useState } from 'react';
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
import { primeVoices, speakLine, speakSequence, stopSpeech } from '../audio/speech';
import { clipsFor } from '../audio/clips';

const SPEEDS = [
  { label: '1×', value: 1 },
  { label: '0.75×', value: 0.75 },
  { label: '0.5×', value: 0.5 },
];

/** 12 · Dinleme — player, transcript and comprehension questions. */
export function ListenScreen() {
  const { go } = useGo();
  const back = useBack('lesson');
  const { cefr, position, setPosition, fire, award } = useApp();

  const items = useMemo(() => listeningOf(cefr), [cefr]);
  const index = Math.min(position('listening', cefr), items.length - 1);
  const item = items[index];

  const [speedIndex, setSpeedIndex] = useState(0);
  // The transcript starts hidden: this is a listening exercise, and reading
  // along from the first second turns it into a reading exercise. It is one
  // tap away for the learner who needs it.
  const [transcript, setTranscript] = useState(false);
  const [asked, setAsked] = useState(0);
  const [right, setRight] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(-1);

  // Konuşmacı başına ses seçimi cihazdan asenkron geliyor; ekran açılır
  // açılmaz istiyoruz ki ilk dokunuşta iki ses hazır olsun.
  useEffect(() => {
    primeVoices();
  }, []);

  // Ekrandan çıkılınca ya da başka bir diyaloğa geçilince ses susmalı,
  // yoksa okuma ekranında arka planda konuşmaya devam eder.
  useEffect(
    () => () => {
      stopSpeech();
    },
    [],
  );
  useEffect(() => {
    stopSpeech();
    setPlaying(false);
    setLine(-1);
  }, [item.id]);

  const speakers = useMemo(() => item.speakers ?? [], [item.speakers]);
  const speed = SPEEDS[speedIndex].value;

  // Bu diyaloğun üretilmiş sesi var mı? Yoksa cihazın kendi seslendirmesi
  // devreye giriyor; ekran ikisini de aynı biçimde kullanıyor.
  const clips = useMemo(() => clipsFor(item.id), [item.id]);
  const recorded = clips != null && clips.length === item.lines.length;

  /** Diyaloğu verilen replikten itibaren okur. */
  const play = (from: number) => {
    setPlaying(true);
    speakSequence(
      item.lines.map((l, i) => ({
        text: l.en,
        speaker: Math.max(speakers.indexOf(l.who), 0),
        clip: recorded ? clips![i] : undefined,
      })),
      {
        level: item.level,
        speed,
        from,
        onLine: setLine,
        onDone: () => {
          setPlaying(false);
          setLine(-1);
        },
      },
    );
  };

  const stop = () => {
    stopSpeech();
    setPlaying(false);
  };

  const question = item.questions[asked];
  const quiz = useQuiz(question.answer, (_, correct) => {
    if (correct) {
      setRight((n) => n + 1);
      award(20);
      fire('Doğru! +20 XP', question.note);
    }
  });

  const last = asked === item.questions.length - 1;

  const nextQuestion = () => {
    quiz.reset();
    if (last) {
      stop();
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
        <Waveform tall height={72} lit={playing ? (line + 1) / item.lines.length : 0} />

        <View style={styles.controls}>
          <Press
            onPress={() => play(Math.max(line, 0))}
            accessibilityRole="button"
            accessibilityLabel="Bu repliği tekrar dinle"
            style={styles.smallBtn}>
            <Txt f="mono" s={13} w={700}>
              ↺
            </Txt>
          </Press>

          <Press
            onPress={() => (playing ? stop() : play(0))}
            accessibilityRole="button"
            accessibilityState={{ selected: playing }}
            accessibilityLabel={playing ? 'Durdur' : 'Oynat'}>
            <Gradient colors={gradients.cyan} style={styles.playBtn}>
              <Txt f="m" s={18} w={700}>
                {playing ? '■' : '▶'}
              </Txt>
            </Gradient>
          </Press>

          <Press
            onPress={() => setSpeedIndex((i) => (i + 1) % SPEEDS.length)}
            accessibilityRole="button"
            accessibilityLabel="Oynatma hızı"
            style={styles.smallBtn}>
            <Txt f="mono" s={11} w={700}>
              {SPEEDS[speedIndex].label}
            </Txt>
          </Press>
        </View>

        <View style={styles.scrubber}>
          <Txt f="mono" s={11} w={700} c={colors.textDim}>
            {Math.max(line + 1, 0)}
          </Txt>
          <ProgressBar
            pct={playing ? ((line + 1) / item.lines.length) * 100 : 0}
            from={colors.accent}
            to={colors.primary}
            height={5}
            track={alpha.w12}
            style={styles.flex}
          />
          <Txt f="mono" s={11} w={700} c={colors.textDim}>
            {item.lines.length} replik
          </Txt>
        </View>

        {recorded ? null : (
          <Txt s={11} lh={1.5} c={colors.textFaint}>
            Bu diyaloğun kaydı henüz üretilmedi; cihazının kendi seslendirmesiyle
            okunuyor.
          </Txt>
        )}
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
          {item.lines.map((turn, i) => (
            <Press
              key={i}
              scale={0.995}
              onPress={() => {
                stop();
                setLine(i);
                speakLine(turn.en, {
                  level: item.level,
                  speaker: Math.max(speakers.indexOf(turn.who), 0),
                  speed,
                  clip: recorded ? clips![i] : undefined,
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`${turn.who}: repliği dinle`}
              style={[styles.line, i === line && styles.lineOn]}>
              <Txt f="mono" s={10} w={700} c={colors.accentSoft} ls={0.08}>
                {turn.who.toUpperCase()}
              </Txt>
              <GlossedText
                text={turn.en}
                glossary={item.glossary}
                size={13.5}
                onWord={(gloss) => fire(gloss.w, gloss.tr)}
              />
              <Txt s={12} lh={1.6} c={colors.textDim}>
                {turn.tr}
              </Txt>
            </Press>
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
  line: { gap: 3, borderRadius: radii.input, paddingHorizontal: 8, paddingVertical: 6 },
  // Okunmakta olan replik: öğrenci sesi hangi satırda olduğunu kaybetmesin.
  lineOn: { backgroundColor: alpha.w05, borderWidth: 1, borderColor: 'rgba(34,211,238,.35)' },
});
