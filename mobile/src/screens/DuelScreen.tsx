import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Avatar } from '../components/Avatar';
import { QuizOption } from '../components/QuizOption';
import { Pulse } from '../components/motion';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii, shadows } from '../theme/tokens';
import { DUEL } from '../data/questions';
import { useQuiz } from '../state/useQuiz';
import { useApp } from '../state/AppContext';

/** 18 · Düello — live 1v1 with a combo multiplier. */
export function DuelScreen() {
  const { fire, game, duelCorrect } = useApp();
  const reward = 30 * game.combo;

  const quiz = useQuiz(DUEL.answer, (_, correct) => {
    if (!correct) return;
    const nextCombo = Math.min(game.combo + 1, 5);
    duelCorrect();
    fire(`+${reward} XP · Doğru`, `Öndesin! Kombo ×${nextCombo}`);
  });

  return (
    <Screen
      padTop={0}
      padH={0}
      padBottom={18}
      gap={0}
      glows={[
        { rx: 210, ry: 150, cx: 0.15, cy: 0.06, color: colors.primary, opacity: 0.3, stop: 0.62 },
        { rx: 210, ry: 150, cx: 0.88, cy: 0.06, color: colors.error, opacity: 0.24, stop: 0.62 },
      ]}>
      <View style={styles.header}>
        <View style={styles.player}>
          <Avatar
            initials={DUEL.me.initials}
            from={colors.primary}
            to={colors.secondary}
            size={42}
            radius={14}
          />
          <View>
            <Txt f="m" s={13.5} w={800}>
              {DUEL.me.name}
            </Txt>
            <Txt f="mono" s={10} w={600} c={colors.blueSoft}>
              {DUEL.me.meta}
            </Txt>
          </View>
        </View>

        <View style={styles.score}>
          <Txt f="m" s={26} w={800}>
            {game.duelMe} <Txt f="m" s={26} w={800} c={colors.textGhost}>:</Txt> {game.duelOp}
          </Txt>
          <Txt f="mono" s={10} w={700} c={colors.warningText}>
            00:{DUEL.time}
          </Txt>
        </View>

        <View style={[styles.player, styles.playerRight]}>
          <View style={styles.rightMeta}>
            <Txt f="m" s={13.5} w={800}>
              {DUEL.opponent.name}
            </Txt>
            <Txt f="mono" s={10} w={600} c={colors.errorSoft}>
              {DUEL.opponent.meta}
            </Txt>
          </View>
          <Avatar
            initials={DUEL.opponent.initials}
            from={colors.orange}
            to={colors.error}
            size={42}
            radius={14}
          />
        </View>
      </View>

      <View style={styles.bars}>
        <View style={[styles.barTrack, styles.barTrackMe]}>
          <Gradient
            deg={90}
            colors={[colors.secondary, colors.primary]}
            style={[styles.barFill, { width: `${Math.min(game.duelMe * 12, 100)}%` }]}
          />
        </View>
        <Txt f="mono" s={10} w={700} c={colors.textGhost}>
          {DUEL.questionNo}
        </Txt>
        <View style={styles.barTrack}>
          <Gradient
            deg={90}
            colors={gradients.danger}
            style={[styles.barFill, { width: `${Math.min(game.duelOp * 12, 100)}%` }]}
          />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.comboWrap}>
          <View style={styles.combo}>
            <Txt f="mono" s={11} w={700} c={colors.violetSoft}>
              KOMBO ×{game.combo} · +{reward} XP
            </Txt>
          </View>
        </View>

        <Gradient deg={180} colors={gradients.cardHigh} style={styles.card}>
          <Txt s={11.5} w={600} c={colors.textFaint}>
            {DUEL.prompt}
          </Txt>
          <Txt f="m" s={23} w={700} lh={1.4}>
            {DUEL.question}
          </Txt>
        </Gradient>

        {DUEL.options.map((option, i) => (
          <QuizOption
            key={option}
            label={option}
            mark={quiz.markOf(i)}
            state={quiz.stateOf(i)}
            onPress={() => quiz.pick(i)}
          />
        ))}

        <Spacer />

        <View style={styles.status}>
          <Avatar initials="G" from={colors.orange} to={colors.error} size={30} />
          <Txt s={12} w={600} c={colors.textSubtle} style={styles.flex}>
            {quiz.answered ? DUEL.answered : DUEL.waiting}
          </Txt>
          <View style={styles.typing}>
            <Pulse duration={1200} from={0.35} to={1} scaleTo={1}>
              <View style={styles.typingDot} />
            </Pulse>
            <View style={[styles.typingDot, styles.typingDim]} />
            <View style={[styles.typingDot, styles.typingDimmer]} />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 58,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  player: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  playerRight: { justifyContent: 'flex-end' },
  rightMeta: { alignItems: 'flex-end' },
  score: { alignItems: 'center' },
  bars: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18 },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 9,
    backgroundColor: alpha.w08,
    overflow: 'hidden',
  },
  barTrackMe: { alignItems: 'flex-end' },
  barFill: { height: '100%', borderRadius: 9 },
  body: { flex: 1, padding: 18, gap: 14 },
  comboWrap: { flexDirection: 'row', justifyContent: 'center' },
  combo: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.chip,
    backgroundColor: 'rgba(124,92,255,.18)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,.34)',
  },
  card: {
    borderWidth: 1,
    borderColor: alpha.w10,
    borderRadius: radii.hero,
    padding: 22,
    gap: 10,
    boxShadow: shadows.cardSoft,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: alpha.w04,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.input,
    padding: 12,
  },
  typing: { flexDirection: 'row', gap: 3 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.error },
  typingDim: { opacity: 0.5 },
  typingDimmer: { opacity: 0.25 },
});
