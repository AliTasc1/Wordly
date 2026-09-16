import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { BackButton, Press } from '../components/Buttons';
import { Card } from '../components/Surfaces';
import { ColumnChart, SkillBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { MISTAKE_BOOK, TRENDS, WEEK_BARS, WEEK_SUMMARY } from '../data/profile';
import { useBack, useGo } from '../navigation/useGo';

const MAX = Math.max(...WEEK_BARS.map((b) => b.value));

/** 28 · Gelişim Analizi — weekly XP, skill trends and the mistake book. */
export function StatsScreen() {
  const { go } = useGo();
  const back = useBack('profile');

  return (
    <Screen tabbed padTop={62} gap={13}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View>
          <Txt f="m" s={17} w={800}>
            Gelişim analizi
          </Txt>
          <Txt s={11} w={600} c={colors.textDim}>
            Son 7 gün
          </Txt>
        </View>
      </View>

      <Card>
        <View style={styles.weekHead}>
          <Txt f="m" s={14} w={700}>
            {WEEK_SUMMARY.title}
          </Txt>
          <Txt f="m" s={20} w={800} c={colors.accent}>
            {WEEK_SUMMARY.total}{' '}
            <Txt f="mono" s={11} w={700} c={colors.successSoft}>
              {WEEK_SUMMARY.delta}
            </Txt>
          </Txt>
        </View>
        <ColumnChart data={WEEK_BARS} max={MAX} />
      </Card>

      <View style={styles.cards}>
        <View style={styles.smallCard}>
          <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.1}>
            {WEEK_SUMMARY.best.kicker}
          </Txt>
          <Txt f="m" s={17} w={800} style={styles.smallValue}>
            {WEEK_SUMMARY.best.value}
          </Txt>
          <Txt s={11} c={colors.textDim}>
            {WEEK_SUMMARY.best.sub}
          </Txt>
        </View>
        <View style={styles.smallCard}>
          <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.1}>
            {WEEK_SUMMARY.average.kicker}
          </Txt>
          <Txt f="m" s={17} w={800} style={styles.smallValue}>
            {WEEK_SUMMARY.average.value}
          </Txt>
          <Txt s={11} c={colors.textDim}>
            {WEEK_SUMMARY.average.sub}
          </Txt>
        </View>
      </View>

      <Card gap={11}>
        <Txt f="m" s={14} w={700}>
          Beceri trendi
        </Txt>
        {TRENDS.map((trend) => (
          <SkillBar
            key={trend.name}
            name={trend.name}
            value={trend.delta}
            pct={trend.pct}
            nameWidth={70}
            valueWidth={44}
            valueColor={trend.delta.startsWith('-') ? colors.errorSoft : colors.successSoft}
          />
        ))}
      </Card>

      <Press onPress={() => go('coach')} scale={0.99} style={styles.mistakes}>
        <View style={styles.mistakeIcon}>
          <Txt s={17}>📕</Txt>
        </View>
        <View style={styles.flex}>
          <Txt f="m" s={13.5} w={700}>
            {MISTAKE_BOOK.title}
          </Txt>
          <Txt s={11.5} c={colors.textDim}>
            {MISTAKE_BOOK.sub}
          </Txt>
        </View>
        <Txt f="m" s={11} w={800} c={colors.errorSoft}>
          {MISTAKE_BOOK.cta}
        </Txt>
      </Press>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weekHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  cards: { flexDirection: 'row', gap: 10 },
  smallCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w07,
    borderRadius: radii.panel,
    padding: 14,
  },
  smallValue: { marginTop: 4 },
  mistakes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,77,94,.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,94,.28)',
    borderRadius: radii.tile,
    padding: 15,
  },
  mistakeIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.card,
    backgroundColor: 'rgba(255,77,94,.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
