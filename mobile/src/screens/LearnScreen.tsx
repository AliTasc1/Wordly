import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Chip, Row, ScreenHeading } from '../components/Surfaces';
import { Press } from '../components/Buttons';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { CEFR, CEFR_LEVELS, UNITS } from '../data/curriculum';
import { useApp } from '../state/AppContext';
import { useGo } from '../navigation/useGo';

/** 07 · Öğren — CEFR roadmap with the selected level's unit list. */
export function LearnScreen() {
  const { go } = useGo();
  const { cefr, setCefr } = useApp();
  const summary = CEFR[cefr];
  const units = UNITS[cefr] ?? UNITS.B1!;

  return (
    <Screen tabbed padTop={62} gap={14}>
      <ScreenHeading kicker="ÖĞREN" title="CEFR Yol Haritan" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}>
        {CEFR_LEVELS.map((level) => (
          <Chip
            key={level}
            label={level}
            active={cefr === level}
            onPress={() => setCefr(level)}
            padV={9}
            padH={18}
          />
        ))}
      </ScrollView>

      <Gradient
        colors={['rgba(46,107,255,.22)', 'rgba(14,20,38,.9)']}
        style={styles.summary}>
        <View style={styles.summaryHead}>
          <Txt f="m" s={18} w={800}>
            {summary.title}
          </Txt>
          <View style={styles.pct}>
            <Txt f="mono" s={11} w={700}>
              {summary.progressLabel}
            </Txt>
          </View>
        </View>
        <Txt s={12.5} lh={1.5} c={colors.textSubtle}>
          {summary.description}
        </Txt>
        <ProgressBar
          pct={summary.progress}
          from={colors.accent}
          to={colors.primary}
          height={8}
          track="rgba(0,0,0,.35)"
        />
        <View style={styles.meta}>
          <Txt s={11.5} w={600} c={colors.textMuted}>
            📘 {summary.units} ünite
          </Txt>
          <Txt s={11.5} w={600} c={colors.textMuted}>
            🔤 {summary.words} kelime
          </Txt>
          <Txt s={11.5} w={600} c={colors.textMuted}>
            ⏱ {summary.time}
          </Txt>
        </View>
      </Gradient>

      <View style={styles.listHead}>
        <Txt f="m" s={14.5} w={700}>
          Üniteler
        </Txt>
        <Press onPress={() => go('map')} scale={0.97}>
          <Txt s={12.5} w={700} c={colors.link}>
            Harita görünümü ›
          </Txt>
        </Press>
      </View>

      {units.map((unit) => (
        <Row key={unit.no} active={unit.state === 'DEVAM'} onPress={() => go('lesson')}>
          <View
            style={[
              styles.unitBadge,
              unit.progress === 100
                ? styles.unitDone
                : unit.state === 'DEVAM'
                  ? styles.unitNowBorder
                  : styles.unitIdle,
            ]}>
            {unit.state === 'DEVAM' ? (
              <Gradient colors={gradients.brand} style={styles.unitFill} />
            ) : null}
            <Txt
              f="m"
              s={13}
              w={800}
              c={
                unit.progress === 100
                  ? colors.successSoft
                  : unit.state === 'DEVAM'
                    ? colors.text
                    : colors.textFaint
              }>
              {unit.no}
            </Txt>
          </View>
          <View style={styles.flex}>
            <Txt f="m" s={14.5} w={700}>
              {unit.name}
            </Txt>
            <Txt s={11.5} c={colors.textDim} style={styles.unitSub}>
              {unit.sub}
            </Txt>
            <ProgressBar pct={unit.progress} height={4} style={styles.unitBar} />
          </View>
          <Txt f="mono" s={11} w={700} c={colors.textDim}>
            {unit.state}
          </Txt>
        </Row>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { gap: 7, paddingBottom: 4 },
  summary: {
    borderWidth: 1,
    borderColor: 'rgba(46,107,255,.3)',
    borderRadius: radii.section,
    padding: 16,
    gap: 11,
  },
  summaryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pct: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.chipSm,
    backgroundColor: alpha.w10,
  },
  meta: { flexDirection: 'row', gap: 16 },
  listHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unitBadge: {
    width: 42,
    height: 42,
    borderRadius: radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  unitDone: {
    backgroundColor: 'rgba(34,197,94,.16)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,.34)',
  },
  unitNowBorder: { backgroundColor: colors.primary },
  unitIdle: { backgroundColor: alpha.w05, borderWidth: 1, borderColor: alpha.w10 },
  unitFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  unitSub: { marginTop: 2 },
  unitBar: { marginTop: 8 },
});
