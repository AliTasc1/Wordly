import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Buttons';
import { ScreenHeading } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { ERROR_STATES } from '../data/onboarding';
import { useApp } from '../state/AppContext';

/** Error-state reference — friendly, specific, always actionable. */
export function ErrorStatesScreen() {
  const { fire } = useApp();

  return (
    <Screen padTop={62} gap={14}>
      <ScreenHeading kicker="HATA DURUMLARI" title="Dostane ve aksiyon alınabilir" size={22} />

      {ERROR_STATES.map((state) => (
        <View
          key={state.code}
          style={[
            styles.card,
            { backgroundColor: `${state.tint}14`, borderColor: `${state.tint}3d` },
          ]}>
          <View style={styles.head}>
            <View
              style={[
                styles.icon,
                { backgroundColor: `${state.tint}26`, borderColor: `${state.tint}59` },
              ]}>
              <Txt s={19}>{state.glyph}</Txt>
            </View>
            <View style={styles.flex}>
              <Txt f="m" s={14.5} w={800}>
                {state.title}
              </Txt>
              <Txt s={12} lh={1.55} c={colors.textSubtle} style={styles.text}>
                {state.text}
              </Txt>
              <Txt f="mono" s={10} w={600} c={colors.textFaint} style={styles.code}>
                {state.code}
              </Txt>
            </View>
          </View>

          <View style={styles.actions}>
            <Press
              onPress={() => fire(state.primary, `Demo: ${state.title}`)}
              style={[styles.primary, { backgroundColor: state.tint }]}>
              <Txt f="m" s={12.5} w={800} c={colors.onLight}>
                {state.primary}
              </Txt>
            </Press>
            <Press
              onPress={() => fire(state.secondary, `Demo: ${state.title}`)}
              style={styles.secondary}>
              <Txt f="m" s={12.5} w={700} c={colors.textSubtle}>
                {state.secondary}
              </Txt>
            </Press>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: radii.section, padding: 16, borderWidth: 1 },
  head: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { marginTop: 4 },
  code: { marginTop: 6 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 13 },
  primary: {
    flex: 1.3,
    height: 42,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    flex: 1,
    height: 42,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: alpha.w12,
    backgroundColor: alpha.w04,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
