import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, PrimaryButton, TinyButton } from '../components/Buttons';
import { Card } from '../components/Surfaces';
import { AnswerFeedback, QuizOption } from '../components/QuizOption';
import { Txt } from '../components/Txt';
import { alpha, colors, radii, shadows } from '../theme/tokens';
import { GRAMMAR } from '../data/questions';
import { useQuiz } from '../state/useQuiz';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 11 · Gramer — concept → example → exercise → challenge. */
export function GrammarScreen() {
  const { go } = useGo();
  const back = useBack('lesson');
  const { fire } = useApp();
  const ex = GRAMMAR.exercise;
  const quiz = useQuiz(ex.answer, (_, correct) => {
    if (correct) fire(ex.toast.title, ex.toast.note);
  });

  return (
    <Screen padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View style={styles.flex}>
          <Txt f="m" s={16} w={800}>
            {GRAMMAR.title}
          </Txt>
          <Txt s={11} w={600} c={colors.textDim}>
            {GRAMMAR.flow}
          </Txt>
        </View>
        <View style={styles.levelTag}>
          <Txt f="mono" s={11} w={700} c={colors.violetSoft}>
            {GRAMMAR.level}
          </Txt>
        </View>
      </View>

      <View style={styles.steps}>
        <View style={[styles.step, { backgroundColor: colors.accent }]} />
        <View style={[styles.step, { backgroundColor: colors.accent }]} />
        <View style={[styles.step, { backgroundColor: colors.primary }]} />
        <View style={[styles.step, { backgroundColor: alpha.w10 }]} />
      </View>

      <Gradient
        deg={140}
        colors={['rgba(124,92,255,.22)', 'rgba(14,20,38,.92)']}
        style={styles.concept}>
        <Txt f="mono" s={10} w={700} c={colors.violetSoft} ls={0.14}>
          {GRAMMAR.concept.kicker}
        </Txt>
        <Txt f="m" s={21} w={800} lh={1.3}>
          {GRAMMAR.concept.leadIn}
          <Txt f="m" s={21} w={800} c={colors.accent}>
            {GRAMMAR.concept.highlight}
          </Txt>
          {GRAMMAR.concept.leadOut}
        </Txt>
        <View style={styles.formula}>
          <Txt f="mono" s={12} w={700} c={colors.accentSoft}>
            {GRAMMAR.concept.formulaLeft}
          </Txt>
          <Txt c={colors.textGhost}>+</Txt>
          <Txt f="mono" s={12} w={700} c={colors.violetSoft}>
            {GRAMMAR.concept.formulaRight}
          </Txt>
        </View>
        <Txt s={15} w={600}>
          {GRAMMAR.concept.exampleBefore}
          <Txt s={15} w={600} c={colors.accent}>
            {GRAMMAR.concept.exampleHighlight}
          </Txt>
          {GRAMMAR.concept.exampleAfter}
        </Txt>
        <Txt s={12.5} c={colors.textMuted}>
          {GRAMMAR.concept.exampleNote}
        </Txt>
      </Gradient>

      <Card>
        <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.14}>
          {ex.kicker}
        </Txt>
        <Txt f="m" s={19} w={700} lh={1.4}>
          {ex.question}
        </Txt>
        {ex.options.map((option, i) => (
          <QuizOption
            key={option}
            label={option}
            mark={quiz.markOf(i)}
            state={quiz.stateOf(i)}
            onPress={() => quiz.pick(i)}
          />
        ))}
        {quiz.answered ? (
          <AnswerFeedback
            correct={quiz.correct}
            title={quiz.correct ? ex.correctTitle : ex.wrongTitle}
            note={ex.note}
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
            {GRAMMAR.challenge.title}
          </Txt>
          <Txt s={11.5} c={colors.textDim}>
            {GRAMMAR.challenge.sub}
          </Txt>
        </View>
        <TinyButton
          label={GRAMMAR.challenge.cta}
          bg={colors.warning}
          color={colors.onLight}
          onPress={() => go('arena')}
        />
      </View>

      <PrimaryButton
        label="Sonraki bölüm · Dinleme"
        height={54}
        size={15.5}
        shadow={shadows.ctaBrand}
        onPress={() => go('listen')}
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
