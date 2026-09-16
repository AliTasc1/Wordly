import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press } from '../components/Buttons';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii, shadows } from '../theme/tokens';
import { MAP_NODES, MapNodeKind } from '../data/curriculum';
import { useBack, useGo } from '../navigation/useGo';

/** 08 · Kurs Haritası — a progress path, not an LMS table. */
export function CourseMapScreen() {
  const { go } = useGo();
  const back = useBack('learn');

  return (
    <Screen tabbed padTop={62} padH={0} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View>
          <Txt f="m" s={19} w={800}>
            B1 · Orta Seviye
          </Txt>
          <Txt s={11.5} w={600} c={colors.textDim}>
            12/20 ünite · 4.860 XP
          </Txt>
        </View>
        <View style={styles.pct}>
          <Txt f="mono" s={11} w={700} c={colors.accentSoft}>
            %60
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
          {MAP_NODES.map((node, i) => {
            const left = i % 2 === 0;
            return (
              <View
                key={node.no}
                style={[
                  styles.nodeRow,
                  left
                    ? { flexDirection: 'row', paddingRight: 40 }
                    : { flexDirection: 'row-reverse', paddingLeft: 40 },
                ]}>
                <NodeButton
                  kind={node.kind}
                  icon={node.icon}
                  no={node.no}
                  onPress={() => go(node.kind === 'lock' ? 'map' : 'lesson')}
                />
                <View style={[styles.label, { alignItems: left ? 'flex-start' : 'flex-end' }]}>
                  <Txt f="m" s={13} w={700}>
                    {node.name}
                  </Txt>
                  <Txt s={11} c={colors.textDim}>
                    {node.sub}
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
  const content = (
    <>
      <Txt
        f="m"
        s={15}
        w={800}
        c={kind === 'done' ? colors.successSoft : kind === 'lock' ? colors.textGhost : colors.text}>
        {icon}
      </Txt>
      <Txt
        f="mono"
        s={10}
        w={700}
        ls={0.06}
        c={kind === 'done' ? colors.successSoft : kind === 'lock' ? colors.textGhost : colors.text}>
        {no}
      </Txt>
    </>
  );

  if (kind === 'now') {
    return (
      <Press onPress={onPress} scale={0.96} accessibilityRole="button">
        <Gradient colors={gradients.brand} style={[styles.node, styles.nodeNow]}>
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

const styles = StyleSheet.create({
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
  nodeNow: { borderWidth: 1, borderColor: alpha.w20, boxShadow: shadows.node },
  nodeNext: { backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: alpha.w14 },
  nodeLock: {
    backgroundColor: alpha.w03,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: alpha.w14,
  },
});
