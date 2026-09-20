import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { BlurView } from 'expo-blur';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Divider, Pill, ScreenHeading } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { BUTTON_STATES, TOKEN_PILLS, TOKEN_SCALES, TOKEN_TEXT } from '../data/onboarding';

/** Design system reference — colour scales, type, component states. */
export function DesignTokensScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Screen padTop={62} gap={16}>
      <ScreenHeading kicker="TASARIM SİSTEMİ" title="Jetonlar ve bileşenler" size={font.display} />

      {TOKEN_SCALES.map((scale) => (
        <View key={scale.name} style={styles.scale}>
          <View style={styles.scaleHead}>
            <Txt f="mono" s={font.caption} w={700} c={t.colors.textFaint}>
              {scale.name}
            </Txt>
            <Txt f="mono" s={font.caption} w={700} c={t.colors.textFaint}>
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
        <Txt f="m" s={font.footnote} w={700}>
          {TOKEN_TEXT.title}
        </Txt>
        <Txt f="m" s={font.giant} w={800} ls={-0.02}>
          {TOKEN_TEXT.display}
        </Txt>
        <Txt f="m" s={font.display} w={800}>
          {TOKEN_TEXT.heading}
        </Txt>
        <Txt f="m" s={font.callout} w={700}>
          {TOKEN_TEXT.subheading}
        </Txt>
        <Txt s={font.body} lh={1.6} c={t.colors.textBody}>
          {TOKEN_TEXT.body}
        </Txt>
        <Txt f="mono" s={font.caption} w={700} c={t.colors.textFaint}>
          {TOKEN_TEXT.mono}
        </Txt>
      </View>

      <Divider />

      <Txt f="m" s={font.footnote} w={700}>
        Buton durumları
      </Txt>
      <View style={styles.grid}>
        {BUTTON_STATES.map((state) => (
          <View key={state.name} style={styles.buttonCell}>
            <ButtonSample name={state.name} label={state.label} />
            <Txt f="mono" s={font.label} w={600} c={t.colors.textGhost} style={styles.caption}>
              {state.name}
            </Txt>
          </View>
        ))}
      </View>

      <Txt f="m" s={font.footnote} w={700}>
        Rozetler ve pilller
      </Txt>
      <View style={styles.pills}>
        {TOKEN_PILLS.map((pill) => (
          <Pill key={pill.label} label={pill.label} tint={t.colors[pill.tint]} />
        ))}
      </View>

      <Txt f="m" s={font.footnote} w={700}>
        Yükseklik ve yüzeyler
      </Txt>
      <View style={styles.surfaces}>
        <View style={[styles.surface, styles.surfaceBg]}>
          <Txt f="mono" s={font.label} w={600} c={t.colors.textGhost}>
            bg
          </Txt>
        </View>
        <View style={[styles.surface, styles.surfaceMid]}>
          <Txt f="mono" s={font.label} w={600} c={t.colors.textFaint}>
            surface
          </Txt>
        </View>
        <View style={[styles.surface, styles.surfaceHigh]}>
          <Txt f="mono" s={font.label} w={600} c={t.colors.textMuted}>
            elevated
          </Txt>
        </View>
        <View style={[styles.surface, styles.surfaceGlass]}>
          <BlurView
            intensity={30}
            tint={t.dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <Txt f="mono" s={font.label} w={600} c={t.colors.textSubtle}>
            glass
          </Txt>
        </View>
      </View>

      <Txt s={font.caption} lh={1.6} c={t.colors.textFaint}>
        {TOKEN_TEXT.a11y}
      </Txt>
    </Screen>
  );
}

function ButtonSample({ name, label }: { name: string; label: string }) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  if (name === 'Varsayılan') {
    return (
      <Gradient colors={t.gradients.brand} style={styles.button}>
        <Txt f="m" s={font.footnote} w={800} c={t.colors.onBrand}>
          {label}
        </Txt>
      </Gradient>
    );
  }
  if (name === 'Basılı') {
    return (
      <Gradient colors={t.gradients.brandPressed} style={[styles.button, styles.pressed]}>
        <Txt f="m" s={font.footnote} w={800} c={t.colors.onBrand}>
          {label}
        </Txt>
      </Gradient>
    );
  }
  const map: Record<string, { bg: string; color: string; border?: string }> = {
    'Devre dışı': { bg: t.alpha.w06, color: t.colors.textDisabled },
    Yükleniyor: { bg: tint(t.colors.primary, 0.4), color: t.colors.textBody },
    Başarı: { bg: tint(t.colors.success, 0.2), color: t.colors.mintSoft, border: t.colors.success },
    Hata: { bg: tint(t.colors.error, 0.18), color: t.colors.errorTint, border: t.colors.error },
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
      <Txt f="m" s={font.footnote} w={800} c={style.color}>
        {label}
      </Txt>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    scale: { gap: 6 },
    scaleHead: { flexDirection: 'row', justifyContent: 'space-between' },
    swatches: { flexDirection: 'row', gap: 4, height: 38, borderRadius: radii.md, overflow: 'hidden' },
    swatch: { flex: 1 },
    typeBlock: { gap: 10 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    buttonCell: { width: '48%', flexGrow: 1, gap: 6 },
    button: {
      height: 46,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: { transform: [{ scale: 0.97 }] },
    caption: { textAlign: 'center' },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    surfaces: { flexDirection: 'row', gap: 10 },
    surface: {
      flex: 1,
      height: 70,
      borderRadius: radii.input,
      borderWidth: 1,
      justifyContent: 'flex-end',
      padding: 10,
      overflow: 'hidden',
    },
    surfaceBg: { backgroundColor: t.colors.bg, borderColor: t.alpha.w06 },
    surfaceMid: { backgroundColor: t.colors.surface, borderColor: t.alpha.w07 },
    surfaceHigh: { backgroundColor: t.colors.raised, borderColor: t.alpha.w10 },
    surfaceGlass: { backgroundColor: t.alpha.w06, borderColor: t.alpha.w14 },
  });
