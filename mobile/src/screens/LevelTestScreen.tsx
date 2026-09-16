import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { PrimaryButton } from '../components/Buttons';
import { AnswerFeedback, QuizOption } from '../components/QuizOption';
import { Waveform } from '../components/Waveform';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { TEST_QUESTIONS } from '../data/questions';
import { useGo } from '../navigation/useGo';

const TOTAL = 20;
const LETTERS = ['A', 'B', 'C', 'D'];

/** 04 · Seviye Testi — adaptive 20-question placement test. */
export function LevelTestScreen() {
  const { go } = useGo();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const q = TEST_QUESTIONS[index % TEST_QUESTIONS.length];
  const correct = picked === q.answer;
  const last = index >= TEST_QUESTIONS.length - 1;

  const next = () => {
    if (picked === null) return;
    if (last) go('result');
    else {
      setIndex(index + 1);
      setPicked(null);
    }
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

  return (
    <Screen padTop={70} padH={22} padBottom={26} gap={18}>
      <View style={styles.header}>
        <Txt f="mono" s={12.5} w={700} c={colors.textDim}>
          SORU {index + 1} / {TOTAL}
        </Txt>
        <View style={styles.headerTags}>
          <View style={[styles.tag, styles.typeTag]}>
            <Txt f="m" s={11} w={700} c={colors.violetSoft}>
              {q.type}
            </Txt>
          </View>
          <View style={[styles.tag, styles.timerTag]}>
            <Txt f="mono" s={11} w={700} c={colors.warningText}>
              00:{q.timer}
            </Txt>
          </View>
        </View>
      </View>

      <View style={styles.dots}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i < index ? colors.accent : i === index ? colors.primary : alpha.w10,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.difficulty}>
        <Txt s={11.5} w={600} c={colors.textDim}>
          Zorluk
        </Txt>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.diffBar, { backgroundColor: i < 3 ? colors.warning : alpha.w12 }]}
          />
        ))}
        <Txt s={11.5} w={700}>
          {q.level}
        </Txt>
      </View>

      <Gradient deg={180} colors={gradients.card} style={styles.card}>
        <Txt s={12} w={600} c={colors.textFaint}>
          {q.prompt}
        </Txt>
        <Txt f="m" s={23} w={700} lh={1.35}>
          {q.emphasis ? (
            <>
              {q.text.split(q.emphasis)[0]}
              <Txt f="m" s={23} w={800}>
                {q.emphasis}
              </Txt>
              {q.text.split(q.emphasis)[1]}
            </>
          ) : (
            q.text
          )}
        </Txt>

        {q.audio ? (
          <View style={styles.player}>
            <Gradient colors={gradients.cyan} style={styles.playBtn}>
              <Txt f="m" s={15} w={700}>
                ▶
              </Txt>
            </Gradient>
            <Waveform height={30} style={styles.wave} />
            <Txt f="mono" s={11} w={700} c={colors.textDim}>
              0:06
            </Txt>
          </View>
        ) : null}
      </Gradient>

      <View style={styles.options}>
        {q.options.map((option, i) => (
          <QuizOption
            key={option}
            label={option}
            badge={LETTERS[i]}
            mark={markOf(i)}
            state={stateOf(i)}
            onPress={() => picked === null && setPicked(i)}
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

      <Spacer />

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: radii.chipSm, borderWidth: 1 },
  typeTag: { backgroundColor: 'rgba(124,92,255,.16)', borderColor: 'rgba(124,92,255,.32)' },
  timerTag: { backgroundColor: 'rgba(245,165,36,.14)', borderColor: 'rgba(245,165,36,.3)' },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { flex: 1, height: 4, borderRadius: 9 },
  difficulty: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  diffBar: { width: 14, height: 6, borderRadius: 2 },
  card: {
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.hero,
    padding: 22,
    gap: 14,
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(46,107,255,.1)',
    borderWidth: 1,
    borderColor: 'rgba(46,107,255,.26)',
    borderRadius: radii.input,
    padding: 12,
  },
  playBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  wave: { flex: 1 },
  options: { gap: 10 },
});
