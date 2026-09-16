import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { BackButton, PrimaryButton } from '../components/Buttons';
import { Card, StatTile } from '../components/Surfaces';
import { AnswerFeedback, QuizOption } from '../components/QuizOption';
import { StripeArt } from '../components/StripeArt';
import { Txt } from '../components/Txt';
import { alpha, colors, radii, shadows } from '../theme/tokens';
import { READING } from '../data/questions';
import { useQuiz } from '../state/useQuiz';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 13 · Okuma — passage with tappable words and a comprehension check. */
export function ReadScreen() {
  const { go } = useGo();
  const back = useBack('lesson');
  const { fire } = useApp();
  const q = READING.question;
  const quiz = useQuiz(q.answer, (_, correct) => {
    if (correct) fire(q.toast.title, q.toast.note);
  });

  return (
    <Screen padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View style={styles.flex}>
          <Txt f="m" s={16} w={800}>
            {READING.title}
          </Txt>
          <Txt s={11} w={600} c={colors.textDim}>
            {READING.meta}
          </Txt>
        </View>
        <View style={styles.fontBtn}>
          <Txt f="mono" s={11} w={700} c={colors.textDim}>
            Aa
          </Txt>
        </View>
      </View>

      <View style={styles.article}>
        <StripeArt
          label={READING.art}
          height={132}
          a="rgba(124,92,255,.14)"
          b="rgba(46,107,255,.08)"
          deg={25}
          band={9}
        />
        <Txt s={15} lh={1.75} c={colors.textBright}>
          {READING.passage.a}
          <Txt
            s={15}
            w={600}
            style={styles.tapWord}
            onPress={() => fire(READING.taps.journey.title, READING.taps.journey.note)}
            accessibilityRole="button">
            {READING.passage.word1}
          </Txt>
          {READING.passage.b}
          <Txt
            s={15}
            w={600}
            style={styles.tapWord2}
            onPress={() => fire(READING.taps.barely.title, READING.taps.barely.note)}
            accessibilityRole="button">
            {READING.passage.word2}
          </Txt>
          {READING.passage.c}
        </Txt>
        <Txt s={13} lh={1.7} c={colors.textFaint}>
          {READING.hint}
        </Txt>
      </View>

      <Card>
        <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.14}>
          {q.kicker}
        </Txt>
        <Txt f="m" s={17} w={700} lh={1.4}>
          {q.prompt}
        </Txt>
        {q.options.map((option, i) => (
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
            title={quiz.correct ? 'Doğru! +20 XP' : `Yanlış — doğrusu: ${q.options[q.answer]}`}
            note={q.toast.note}
            titleSize={13.5}
            noteSize={12}
            radius={radii.card}
          />
        ) : null}
      </Card>

      <View style={styles.stats}>
        {READING.stats.map((s, i) => (
          <StatTile
            key={s.label}
            value={s.value}
            label={s.label}
            tint={[colors.accent, colors.successSoft, colors.warning][i]}
          />
        ))}
      </View>

      <Spacer />

      <PrimaryButton
        label="Sonraki bölüm · Konuşma"
        height={54}
        size={15.5}
        shadow={shadows.ctaBrand}
        onPress={() => go('speak')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fontBtn: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: radii.chipSm,
    backgroundColor: alpha.w06,
  },
  article: {
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.section,
    padding: 18,
    gap: 12,
  },
  tapWord: {
    backgroundColor: 'rgba(46,107,255,.22)',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: colors.link,
  },
  tapWord2: {
    backgroundColor: 'rgba(124,92,255,.2)',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: colors.violetText,
  },
  stats: { flexDirection: 'row', gap: 9 },
});
