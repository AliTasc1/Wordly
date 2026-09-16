import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Divider, Pill, ScreenHeading } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { BUTTON_STATES, TOKEN_PILLS, TOKEN_SCALES, TOKEN_TEXT } from '../data/onboarding';

/** Design system reference — colour scales, type, component states. */
export function DesignTokensScreen() {
  return (
    <Screen padTop={62} gap={16}>
      <ScreenHeading kicker="TASARIM SİSTEMİ" title="Jetonlar ve bileşenler" size={24} />

      {TOKEN_SCALES.map((scale) => (
        <View key={scale.name} style={styles.scale}>
          <View style={styles.scaleHead}>
            <Txt f="mono" s={11} w={700} c={colors.textFaint}>
              {scale.name}
            </Txt>
            <Txt f="mono" s={11} w={700} c={colors.textFaint}>
              {scale.base}
            </Txt>
          </View>
          <View style={styles.swatches}>
            {scale.steps.map((step) => (
              <View key={step} style={[styles.swatch, { backgroundColor: step }]} />
            ))}
          </View>
        </View>
      ))}

      <Divider />

      <View style={styles.typeBlock}>
        <Txt f="m" s={13} w={700}>
          {TOKEN_TEXT.title}
        </Txt>
        <Txt f="m" s={30} w={800} ls={-0.02}>
          {TOKEN_TEXT.display}
        </Txt>
        <Txt f="m" s={21} w={800}>
          {TOKEN_TEXT.heading}
        </Txt>
        <Txt f="m" s={15} w={700}>
          {TOKEN_TEXT.subheading}
        </Txt>
        <Txt s={14} lh={1.6} c={colors.textBody}>
          {TOKEN_TEXT.body}
        </Txt>
        <Txt f="mono" s={11} w={700} c={colors.textFaint}>
          {TOKEN_TEXT.mono}
        </Txt>
      </View>

      <Divider />

      <Txt f="m" s={13} w={700}>
        Buton durumları
      </Txt>
      <View style={styles.grid}>
        {BUTTON_STATES.map((state) => (
          <View key={state.name} style={styles.buttonCell}>
            <ButtonSample name={state.name} label={state.label} />
            <Txt f="mono" s={9.5} w={600} c={colors.textGhost} style={styles.caption}>
              {state.name}
            </Txt>
          </View>
        ))}
      </View>

      <Txt f="m" s={13} w={700}>
        Rozetler ve pilller
      </Txt>
      <View style={styles.pills}>
        {TOKEN_PILLS.map((pill) => (
          <Pill key={pill.label} label={pill.label} tint={pill.tint} />
        ))}
      </View>

      <Txt f="m" s={13} w={700}>
        Yükseklik ve yüzeyler
      </Txt>
      <View style={styles.surfaces}>
        <View style={[styles.surface, styles.surfaceBg]}>
          <Txt f="mono" s={9.5} w={600} c={colors.textGhost}>
            bg
          </Txt>
        </View>
        <View style={[styles.surface, styles.surfaceMid]}>
          <Txt f="mono" s={9.5} w={600} c={colors.textFaint}>
            surface
          </Txt>
        </View>
        <View style={[styles.surface, styles.surfaceHigh]}>
          <Txt f="mono" s={9.5} w={600} c={colors.textMuted}>
            elevated
          </Txt>
        </View>
        <View style={[styles.surface, styles.surfaceGlass]}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <Txt f="mono" s={9.5} w={600} c={colors.textSubtle}>
            glass
          </Txt>
        </View>
      </View>

      <Txt s={11.5} lh={1.6} c={colors.textFaint}>
        {TOKEN_TEXT.a11y}
      </Txt>
    </Screen>
  );
}

function ButtonSample({ name, label }: { name: string; label: string }) {
  if (name === 'Varsayılan') {
    return (
      <Gradient colors={gradients.brand} style={styles.button}>
        <Txt f="m" s={13} w={800}>
          {label}
        </Txt>
      </Gradient>
    );
  }
  if (name === 'Basılı') {
    return (
      <Gradient colors={gradients.brandPressed} style={[styles.button, styles.pressed]}>
        <Txt f="m" s={13} w={800}>
          {label}
        </Txt>
      </Gradient>
    );
  }
  const map: Record<string, { bg: string; color: string; border?: string }> = {
    'Devre dışı': { bg: alpha.w06, color: colors.textDisabled },
    Yükleniyor: { bg: 'rgba(46,107,255,.4)', color: colors.textBody },
    Başarı: { bg: 'rgba(34,197,94,.2)', color: colors.mintSoft, border: colors.success },
    Hata: { bg: 'rgba(255,77,94,.18)', color: colors.errorTint, border: colors.error },
  };
  const style = map[name];
  return (
    <View
      style={[
        styles.button,
        {
          backgroundColor: style.bg,
          borderWidth: style.border ? 1 : 0,
          borderColor: style.border,
        },
      ]}>
      <Txt f="m" s={13} w={800} c={style.color}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  scale: { gap: 6 },
  scaleHead: { flexDirection: 'row', justifyContent: 'space-between' },
  swatches: { flexDirection: 'row', gap: 3, height: 38, borderRadius: radii.md, overflow: 'hidden' },
  swatch: { flex: 1 },
  typeBlock: { gap: 9 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  buttonCell: { width: '48%', flexGrow: 1, gap: 5 },
  button: {
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.97 }] },
  caption: { textAlign: 'center' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  surfaces: { flexDirection: 'row', gap: 9 },
  surface: {
    flex: 1,
    height: 70,
    borderRadius: radii.input,
    borderWidth: 1,
    justifyContent: 'flex-end',
    padding: 9,
    overflow: 'hidden',
  },
  surfaceBg: { backgroundColor: colors.bg, borderColor: alpha.w06 },
  surfaceMid: { backgroundColor: colors.surface, borderColor: alpha.w07 },
  surfaceHigh: { backgroundColor: colors.surfaceElevated, borderColor: alpha.w10 },
  surfaceGlass: { backgroundColor: alpha.w06, borderColor: alpha.w14 },
});
