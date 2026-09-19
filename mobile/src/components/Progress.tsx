import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Polygon,
  Stop,
} from 'react-native-svg';
import { Gradient } from './Gradient';
import { Txt } from './Txt';
import { alpha, colors, gradients } from '../theme/tokens';

/**
 * `bar(pct, c1, c2)` from the design: a rounded track with a gradient fill.
 */
export function ProgressBar({
  pct,
  from = gradients.progress[0],
  to = gradients.progress[1],
  height = 6,
  track = alpha.w08,
  glow,
  style,
}: {
  pct: number;
  from?: string;
  to?: string;
  height?: number;
  track?: string;
  /** `box-shadow:0 0 16px rgba(34,211,238,.5)` on the daily-goal bar. */
  glow?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        { height, borderRadius: 9, backgroundColor: track, overflow: 'hidden' },
        style,
      ]}>
      <Gradient
        deg={90}
        colors={[from, to]}
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          height: '100%',
          borderRadius: 9,
          boxShadow: glow,
        }}
      />
    </View>
  );
}

/**
 * The design's `conic-gradient(...)` rings. React Native has no conic
 * gradient, so the arc is drawn as an SVG stroke — same result, and it
 * animates and scales cleanly.
 */
export function ProgressRing({
  size,
  thickness,
  pct,
  color,
  track = 'rgba(255,255,255,.09)',
  children,
  style,
}: {
  size: number;
  thickness: number;
  pct: number;
  color: string;
  track?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, pct)) / 100) * c;
  return (
    <View style={[{ width: size, height: size }, styles.center, style]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={thickness}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="butt"
          strokeDasharray={`${filled} ${c - filled}`}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

/** The CEFR result donut — a ring with a filled inner disc. */
export function ResultDonut({
  pct,
  level,
  caption,
}: {
  pct: number;
  level: string;
  caption: string;
}) {
  return (
    <ProgressRing
      size={148}
      thickness={12}
      pct={pct}
      color={colors.accent}
      track={alpha.w08}>
      <View style={styles.donutInner}>
        <Txt f="m" s={40} w={800} ls={-0.02}>
          {level}
        </Txt>
        <Txt f="mono" s={10.5} w={600} c={colors.textDim} ls={0.1}>
          {caption}
        </Txt>
      </View>
    </ProgressRing>
  );
}

/** `name — bar — level` rows on the result, profile and stats screens. */
export function SkillBar({
  name,
  value,
  pct,
  from = colors.primary,
  to = colors.accent,
  nameWidth = 74,
  valueWidth = 34,
  valueColor = colors.textDim,
  barHeight = 7,
}: {
  name: string;
  value: string;
  pct: number;
  from?: string;
  to?: string;
  nameWidth?: number;
  valueWidth?: number;
  valueColor?: string;
  barHeight?: number;
}) {
  return (
    <View style={styles.skillRow}>
      <Txt s={11.5} w={600} c={colors.textSubtle} style={{ width: nameWidth }}>
        {name}
      </Txt>
      <ProgressBar pct={pct} from={from} to={to} height={barHeight} style={styles.flex} />
      <Txt
        f="mono"
        s={11}
        w={700}
        c={valueColor}
        style={{ width: valueWidth, textAlign: 'right' }}>
        {value}
      </Txt>
    </View>
  );
}

/** Vertical column chart on the stats screen. */
export function ColumnChart({
  data,
  max,
  height = 104,
  highlightFrom = 1000,
}: {
  data: { label: string; value: number }[];
  max: number;
  height?: number;
  highlightFrom?: number;
}) {
  return (
    <View style={styles.chart}>
      {data.map((d) => (
        <View key={d.label} style={styles.chartCol}>
          <Gradient
            deg={180}
            colors={
              d.value >= highlightFrom
                ? [colors.accent, colors.primary]
                : ['rgba(46,107,255,.75)', 'rgba(124,92,255,.5)']
            }
            style={{
              width: '100%',
              height: Math.round((d.value / max) * height),
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
            }}
          />
          <Txt f="mono" s={10} w={600} c={colors.textFaint}>
            {d.label}
          </Txt>
        </View>
      ))}
    </View>
  );
}

/** Radar chart behind the level-test result. */
const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  donutInner: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: alpha.w08,
  },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 7, height: 130 },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    height: '100%',
    justifyContent: 'flex-end',
  },
});
