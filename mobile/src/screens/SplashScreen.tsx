import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Glow } from '../components/Glow';
import { GhostButton, PrimaryButton } from '../components/Buttons';
import { Txt } from '../components/Txt';
import { PopIn } from '../components/motion';
import { SPLASH } from '../data/onboarding';
import { useGo } from '../navigation/useGo';

/** 01 · Açılış — brand moment plus session bootstrap. */
export function SplashScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();

  return (
    <Screen
      scroll={false}
      padTop={0}
      padH={28}
      padBottom={46}
      gap={0}
      contentStyle={styles.content}
      glows={[
        {
          rx: 260,
          ry: 200,
          cx: 0.5,
          cy: 0.3,
          color: t.colors.primary,
          opacity: 0.34,
          stop: 0.65,
        },
        {
          rx: 210,
          ry: 180,
          cx: 0.78,
          cy: 0.74,
          color: t.colors.secondary,
          opacity: 0.26,
          stop: 0.68,
        },
      ]}>
      <View />

      <PopIn style={styles.brand}>
        <View style={styles.logoWrap}>
          <View style={styles.logoGlow} pointerEvents="none">
            <Glow
              glows={[
                {
                  rx: 80,
                  ry: 80,
                  cx: 0.5,
                  cy: 0.5,
                  color: t.colors.secondary,
                  opacity: 0.55,
                  stop: 1,
                },
              ]}
            />
          </View>
          <Gradient
            deg={140}
            colors={t.gradients.logo}
            locations={[0, 0.55, 1]}
            style={styles.logo}>
            <Txt f="m" s={62} w={800}>
              W
            </Txt>
          </Gradient>
        </View>
        <View style={styles.wordmarkWrap}>
          <Txt f="m" s={42} w={800} ls={0.22} style={styles.wordmark}>
            WORDLY
          </Txt>
          <Txt s={14} w={600} c={t.colors.blueSoft} style={styles.tagline}>
            {SPLASH.tagline}
          </Txt>
        </View>
      </PopIn>

      <View style={styles.actions}>
        {/* "Hesabın hazırlanıyor" yazan bir yükleniyor animasyonu vardı.
            Hazırlanan bir şey yoktu: ekran açılır açılmaz hazırdı. Bekleme
            taklidi, kullanıcının zamanını çalmanın kibar hâlidir. */}
        <PrimaryButton label={SPLASH.primary} onPress={() => go('onb')} />
        <GhostButton
          label={SPLASH.secondary}
          height={52}
          radius={18}
          size={15}
          fill="rgba(255,255,255,.04)"
          border="rgba(255,255,255,.14)"
          onPress={() => go('signin')}
        />
        <Txt s={10.5} c={t.colors.textDisabled} style={styles.legal}>
          {SPLASH.legal}
        </Txt>
      </View>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    content: { justifyContent: 'space-between' },
    brand: { alignItems: 'center', gap: 22 },
    logoWrap: { width: 132, height: 132, alignItems: 'center', justifyContent: 'center' },
    logoGlow: { position: 'absolute', top: -29, left: -29, right: -29, bottom: -29 },
    logo: {
      width: 132,
      height: 132,
      borderRadius: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    wordmarkWrap: { alignItems: 'center' },
    wordmark: { marginLeft: 9 },
    tagline: { marginTop: 8 },
    actions: { gap: 12 },
    legal: { textAlign: 'center', marginTop: 4 },
  });
