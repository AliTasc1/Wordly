import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { PrimaryButton } from '../components/Buttons';
import { AnswerFeedback, QuizOption } from '../components/QuizOption';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { LEVELS, placement } from '../content';
import { scorePlacement } from '../content/score';
import { useApp } from '../state/AppContext';
import { useStudySession } from '../state/useStudySession';
import { useGo } from '../navigation/useGo';

const LETTERS = ['A', 'B', 'C', 'D'];

/** 04 · Seviye Testi — the 40-question placement test, easiest first. */
export function LevelTestScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  useStudySession();
  const { go } = useGo();
  const { setCefr, setTestResult } = useApp();

  const questions = useMemo(() => placement().questions, []);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => questions.map(() => null));

  const q = questions[index];
  const picked = picks[index];
  const correct = picked === q.answer;
  const last = index === questions.length - 1;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicks((cur) => cur.map((p, at) => (at === index ? i : p)));
  };

  const next = () => {
    if (picked === null) return;
    if (!last) {
      setIndex(index + 1);
      return;
    }
    const result = scorePlacement(questions, picks);
    setTestResult(result);
    setCefr(result.level);
    go('result');
  };

  const stateOf = (i: number) => {
    if (picked === null) return 'idle' as const;
    if (i === q.answer) return 'ok' as const;
    if (i === picked) return 'bad' as const;
    return 'off' as const;
  };

  const markOf = (i: number) => {
    if (picked === null) return '';
    if (i === q.answer) return '✓';
    if (i === picked) return '✕';
    return '';
  };

  // The test runs easiest first, so the position within the level list is a
  // truthful difficulty reading rather than a decorative one.
  const difficulty = LEVELS.indexOf(q.level) + 1;

  return (
    <Screen
      padTop={70}
      padH={22}
      padBottom={26}
      gap={18}
      footer={
        <PrimaryButton
          label={
            picked === null
              ? 'Bir seçenek seç'
              : last
                ? 'Testi bitir ve seviyemi gör'
                : 'Sonraki soru'
          }
          size={16}
          disabled={picked === null}
          onPress={next}
        />
      }>
      <View style={styles.header}>
        <Txt f="mono" s={font.footnote} w={700} c={t.colors.textDim}>
          SORU {index + 1} / {questions.length}
        </Txt>
        <View style={[styles.tag, styles.typeTag]}>
          <Txt f="m" s={font.caption} w={700} c={t.colors.violetSoft}>
            DİLBİLGİSİ
          </Txt>
        </View>
      </View>

      <View style={styles.dots}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i < index ? t.colors.accent : i === index ? t.colors.primary : t.alpha.w10,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.difficulty}>
        <Txt s={font.caption} w={600} c={t.colors.textDim}>
          Zorluk
        </Txt>
        {LEVELS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.diffBar,
              { backgroundColor: i < difficulty ? t.colors.warning : t.alpha.w12 },
            ]}
          />
        ))}
        <Txt s={font.caption} w={700}>
          {q.level}
        </Txt>
      </View>

      <Gradient deg={180} colors={t.gradients.card} style={styles.card}>
        <Txt s={font.caption} w={600} c={t.colors.textFaint}>
          Boşluğa gelecek doğru seçeneği işaretle
        </Txt>
        <Txt f="m" s={font.display} w={700} lh={1.35}>
          {q.text}
        </Txt>
      </Gradient>

      <View style={styles.options}>
        {q.options.map((option, i) => (
          <QuizOption
            key={`${index}-${option}`}
            label={option}
            badge={LETTERS[i]}
            mark={markOf(i)}
            state={stateOf(i)}
            onPress={() => pick(i)}
          />
        ))}
      </View>

      {picked !== null ? (
        <AnswerFeedback
          correct={correct}
          title={correct ? 'Doğru! +25 XP' : `Yanlış — doğrusu: ${q.options[q.answer]}`}
          note={q.note}
        />
      ) : null}
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    tag: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: radii.chipSm, borderWidth: 1 },
    typeTag: { backgroundColor: tint(t.colors.secondary, 0.16), borderColor: tint(t.colors.secondary, 0.32) },
    dots: { flexDirection: 'row', gap: 2 },
    dot: { flex: 1, height: 4, borderRadius: 9 },
    difficulty: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    diffBar: { width: 14, height: 6, borderRadius: 2 },
    card: {
      borderWidth: 1,
      borderColor: t.alpha.w08,
      borderRadius: radii.hero,
      padding: 22,
      gap: 14,
    },
    options: { gap: 10 },
  });
