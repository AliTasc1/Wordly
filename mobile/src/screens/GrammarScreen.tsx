import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, PrimaryButton, TinyButton } from '../components/Buttons';
import { Card } from '../components/Surfaces';
import { AnswerFeedback, QuizOption } from '../components/QuizOption';
import { Txt } from '../components/Txt';
import { alpha, colors, radii, shadows } from '../theme/tokens';
import { grammarOf } from '../content';
import { useQuiz } from '../state/useQuiz';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 11 · Gramer — concept → examples → mistakes → exercises. */
export function GrammarScreen() {
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
    <Screen padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View style={styles.flex}>
          <Txt f="m" s={16} w={800}>
            {lesson.title}
          </Txt>
          <Txt s={11} w={600} c={colors.textDim}>
            {lesson.topic}
          </Txt>
        </View>
        <View style={styles.levelTag}>
          <Txt f="mono" s={11} w={700} c={colors.violetSoft}>
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
                  i < asked ? colors.accent : i === asked ? colors.primary : alpha.w10,
              },
            ]}
          />
        ))}
      </View>

      <Gradient
        deg={140}
        colors={['rgba(124,92,255,.22)', 'rgba(14,20,38,.92)']}
        style={styles.concept}>
        <Txt f="mono" s={10} w={700} c={colors.violetSoft} ls={0.14}>
          KURAL
        </Txt>
        <Txt s={14.5} lh={1.6} c={colors.textBright}>
          {lesson.concept.summary}
        </Txt>
        {lesson.concept.formula ? (
          <View style={styles.formula}>
            <Txt f="mono" s={12} w={700} c={colors.accentSoft}>
              {lesson.concept.formula.left}
            </Txt>
            <Txt c={colors.textGhost}>+</Txt>
            <Txt f="mono" s={12} w={700} c={colors.violetSoft}>
              {lesson.concept.formula.right}
            </Txt>
          </View>
        ) : null}
        <View style={styles.canDo}>
          <Txt f="mono" s={10} w={700} c={colors.mintSoft} ls={0.1}>
            ARTIK YAPABİLİRSİN
          </Txt>
          <Txt s={12.5} lh={1.55} c={colors.textMuted} style={styles.canDoBody}>
            {lesson.canDo}
          </Txt>
        </View>
      </Gradient>

      <View style={styles.examples}>
        <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.14}>
          ÖRNEKLER
        </Txt>
        {lesson.examples.map((example) => (
          <View key={example.en} style={styles.example}>
            <Txt s={14.5} w={600} lh={1.5}>
              {example.en}
            </Txt>
            <Txt s={12.5} lh={1.5} c={colors.textDim}>
              {example.tr}
            </Txt>
            {example.note ? (
              <Txt s={11.5} lh={1.5} c={colors.textFaint}>
                {example.note}
              </Txt>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.mistakes}>
        <Txt f="mono" s={10} w={700} c={colors.errorTint} ls={0.14}>
          SIK YAPILAN HATA
        </Txt>
        {lesson.mistakes.map((mistake) => (
          <View key={mistake.wrong} style={styles.mistake}>
            <Txt s={13.5} w={600} lh={1.5} c={colors.errorTint} style={styles.wrong}>
              ✕ {mistake.wrong}
            </Txt>
            <Txt s={13.5} w={600} lh={1.5} c={colors.mintSoft}>
              ✓ {mistake.right}
            </Txt>
            <Txt s={11.5} lh={1.5} c={colors.textDim}>
              {mistake.why}
            </Txt>
          </View>
        ))}
      </View>

      <Card>
        <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.14}>
          ALIŞTIRMA {asked + 1}/{lesson.exercises.length}
        </Txt>
        <Txt f="m" s={19} w={700} lh={1.4}>
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
          <Txt s={18}>⚡</Txt>
        </View>
        <View style={styles.flex}>
          <Txt f="m" s={13.5} w={700}>
            Hızlı tur
          </Txt>
          <Txt s={11.5} c={colors.textDim}>
            Arenada bu konuyu süreyle dene
          </Txt>
        </View>
        <TinyButton
          label="Başla"
          bg={colors.warning}
          color={colors.onLight}
          onPress={() => go('arena')}
        />
      </View>

      <PrimaryButton
        label={last ? 'Sonraki bölüm · Dinleme' : 'Sonraki alıştırma'}
        height={54}
        size={15.5}
        shadow={shadows.ctaBrand}
        onPress={next}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelTag: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.chipSm,
    backgroundColor: 'rgba(124,92,255,.18)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,.32)',
  },
  steps: { flexDirection: 'row', gap: 5 },
  step: { flex: 1, height: 4, borderRadius: 9 },
  concept: {
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,.3)',
    borderRadius: radii.section,
    padding: 18,
    gap: 10,
  },
  formula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,.28)',
    borderRadius: radii.card,
    padding: 12,
  },
  canDo: {
    backgroundColor: 'rgba(34,197,94,.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,.24)',
    borderRadius: radii.card,
    padding: 12,
  },
  canDoBody: { marginTop: 3 },
  examples: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.panel,
    padding: 15,
    gap: 12,
  },
  example: { gap: 2 },
  mistakes: {
    backgroundColor: 'rgba(255,77,94,.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,94,.2)',
    borderRadius: radii.panel,
    padding: 15,
    gap: 12,
  },
  mistake: { gap: 2 },
  wrong: { textDecorationLine: 'line-through' },
  challenge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245,165,36,.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,165,36,.28)',
    borderRadius: radii.tile,
    padding: 14,
  },
  challengeIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.card,
    backgroundColor: 'rgba(245,165,36,.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
