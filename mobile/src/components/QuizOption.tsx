import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Press } from './Buttons';
import { Txt } from './Txt';
import { alpha, colors, radii } from '../theme/tokens';
import type { OptionState } from '../state/useQuiz';

/** `opt(state)` from the design logic. */
export function optionStyle(state: OptionState): ViewStyle {
  switch (state) {
    case 'ok':
      return { backgroundColor: 'rgba(34,197,94,.14)', borderColor: colors.success };
    case 'bad':
      return { backgroundColor: 'rgba(255,77,94,.14)', borderColor: colors.error };
    case 'off':
      return { backgroundColor: colors.surface, borderColor: alpha.w06, opacity: 0.5 };
    default:
      return { backgroundColor: colors.surface, borderColor: alpha.w09 };
  }
}

/** Border colour of the A/B/C/D badge, which tracks the option state. */
function badgeBorder(state: OptionState) {
  if (state === 'ok') return 'rgba(34,197,94,.3)';
  if (state === 'bad') return 'rgba(255,77,94,.3)';
  return alpha.w10;
}

export function QuizOption({
  label,
  mark,
  state,
  onPress,
  /** `A`–`D` badge, used on the level test only. */
  badge,
  style,
}: {
  label: string;
  mark: string;
  state: OptionState;
  onPress: () => void;
  badge?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Press
      onPress={onPress}
      scale={0.99}
      accessibilityRole="button"
      style={[styles.option, optionStyle(state), style]}>
      {badge ? (
        <View style={[styles.badge, { borderColor: badgeBorder(state) }]}>
          <Txt f="mono" s={11} w={700}>
            {badge}
          </Txt>
        </View>
      ) : null}
      <Txt s={14.5} w={600} style={styles.label}>
        {label}
      </Txt>
      <Txt f="m" s={14} w={700}>
        {mark}
      </Txt>
    </Press>
  );
}

/** The green/red feedback panel that follows an answer. */
export function AnswerFeedback({
  correct,
  title,
  note,
  titleSize = 14,
  noteSize = 12.5,
  radius = radii.input,
}: {
  correct: boolean;
  title: string;
  note: string;
  titleSize?: number;
  noteSize?: number;
  radius?: number;
}) {
  return (
    <View
      style={[
        styles.feedback,
        { borderRadius: radius },
        correct
          ? { backgroundColor: 'rgba(34,197,94,.14)', borderColor: 'rgba(34,197,94,.36)' }
          : { backgroundColor: 'rgba(255,77,94,.13)', borderColor: 'rgba(255,77,94,.34)' },
      ]}>
      <Txt f="m" s={titleSize} w={800} c={correct ? colors.successText : colors.errorText}>
        {title}
      </Txt>
      <Txt
        s={noteSize}
        lh={1.5}
        c={correct ? colors.successText : colors.errorText}
        style={styles.note}>
        {note}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderRadius: radii.option,
    borderWidth: 1,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: alpha.w07,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
  feedback: {
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderWidth: 1,
    gap: 3,
  },
  note: { opacity: 0.9 },
});
