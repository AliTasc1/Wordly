import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Press } from '../components/Buttons';
import { ScreenHeading } from '../components/Surfaces';
import { StripeCircle } from '../components/StripeArt';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { EMPTY_STATES } from '../data/onboarding';
import { useGo } from '../navigation/useGo';

/** Empty-state reference — art, one line of copy, a single primary action. */
export function EmptyStatesScreen() {
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
          <Txt f="m" s={15} w={800}>
            {state.title}
          </Txt>
          <Txt s={12} lh={1.55} c={colors.textDim} style={styles.text}>
            {state.text}
          </Txt>
          <Press onPress={() => go(state.target)}>
            <Gradient colors={gradients.brand} style={styles.cta}>
              <Txt f="m" s={12.5} w={800}>
                {state.cta}
              </Txt>
            </Gradient>
          </Press>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w07,
    borderRadius: radii.section,
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  text: { maxWidth: 250, textAlign: 'center' },
  cta: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: radii.card },
});
