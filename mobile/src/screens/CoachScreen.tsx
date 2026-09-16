import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press } from '../components/Buttons';
import { Chip, IconTile, Panel, Tag } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii, shadows } from '../theme/tokens';
import { COACH } from '../data/play';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 15 · AI Koç — a coach with memory of your mistakes and goals. */
export function CoachScreen() {
  const { go } = useGo();
  const back = useBack('home');
  const { fire } = useApp();

  return (
    <Screen tabbed padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View style={styles.flex}>
          <Txt f="m" s={17} w={800}>
            {COACH.header.title}
          </Txt>
          <Txt s={11} w={600} c={colors.textDim}>
            {COACH.header.sub}
          </Txt>
        </View>
      </View>

      <Gradient
        deg={145}
        colors={['rgba(124,92,255,.28)', 'rgba(34,211,238,.1)', 'rgba(14,20,38,.95)']}
        style={styles.plan}>
        <View style={styles.planHead}>
          <Gradient colors={gradients.violetCyan} style={styles.planBadge}>
            <Txt f="m" s={16} w={800}>
              AI
            </Txt>
          </Gradient>
          <View>
            <Txt f="m" s={16} w={800}>
              {COACH.plan.title}
            </Txt>
            <Txt s={11.5} w={600} c={colors.violetSoft}>
              {COACH.plan.sub}
            </Txt>
          </View>
        </View>
        <Txt s={15} w={600} lh={1.6}>
          {COACH.plan.message}
        </Txt>
        <Press onPress={() => go('grammar')} style={styles.planCta}>
          <Txt f="m" s={15} w={800}>
            {COACH.plan.cta}
          </Txt>
        </Press>
      </Gradient>

      <Txt f="m" s={13.5} w={700} style={styles.sectionTitle}>
        {COACH.memoryTitle}
      </Txt>

      {COACH.memory.map((item) => (
        <View key={item.title} style={styles.memoryRow}>
          <IconTile glyph={item.glyph} tint={item.tint} size={42} radius={14} fontSize={18} />
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              {item.title}
            </Txt>
            <Txt s={11.5} lh={1.45} c={colors.textDim} style={styles.memorySub}>
              {item.sub}
            </Txt>
          </View>
          <Tag label={item.tag} tint={item.tint} />
        </View>
      ))}

      <Panel gap={10} radius={radii.tile}>
        <Txt f="m" s={13.5} w={700}>
          {COACH.askTitle}
        </Txt>
        <View style={styles.chips}>
          {COACH.chips.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              padV={9}
              padH={13}
              onPress={() => fire('Koç hazırlıyor…', `“${chip}” için 3 dakikalık oturum`)}
            />
          ))}
        </View>
        <View style={styles.input}>
          <Txt s={13} c={colors.textGhost} style={styles.flex}>
            {COACH.inputPlaceholder}
          </Txt>
          <Gradient colors={gradients.brand} style={styles.send}>
            <Txt f="m" s={13} w={700}>
              ↑
            </Txt>
          </Gradient>
        </View>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  plan: {
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,.32)',
    borderRadius: radii.hero,
    padding: 18,
    gap: 12,
  },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  planBadge: { width: 46, height: 46, borderRadius: radii.input, alignItems: 'center', justifyContent: 'center' },
  planCta: {
    height: 50,
    borderRadius: radii.input,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.ctaViolet,
  },
  sectionTitle: { marginTop: 2 },
  memoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w07,
    borderRadius: radii.panel,
    padding: 13,
  },
  memorySub: { marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: alpha.w04,
    borderWidth: 1,
    borderColor: alpha.w10,
    borderRadius: radii.card,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  send: { width: 32, height: 32, borderRadius: radii.chip, alignItems: 'center', justifyContent: 'center' },
});
