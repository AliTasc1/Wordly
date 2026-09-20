import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Press } from '../components/Buttons';
import { ScreenHeading } from '../components/Surfaces';
import { StripeCircle } from '../components/StripeArt';
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
          <StripeCircle label={`görsel: ${state.art}`} />
          <Txt f="m" s={font.callout} w={800}>
            {state.title}
          </Txt>
          <Txt s={font.caption} lh={1.55} c={t.colors.textDim} style={styles.text}>
            {state.text}
          </Txt>
          <Press onPress={() => go(state.target)}>
            <Gradient colors={t.gradients.brand} style={styles.cta}>
              <Txt f="m" s={font.footnote} w={800}>
                {state.cta}
              </Txt>
            </Gradient>
          </Press>
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
    text: { maxWidth: 250, textAlign: 'center' },
    cta: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: radii.card },
  });
