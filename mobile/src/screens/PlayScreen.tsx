import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Press, TinyButton } from '../components/Buttons';
import { IconTile, ScreenHeading, Tag } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { MODES, PLAY_HERO, TOURNAMENT } from '../data/play';
import { useGo } from '../navigation/useGo';

/** 16 · Oyna — the game mode showcase. */
export function PlayScreen() {
  const { go } = useGo();

  return (
    <Screen tabbed padTop={62} gap={14}>
      <ScreenHeading kicker="OYNA" title="Oyna, kelime kazan" />

      <Press onPress={() => go('arena')} scale={0.99}>
        <Gradient
          deg={140}
          colors={['rgba(34,211,238,.24)', 'rgba(124,92,255,.2)', 'rgba(14,20,38,.95)']}
          style={styles.hero}>
          <View style={styles.heroRingLarge} pointerEvents="none" />
          <View style={styles.heroRingSmall} pointerEvents="none" />
          <View>
            <View style={styles.heroKicker}>
              <Txt f="mono" s={10} w={700} c={colors.accentSoft} ls={0.12}>
                {PLAY_HERO.kicker}
              </Txt>
            </View>
            <Txt f="m" s={26} w={800} style={styles.heroTitle}>
              {PLAY_HERO.title}
            </Txt>
            <Txt s={12.5} lh={1.5} c={colors.textBody} style={styles.heroSub}>
              {PLAY_HERO.sub}
            </Txt>
            <View style={styles.heroActions}>
              <View style={styles.heroPrimary}>
                <Txt f="m" s={13} w={800} c={colors.onLight}>
                  {PLAY_HERO.primary}
                </Txt>
              </View>
              <View style={styles.heroSecondary}>
                <Txt f="m" s={12} w={700} c={colors.textSubtle}>
                  {PLAY_HERO.secondary}
                </Txt>
              </View>
            </View>
          </View>
        </Gradient>
      </Press>

      <Txt f="m" s={13.5} w={700}>
        Modlar
      </Txt>

      <View style={styles.grid}>
        {MODES.map((mode) => (
          <Press
            key={mode.name}
            onPress={() => go(mode.target)}
            scale={0.98}
            style={styles.mode}>
            <View style={styles.modeHead}>
              <IconTile glyph={mode.glyph} tint={mode.tint} size={38} radius={13} fontSize={17} />
              <Tag label={mode.tag} tint={mode.tint} size={9} />
            </View>
            <Txt f="m" s={14.5} w={800} style={styles.modeName}>
              {mode.name}
            </Txt>
            <Txt s={11} lh={1.4} c={colors.textDim} style={styles.modeSub}>
              {mode.sub}
            </Txt>
          </Press>
        ))}
      </View>

      <Gradient
        colors={['rgba(245,165,36,.16)', 'rgba(14,20,38,.92)']}
        style={styles.tournament}>
        <View style={styles.tournamentIcon}>
          <Txt s={19}>{TOURNAMENT.glyph}</Txt>
        </View>
        <View style={styles.flex}>
          <Txt f="m" s={14} w={700}>
            {TOURNAMENT.title}
          </Txt>
          <Txt s={11.5} c={colors.textDim}>
            {TOURNAMENT.sub}
          </Txt>
        </View>
        <TinyButton
          label={TOURNAMENT.cta}
          bg={colors.warning}
          color={colors.onLight}
          onPress={() => go('board')}
        />
      </Gradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,.34)',
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
    borderColor: 'rgba(255,255,255,.22)',
  },
  heroRingSmall: {
    position: 'absolute',
    right: 6,
    top: 34,
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 1.5,
    borderColor: alpha.w12,
  },
  heroKicker: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.chipSm,
    backgroundColor: 'rgba(0,0,0,.34)',
  },
  heroTitle: { marginTop: 10 },
  heroSub: { marginTop: 4, maxWidth: 200 },
  heroActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  heroPrimary: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.text,
  },
  heroSecondary: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(0,0,0,.3)',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mode: {
    width: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: radii.tile,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
  },
  modeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modeName: { marginTop: 10 },
  modeSub: { marginTop: 2 },
  tournament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,165,36,.3)',
    borderRadius: radii.tile,
    padding: 15,
  },
  tournamentIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.input,
    backgroundColor: 'rgba(245,165,36,.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
