import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import Svg, { Line } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press } from '../components/Buttons';
import { Txt } from '../components/Txt';
import { radii } from '../theme/tokens';
import { grammarOf } from '../content';
import { CEFR } from '../data/curriculum';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

type MapNodeKind = 'done' | 'now' | 'next' | 'lock';

/**
 * 08 · Kurs Haritası — a progress path, not an LMS table.
 *
 * The path is the level's real grammar sequence. Everything after the current
 * lesson stays open rather than locked: the content exists, and there is no
 * reason to stop someone reading ahead.
 */
export function CourseMapScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();
  const back = useBack('learn');
  const { cefr, position, setPosition } = useApp();

  const lessons = useMemo(() => grammarOf(cefr), [cefr]);
  const at = Math.min(position('grammar', cefr), lessons.length - 1);
  const progress = lessons.length ? Math.round((at / lessons.length) * 100) : 0;

  const open = (index: number) => {
    setPosition('grammar', cefr, index);
    go('grammar');
  };

  return (
    <Screen tabbed padTop={62} padH={0} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View>
          <Txt f="m" s={19} w={800}>
            {CEFR[cefr].title}
          </Txt>
          <Txt s={11.5} w={600} c={t.colors.textDim}>
            {at}/{lessons.length} ders
          </Txt>
        </View>
        <View style={styles.pct}>
          <Txt f="mono" s={11} w={700} c={t.colors.accentSoft}>
            %{progress}
          </Txt>
        </View>
      </View>

      <View style={styles.path}>
        <View style={styles.spine} pointerEvents="none">
          <Svg width={2} height="100%">
            <Line
              x1={1}
              y1={0}
              x2={1}
              y2="100%"
              stroke="rgba(255,255,255,.14)"
              strokeWidth={2}
              strokeDasharray="8 8"
            />
          </Svg>
        </View>

        <View style={styles.nodes}>
          {lessons.map((lesson, i) => {
            const left = i % 2 === 0;
            const kind: MapNodeKind = i < at ? 'done' : i === at ? 'now' : 'next';
            return (
              <View
                key={lesson.id}
                style={[
                  styles.nodeRow,
                  left
                    ? { flexDirection: 'row', paddingRight: 40 }
                    : { flexDirection: 'row-reverse', paddingLeft: 40 },
                ]}>
                <NodeButton
                  kind={kind}
                  icon={kind === 'done' ? '✓' : kind === 'now' ? '▶' : String(lesson.order)}
                  no={String(lesson.order).padStart(2, '0')}
                  onPress={() => open(i)}
                />
                <View style={[styles.label, { alignItems: left ? 'flex-start' : 'flex-end' }]}>
                  <Txt f="m" s={13} w={700}>
                    {lesson.title}
                  </Txt>
                  <Txt s={11} c={t.colors.textDim}>
                    {kind === 'done'
                      ? 'Bitti'
                      : kind === 'now'
                        ? 'Şimdi'
                        : `${lesson.exercises.length} alıştırma`}
                  </Txt>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

function NodeButton({
  kind,
  icon,
  no,
  onPress,
}: {
  kind: MapNodeKind;
  icon: string;
  no: string;
  onPress: () => void;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const content = (
    <>
      <Txt
        f="m"
        s={15}
        w={800}
        c={kind === 'done' ? t.colors.successSoft : kind === 'lock' ? t.colors.textGhost : t.colors.text}>
        {icon}
      </Txt>
      <Txt
        f="mono"
        s={10}
        w={700}
        ls={0.06}
        c={kind === 'done' ? t.colors.successSoft : kind === 'lock' ? t.colors.textGhost : t.colors.text}>
        {no}
      </Txt>
    </>
  );

  if (kind === 'now') {
    return (
      <Press onPress={onPress} scale={0.96} accessibilityRole="button">
        <Gradient colors={t.gradients.brand} style={[styles.node, styles.nodeNow]}>
          {content}
        </Gradient>
      </Press>
    );
  }

  return (
    <Press
      onPress={onPress}
      scale={0.96}
      accessibilityRole="button"
      accessibilityState={{ disabled: kind === 'lock' }}
      style={[
        styles.node,
        kind === 'done' && styles.nodeDone,
        kind === 'next' && styles.nodeNext,
        kind === 'lock' && styles.nodeLock,
      ]}>
      {content}
    </Press>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18 },
    pct: {
      marginLeft: 'auto',
      paddingVertical: 6,
      paddingHorizontal: 11,
      borderRadius: radii.chip,
      backgroundColor: 'rgba(34,211,238,.14)',
      borderWidth: 1,
      borderColor: 'rgba(34,211,238,.3)',
    },
    path: { paddingHorizontal: 18, paddingTop: 18 },
    spine: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2 },
    nodes: { gap: 14 },
    nodeRow: { alignItems: 'center', gap: 14 },
    label: { flex: 1 },
    node: {
      width: 74,
      height: 74,
      borderRadius: radii.screen,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    nodeDone: {
      backgroundColor: 'rgba(34,197,94,.16)',
      borderWidth: 1,
      borderColor: 'rgba(34,197,94,.36)',
    },
    nodeNow: { borderWidth: 1, borderColor: t.alpha.w20, boxShadow: t.shadows.node },
    nodeNext: { backgroundColor: t.colors.surfaceHigh, borderWidth: 1, borderColor: t.alpha.w14 },
    nodeLock: {
      backgroundColor: t.alpha.w03,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: t.alpha.w14,
    },
  });
