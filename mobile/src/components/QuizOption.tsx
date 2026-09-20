import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Press } from './Buttons';
import { Txt } from './Txt';
import { radii } from '../theme/tokens';
import type { OptionState } from '../state/useQuiz';

/**
 * `opt(state)` from the design logic.
 *
 * Tema parametre olarak geliyor: bu bir bileşen değil, saf bir eşleme.
 * Kanca çağıramaz ve çağırsa da React kuralları gereği yanlış olurdu.
 */
export function optionStyle(state: OptionState, t: Theme): ViewStyle {
  switch (state) {
    case 'ok':
      return { backgroundColor: tint(t.colors.success, 0.14), borderColor: t.colors.success };
    case 'bad':
      return { backgroundColor: tint(t.colors.error, 0.14), borderColor: t.colors.error };
    case 'off':
      return { backgroundColor: t.colors.surface, borderColor: t.alpha.w06, opacity: 0.5 };
    default:
      return { backgroundColor: t.colors.surface, borderColor: t.alpha.w09 };
  }
}

/** Border colour of the A/B/C/D badge, which tracks the option state. */
function badgeBorder(state: OptionState, t: Theme) {
  if (state === 'ok') return tint(t.colors.success, 0.3);
  if (state === 'bad') return tint(t.colors.error, 0.3);
  return t.alpha.w10;
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
  const t = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Press
      onPress={onPress}
      scale={0.99}
      accessibilityRole="button"
      style={[styles.option, optionStyle(state, t), style]}>
      {badge ? (
        <View style={[styles.badge, { borderColor: badgeBorder(state, t) }]}>
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
  const t = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View
      style={[
        styles.feedback,
        { borderRadius: radius },
        correct
          ? { backgroundColor: tint(t.colors.success, 0.14), borderColor: tint(t.colors.success, 0.36) }
          : { backgroundColor: tint(t.colors.error, 0.13), borderColor: tint(t.colors.error, 0.34) },
      ]}>
      <Txt f="m" s={titleSize} w={800} c={correct ? t.colors.successText : t.colors.errorText}>
        {title}
      </Txt>
      <Txt
        s={noteSize}
        lh={1.5}
        c={correct ? t.colors.successText : t.colors.errorText}
        style={styles.note}>
        {note}
      </Txt>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
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
      backgroundColor: t.alpha.w07,
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
