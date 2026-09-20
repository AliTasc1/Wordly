import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Press } from '../components/Buttons';
import { ScreenHeading } from '../components/Surfaces';
import { EmptyState } from '../components/EmptyState';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { EMPTY_STATES } from '../data/onboarding';
import { useGo } from '../navigation/useGo';

/** Empty-state reference — art, one line of copy, a single primary action. */
export function EmptyStatesScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();

  return (
    <Screen padTop={62} gap={14}>
      <ScreenHeading
        kicker="BOŞ DURUMLAR"
        title="Görsel + açıklama + tek aksiyon"
        size={22}
      />

      {EMPTY_STATES.map((state) => (
        <View key={state.title} style={styles.card}>
          <EmptyState
            glyph={state.glyph}
            title={state.title}
            text={state.text}
            action={state.cta}
            onAction={() => go(state.target)}
          />
        </View>
      ))}
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.alpha.w07,
      borderRadius: radii.section,
      padding: 18,
      alignItems: 'center',
      gap: 10,
    },
  });
