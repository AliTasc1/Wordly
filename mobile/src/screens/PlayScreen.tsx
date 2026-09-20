import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Press, TinyButton } from '../components/Buttons';
import { IconTile, ScreenHeading, Tag } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { ARENA_GLYPH, PLAY_HERO } from '../data/play';
import { MODE_LIST } from '../content/arena-game';
import { useApp } from '../state/AppContext';
import { useGo } from '../navigation/useGo';

/** 16 · Oyna — the game mode showcase. */
export function PlayScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();
  const { setArenaMode } = useApp();

  return (
    <Screen tabbed padTop={62} gap={14}>
      <ScreenHeading kicker="OYNA" title="Oyna, kelime kazan" />

      <Press
        onPress={() => {
          setArenaMode('time');
          go('arena');
        }}
        scale={0.99}>
        <Gradient
          deg={140}
          colors={[tint(t.colors.accent, 0.24), tint(t.colors.secondary, 0.2), tint(t.colors.surface, 0.95)]}
          style={styles.hero}>
          <View style={styles.heroRingLarge} pointerEvents="none" />
          <View style={styles.heroRingSmall} pointerEvents="none" />
          <View>
            <View style={styles.heroKicker}>
              <Txt f="mono" s={font.label} w={700} c={t.colors.accentSoft} ls={0.12}>
                {PLAY_HERO.kicker}
              </Txt>
            </View>
            <Txt f="m" s={font.jumbo} w={800} style={styles.heroTitle}>
              {PLAY_HERO.title}
            </Txt>
            <Txt s={font.footnote} lh={1.5} c={t.colors.textBody} style={styles.heroSub}>
              {PLAY_HERO.sub}
            </Txt>
            <View style={styles.heroActions}>
              <View style={styles.heroPrimary}>
                <Txt f="m" s={font.footnote} w={800} c={t.colors.onLight}>
                  {PLAY_HERO.primary}
                </Txt>
              </View>
              <View style={styles.heroSecondary}>
                <Txt f="m" s={font.caption} w={700} c={t.colors.textSubtle}>
                  {PLAY_HERO.secondary}
                </Txt>
              </View>
            </View>
          </View>
        </Gradient>
      </Press>

      <Txt f="m" s={font.body} w={700}>
        Modlar
      </Txt>

      <View style={styles.grid}>
        {MODE_LIST.map((mode) => {
          const look = ARENA_GLYPH[mode.key];
          return (
            <Press
              key={mode.key}
              onPress={() => {
                setArenaMode(mode.key);
                go('arena');
              }}
              scale={0.98}
              style={styles.mode}>
              <View style={styles.modeHead}>
                <IconTile
                  glyph={look.glyph}
                  tint={t.colors[look.tint]}
                  size={38}
                  radius={13}
                  fontSize={17}
                />
                {mode.multiplier > 1 ? (
                  <Tag label={`${mode.multiplier}× XP`} tint={t.colors[look.tint]} size={9} />
                ) : null}
              </View>
              <Txt f="m" s={font.body} w={800} style={styles.modeName}>
                {mode.name}
              </Txt>
              <Txt s={font.caption} lh={1.4} c={t.colors.textDim} style={styles.modeSub}>
                {mode.sub}
              </Txt>
            </Press>
          );
        })}
      </View>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    hero: {
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: tint(t.colors.accent, 0.34),
      borderRadius: radii.screen,
      padding: 18,
    },
    heroRingLarge: {
      position: 'absolute',
      right: -30,
      top: -30,
      width: 170,
      height: 170,
      borderRadius: 85,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: t.alpha.w20,
    },
    heroRingSmall: {
      position: 'absolute',
      right: 6,
      top: 34,
      width: 98,
      height: 98,
      borderRadius: 49,
      borderWidth: 1.5,
      borderColor: t.alpha.w12,
    },
    heroKicker: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: radii.chipSm,
      backgroundColor: t.alpha.black34,
    },
    heroTitle: { marginTop: 10 },
    heroSub: { marginTop: 4, maxWidth: 200 },
    heroActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
    heroPrimary: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: radii.lg,
      backgroundColor: t.colors.text,
    },
    heroSecondary: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: radii.lg,
      backgroundColor: t.alpha.black30,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    mode: {
      width: '48%',
      flexGrow: 1,
      padding: 14,
      borderRadius: radii.tile,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.alpha.w08,
    },
    modeHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modeName: { marginTop: 10 },
    modeSub: { marginTop: 2 },
    tournament: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: tint(t.colors.warning, 0.3),
      borderRadius: radii.tile,
      padding: 16,
    },
    tournamentIcon: {
      width: 44,
      height: 44,
      borderRadius: radii.input,
      backgroundColor: tint(t.colors.warning, 0.2),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
