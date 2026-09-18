import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { BackButton, Press } from '../components/Buttons';
import { Card } from '../components/Surfaces';
import { ColumnChart, SkillBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { deckProgress, tr } from '../content/progress';
import { weekStats } from '../content/stats';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 28 · Gelişim Analizi — haftalık XP, bölüm ilerlemesi ve hata defteri. */
export function StatsScreen() {
  const { go } = useGo();
  const back = useBack('profile');
  const { daily, positions, cefr, mistakes } = useApp();

  const week = useMemo(() => weekStats(daily), [daily]);
  const decks = useMemo(() => deckProgress(positions, cefr), [positions, cefr]);
  const mistakeCount = useMemo(
    () => Object.values(mistakes).reduce((n, m) => n + m.times, 0),
    [mistakes],
  );

  // Sütunların ölçeği en yüksek güne göre. Hiç XP yoksa 1'e sabitliyoruz:
  // sıfıra bölmek grafiği NaN yapar.
  const max = Math.max(...week.bars.map((b) => b.value), 1);

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
            Haftalık XP
          </Txt>
          <Txt f="m" s={20} w={800} c={colors.accent}>
            {tr(week.total)}{' '}
            {week.delta === null ? null : (
              <Txt
                f="mono"
                s={11}
                w={700}
                c={week.delta < 0 ? colors.errorSoft : colors.successSoft}>
                {week.delta > 0 ? '+' : ''}%{week.delta}
              </Txt>
            )}
          </Txt>
        </View>
        {/* En iyi gün vurgulanıyor. Hafta boşken eşik sonsuz: sıfır sütunların
            hepsini "en iyi" diye parlatmanın anlamı yok. */}
        <ColumnChart data={week.bars} max={max} highlightFrom={week.best ? max : Infinity} />
      </Card>

      <View style={styles.cards}>
        <View style={styles.smallCard}>
          <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.1}>
            EN İYİ GÜN
          </Txt>
          <Txt f="m" s={17} w={800} style={styles.smallValue}>
            {week.best ? week.best.name : '—'}
          </Txt>
          <Txt s={11} c={colors.textDim}>
            {week.best ? `${tr(week.best.value)} XP` : 'Bu hafta henüz XP yok'}
          </Txt>
        </View>
        <View style={styles.smallCard}>
          <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.1}>
            GÜNLÜK ORTALAMA
          </Txt>
          <Txt f="m" s={17} w={800} style={styles.smallValue}>
            {tr(week.average)} XP
          </Txt>
          <Txt s={11} c={colors.textDim}>
            7 günün {week.activeDays}'inde çalıştın
          </Txt>
        </View>
      </View>

      <Card gap={11}>
        <Txt f="m" s={14} w={700}>
          {cefr} seviyesinde ilerleme
        </Txt>
        {/* Yüzde, o bölümde görülen kart/ders sayısının seviyedeki toplama
            oranı. Bir kartı görmek onu bilmek değil — aralıklı tekrar
            geldiğinde bu ayrımı ölçebileceğiz. */}
        {decks.map((deck) => (
          <SkillBar
            key={deck.kind}
            name={deck.label}
            value={`%${deck.pct}`}
            pct={deck.pct}
            nameWidth={70}
            valueWidth={44}
          />
        ))}
      </Card>

      <Press onPress={() => go('coach')} scale={0.99} style={styles.mistakes}>
        <View style={styles.mistakeIcon}>
          <Txt s={17}>📕</Txt>
        </View>
        <View style={styles.flex}>
          <Txt f="m" s={13.5} w={700}>
            Hata defteri
          </Txt>
          <Txt s={11.5} c={colors.textDim}>
            {mistakeCount
              ? `${tr(mistakeCount)} yanlış · ${Object.keys(mistakes).length} soru`
              : 'Henüz yanlışın yok'}
          </Txt>
        </View>
        <Txt f="m" s={11} w={800} c={colors.errorSoft}>
          {mistakeCount ? 'TEKRAR ET' : 'AÇ'}
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
