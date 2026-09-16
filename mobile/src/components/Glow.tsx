import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

export type GlowSpec = {
  /** Horizontal radius in px, matching the design's `radial-gradient(<rx>px …)`. */
  rx: number;
  /** Vertical radius in px. */
  ry: number;
  /** Centre, as a fraction of the screen (`at 50% 30%` → 0.5 / 0.3). */
  cx: number;
  cy: number;
  color: string;
  /** Opacity of the colour at the centre. */
  opacity: number;
  /** Where the ramp reaches transparent (`transparent 65%` → 0.65). */
  stop?: number;
};

/**
 * The design layers `radial-gradient(...)` washes behind several screens.
 * React Native has no radial gradient, so each wash is drawn as an SVG ellipse
 * with a radial fill — visually equivalent and stable on both platforms.
 */
export function Glow({ glows }: { glows: GlowSpec[] }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          {glows.map((g, i) => (
            <RadialGradient key={i} id={`glow-${i}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={g.color} stopOpacity={g.opacity} />
              <Stop offset={`${(g.stop ?? 0.65) * 100}%`} stopColor={g.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {glows.map((g, i) => (
          <Ellipse
            key={i}
            cx={`${g.cx * 100}%`}
            cy={`${g.cy * 100}%`}
            rx={g.rx}
            ry={g.ry}
            fill={`url(#glow-${i})`}
          />
        ))}
      </Svg>
    </View>
  );
}
