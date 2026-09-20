import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, TinyButton } from '../components/Buttons';
import { Card } from '../components/Surfaces';
import { AnswerFeedback, QuizOption } from '../components/QuizOption';
import { StepFooter } from '../components/StepFooter';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { grammarOf } from '../content';
import { useQuiz } from '../state/useQuiz';
import { useApp } from '../state/AppContext';
import { useStudySession } from '../state/useStudySession';
import { useBack, useGo } from '../navigation/useGo';

/** 11 · Gramer — concept → examples → mistakes → exercises. */
export function GrammarScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  useStudySession();
  const { go } = useGo();
  const back = useBack('lesson');
  const { cefr, position, setPosition, fire, award, recordMistake } = useApp();

  const lessons = useMemo(() => grammarOf(cefr), [cefr]);
  const index = Math.min(position('grammar', cefr), lessons.length - 1);
  const lesson = lessons[index];

  const [asked, setAsked] = useState(0);
  const exercise = lesson.exercises[asked];
  const quiz = useQuiz(exercise.answer, (_, correct) => {
    if (correct) {
      award(15);
      fire('Doğru! +15 XP', exercise.note);
      return;
    }
    recordMistake({
      kind: 'grammar',
      level: cefr,
      id: lesson.id,
      q: asked,
      text: exercise.text,
      answer: exercise.options[exercise.answer],
    });
  });

  const last = asked === lesson.exercises.length - 1;

  const next = () => {
    quiz.reset();
    if (last) {
      setPosition('grammar', cefr, (index + 1) % lessons.length);
      setAsked(0);
      go('listen');
      return;
    }
    setAsked((n) => n + 1);
  };

  return (
    <Screen
      padTop={62}
      gap={14}
      footer={
        <StepFooter
          label={last ? 'Sonraki bölüm · Dinleme' : 'Sonraki alıştırma'}
          onPress={next}
          onExit={last ? back : undefined}
        />
      }>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View style={styles.flex}>
          <Txt f="m" s={font.callout} w={800}>
            {lesson.title}
          </Txt>
          <Txt s={font.caption} w={600} c={t.colors.textDim}>
            {lesson.topic}
          </Txt>
        </View>
        <View style={styles.levelTag}>
          <Txt f="mono" s={font.caption} w={700} c={t.colors.violetSoft}>
            {lesson.level} · {index + 1}/{lessons.length}
          </Txt>
        </View>
      </View>

      <View style={styles.steps}>
        {lesson.exercises.map((_, i) => (
          <View
            key={i}
            style={[
              styles.step,
              {
                backgroundColor:
                  i < asked ? t.colors.accent : i === asked ? t.colors.primary : t.alpha.w10,
              },
            ]}
          />
        ))}
      </View>

      <Gradient
        deg={140}
        colors={[tint(t.colors.secondary, 0.22), tint(t.colors.surface, 0.92)]}
        style={styles.concept}>
        <Txt f="mono" s={font.label} w={700} c={t.colors.violetSoft} ls={0.14}>
          KURAL
        </Txt>
        <Txt s={font.body} lh={1.6} c={t.colors.textBright}>
          {lesson.concept.summary}
        </Txt>
        {lesson.concept.formula ? (
          <View style={styles.formula}>
            <Txt f="mono" s={font.caption} w={700} c={t.colors.accentSoft}>
              {lesson.concept.formula.left}
            </Txt>
            <Txt c={t.colors.textGhost}>+</Txt>
            <Txt f="mono" s={font.caption} w={700} c={t.colors.violetSoft}>
              {lesson.concept.formula.right}
            </Txt>
          </View>
        ) : null}
        <View style={styles.canDo}>
          <Txt f="mono" s={font.label} w={700} c={t.colors.mintSoft} ls={0.1}>
            ARTIK YAPABİLİRSİN
          </Txt>
          <Txt s={font.footnote} lh={1.55} c={t.colors.textMuted} style={styles.canDoBody}>
            {lesson.canDo}
          </Txt>
        </View>
      </Gradient>

      <View style={styles.examples}>
        <Txt f="mono" s={font.label} w={700} c={t.colors.textFaint} ls={0.14}>
          ÖRNEKLER
        </Txt>
        {lesson.examples.map((example) => (
          <View key={example.en} style={styles.example}>
            <Txt s={font.body} w={600} lh={1.5}>
              {example.en}
            </Txt>
            <Txt s={font.footnote} lh={1.5} c={t.colors.textDim}>
              {example.tr}
            </Txt>
            {example.note ? (
              <Txt s={font.caption} lh={1.5} c={t.colors.textFaint}>
                {example.note}
              </Txt>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.mistakes}>
        <Txt f="mono" s={font.label} w={700} c={t.colors.errorTint} ls={0.14}>
          SIK YAPILAN HATA
        </Txt>
        {lesson.mistakes.map((mistake) => (
          <View key={mistake.wrong} style={styles.mistake}>
            <Txt s={font.body} w={600} lh={1.5} c={t.colors.errorTint} style={styles.wrong}>
              ✕ {mistake.wrong}
            </Txt>
            <Txt s={font.body} w={600} lh={1.5} c={t.colors.mintSoft}>
              ✓ {mistake.right}
            </Txt>
            <Txt s={font.caption} lh={1.5} c={t.colors.textDim}>
              {mistake.why}
            </Txt>
          </View>
        ))}
      </View>

      <Card>
        <Txt f="mono" s={font.label} w={700} c={t.colors.textFaint} ls={0.14}>
          ALIŞTIRMA {asked + 1}/{lesson.exercises.length}
        </Txt>
        <Txt f="m" s={font.headline} w={700} lh={1.4}>
          {exercise.text}
        </Txt>
        {exercise.options.map((option, i) => (
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
                ? 'Doğru! +15 XP'
                : `Yanlış — doğrusu: ${exercise.options[exercise.answer]}`
            }
            note={exercise.note}
            titleSize={13.5}
            noteSize={12}
            radius={radii.card}
          />
        ) : null}
      </Card>

      <View style={styles.challenge}>
        <View style={styles.challengeIcon}>
          <Txt s={font.title}>⚡</Txt>
        </View>
        <View style={styles.flex}>
          <Txt f="m" s={font.body} w={700}>
            Hızlı tur
          </Txt>
          <Txt s={font.caption} c={t.colors.textDim}>
            Arenada bu konuyu süreyle dene
          </Txt>
        </View>
        <TinyButton
          label="Başla"
          bg={t.colors.warning}
          color={t.colors.onLight}
          onPress={() => go('arena')}
        />
      </View>

    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    levelTag: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: radii.chipSm,
      backgroundColor: tint(t.colors.secondary, 0.18),
      borderWidth: 1,
      borderColor: tint(t.colors.secondary, 0.32),
    },
    steps: { flexDirection: 'row', gap: 6 },
    step: { flex: 1, height: 4, borderRadius: 9 },
    concept: {
      borderWidth: 1,
      borderColor: tint(t.colors.secondary, 0.3),
      borderRadius: radii.section,
      padding: 18,
      gap: 10,
    },
    formula: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: t.alpha.black28,
      borderRadius: radii.card,
      padding: 12,
    },
    canDo: {
      backgroundColor: tint(t.colors.success, 0.1),
      borderWidth: 1,
      borderColor: tint(t.colors.success, 0.24),
      borderRadius: radii.card,
      padding: 12,
    },
    canDoBody: { marginTop: 4 },
    examples: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.alpha.w08,
      borderRadius: radii.panel,
      padding: 16,
      gap: 12,
    },
    example: { gap: 2 },
    mistakes: {
      backgroundColor: tint(t.colors.error, 0.07),
      borderWidth: 1,
      borderColor: tint(t.colors.error, 0.2),
      borderRadius: radii.panel,
      padding: 16,
      gap: 12,
    },
    mistake: { gap: 2 },
    wrong: { textDecorationLine: 'line-through' },
    challenge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: tint(t.colors.warning, 0.1),
      borderWidth: 1,
      borderColor: tint(t.colors.warning, 0.28),
      borderRadius: radii.tile,
      padding: 14,
    },
    challengeIcon: {
      width: 42,
      height: 42,
      borderRadius: radii.card,
      backgroundColor: tint(t.colors.warning, 0.2),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
