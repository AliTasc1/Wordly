import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { BackButton, GhostButton, PrimaryButton } from '../components/Buttons';
import { Card, StatTile } from '../components/Surfaces';
import { AnswerFeedback, QuizOption } from '../components/QuizOption';
import { GlossedText } from '../components/GlossedText';
import { StripeArt } from '../components/StripeArt';
import { Txt } from '../components/Txt';
import { alpha, colors, radii, shadows } from '../theme/tokens';
import { readingOf } from '../content';
import { useQuiz } from '../state/useQuiz';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 13 · Okuma — passage with tappable words and a comprehension check. */
export function ReadScreen() {
  const { go } = useGo();
  const back = useBack('lesson');
  const { cefr, position, setPosition, fire, award, recordMistake } = useApp();

  const items = useMemo(() => readingOf(cefr), [cefr]);
  const index = Math.min(position('reading', cefr), items.length - 1);
  const item = items[index];

  const [asked, setAsked] = useState(0);
  const [right, setRight] = useState(0);
  const [showTr, setShowTr] = useState(false);
  const question = item.questions[asked];

  // The quiz hook locks on the first tap, so it has to be remounted for each
  // question. Keying it on the passage and question index does that.
  const quiz = useQuiz(question.answer, (_, correct) => {
    if (correct) {
      setRight((n) => n + 1);
      award(20);
      fire('Doğru! +20 XP', question.note);
      return;
    }
    recordMistake({
      kind: 'reading',
      level: cefr,
      id: item.id,
      q: asked,
      text: question.q,
      answer: question.options[question.answer],
    });
  });

  const last = asked === item.questions.length - 1;

  const nextQuestion = () => {
    // `useQuiz` locks after the first tap and keeps that lock in state, so the
    // lock has to be released explicitly before the next question is shown.
    quiz.reset();
    if (last) {
      setPosition('reading', cefr, (index + 1) % items.length);
      setAsked(0);
      setRight(0);
      setShowTr(false);
      go('speak');
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
            {item.level} · {item.minutes} dk · {index + 1}/{items.length}
          </Txt>
        </View>
        {item.textTr ? (
          <GhostButton
            label={showTr ? 'EN' : 'TR'}
            height={30}
            radius={radii.chipSm}
            size={11}
            fill={alpha.w06}
            onPress={() => setShowTr((v) => !v)}
          />
        ) : null}
      </View>

      <View style={styles.article}>
        <StripeArt
          label={item.titleEn}
          height={132}
          a="rgba(124,92,255,.14)"
          b="rgba(46,107,255,.08)"
          deg={25}
          band={9}
        />
        {showTr && item.textTr ? (
          <Txt s={15} lh={1.75} c={colors.textBright}>
            {item.textTr}
          </Txt>
        ) : (
          <GlossedText
            text={item.text}
            glossary={item.glossary}
            onWord={(gloss) => fire(gloss.w, gloss.tr)}
          />
        )}
        <Txt s={13} lh={1.7} c={colors.textFaint}>
          Altı çizili kelimelere dokunarak Türkçesini görebilirsin.
        </Txt>
      </View>

      <Card>
        <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.14}>
          SORU {asked + 1}/{item.questions.length}
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

      <View style={styles.stats}>
        <StatTile value={`${right}/${item.questions.length}`} label="doğru" tint={colors.accent} />
        <StatTile value={`${item.minutes} dk`} label="okuma süresi" tint={colors.successSoft} />
        <StatTile
          value={String(item.glossary.length)}
          label="yeni kelime"
          tint={colors.warning}
        />
      </View>

      <Spacer />

      <PrimaryButton
        label={last ? 'Sonraki bölüm · Konuşma' : 'Sonraki soru'}
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
  article: {
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.section,
    padding: 18,
    gap: 12,
  },
  stats: { flexDirection: 'row', gap: 9 },
});
