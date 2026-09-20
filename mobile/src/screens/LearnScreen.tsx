import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Chip, Row, ScreenHeading } from '../components/Surfaces';
import { Press } from '../components/Buttons';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { radii } from '../theme/tokens';
import { grammarOf } from '../content';
import { formatMinutes, levelSummary } from '../content/summary';
import { CEFR, CEFR_LEVELS } from '../data/curriculum';
import { useApp } from '../state/AppContext';
import { useGo } from '../navigation/useGo';

/**
 * 07 · Öğren — CEFR roadmap with the selected level's lessons.
 *
 * The design listed invented units; the real spine of a level is its grammar
 * lesson sequence, which is ordered and numbered, so that is what is listed.
 */
export function LearnScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();
  const { cefr, setCefr, position, setPosition } = useApp();

  const summary = CEFR[cefr];
  const counts = useMemo(() => levelSummary(cefr), [cefr]);
  const lessons = useMemo(() => grammarOf(cefr), [cefr]);
  const at = Math.min(position('grammar', cefr), lessons.length - 1);
  const progress = lessons.length ? Math.round((at / lessons.length) * 100) : 0;

  const open = (index: number) => {
    setPosition('grammar', cefr, index);
    go('grammar');
  };

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

      <Gradient colors={['rgba(46,107,255,.22)', 'rgba(14,20,38,.9)']} style={styles.summary}>
        <View style={styles.summaryHead}>
          <Txt f="m" s={18} w={800}>
            {summary.title}
          </Txt>
          <View style={styles.pct}>
            <Txt f="mono" s={11} w={700}>
              %{progress}
            </Txt>
          </View>
        </View>
        <Txt s={12.5} lh={1.5} c={t.colors.textSubtle}>
          {summary.description}
        </Txt>
        <ProgressBar
          pct={progress}
          from={t.colors.accent}
          to={t.colors.primary}
          height={8}
          track="rgba(0,0,0,.35)"
        />
        <View style={styles.meta}>
          <Txt s={11.5} w={600} c={t.colors.textMuted}>
            📐 {counts.lessons} ders
          </Txt>
          <Txt s={11.5} w={600} c={t.colors.textMuted}>
            🔤 {counts.words.toLocaleString('tr-TR')} kelime
          </Txt>
          <Txt s={11.5} w={600} c={t.colors.textMuted}>
            ⏱ {formatMinutes(counts.minutes)}
          </Txt>
        </View>
        <View style={styles.meta}>
          <Txt s={11.5} w={600} c={t.colors.textMuted}>
            📖 {counts.reading} okuma
          </Txt>
          <Txt s={11.5} w={600} c={t.colors.textMuted}>
            🎧 {counts.listening} dinleme
          </Txt>
          <Txt s={11.5} w={600} c={t.colors.textMuted}>
            🎙 {counts.speaking} konuşma
          </Txt>
        </View>
      </Gradient>

      <View style={styles.listHead}>
        <Txt f="m" s={14.5} w={700}>
          Dersler
        </Txt>
        <Press onPress={() => go('map')} scale={0.97}>
          <Txt s={12.5} w={700} c={t.colors.link}>
            Harita görünümü ›
          </Txt>
        </Press>
      </View>

      {lessons.map((lesson, i) => {
        const done = i < at;
        const now = i === at;
        return (
          <Row key={lesson.id} active={now} onPress={() => open(i)}>
            <View
              style={[
                styles.unitBadge,
                done ? styles.unitDone : now ? styles.unitNowBorder : styles.unitIdle,
              ]}>
              {now ? <Gradient colors={t.gradients.brand} style={styles.unitFill} /> : null}
              <Txt
                f="m"
                s={13}
                w={800}
                c={done ? t.colors.successSoft : now ? t.colors.text : t.colors.textFaint}>
                {String(lesson.order).padStart(2, '0')}
              </Txt>
            </View>
            <View style={styles.flex}>
              <Txt f="m" s={14.5} w={700}>
                {lesson.title}
              </Txt>
              <Txt s={11.5} c={t.colors.textDim} style={styles.unitSub}>
                {lesson.topic} · {lesson.exercises.length} alıştırma
              </Txt>
            </View>
            <Txt f="mono" s={11} w={700} c={t.colors.textDim}>
              {done ? 'BİTTİ' : now ? 'DEVAM' : 'YENİ'}
            </Txt>
          </Row>
        );
      })}
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
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
      backgroundColor: t.alpha.w10,
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
    unitNowBorder: { backgroundColor: t.colors.primary },
    unitIdle: { backgroundColor: t.alpha.w05, borderWidth: 1, borderColor: t.alpha.w10 },
    unitFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    unitSub: { marginTop: 2 },
  });
