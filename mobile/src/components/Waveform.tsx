import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Gradient } from './Gradient';
import { alpha, colors } from '../theme/tokens';

/** The fixed bar heights the design uses for every playback waveform. */
export const WAVE = [
  8, 14, 22, 11, 26, 17, 30, 13, 9, 20, 28, 15, 24, 10, 18, 26, 12, 21, 30, 16, 9, 23, 13, 27,
  11, 7,
];

/** Heights used while the microphone is live on the speaking screen. */
export const REC_WAVE = [
  6, 12, 20, 9, 24, 15, 28, 11, 7, 18, 26, 13, 22, 8, 16, 24, 10, 19, 28, 14, 7, 21, 11, 25, 9,
  6,
];

export function Waveform({
  heights = WAVE,
  /** `tall` variant on the listening player: 2.3× height, front half brighter. */
  tall = false,
  /** Idle state for the recorder — flat 4px bars. */
  idle = false,
  /**
   * How far playback has got, 0–1. Bars before this point are lit, the rest
   * stay dim — the waveform then shows real progress instead of decorating
   * the player with a fixed pattern.
   */
  lit,
  height,
  style,
}: {
  heights?: number[];
  tall?: boolean;
  idle?: boolean;
  lit?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.row, height != null && { height }, style]}>
      {heights.map((h, i) => {
        const barHeight = idle ? 4 : tall ? Math.round(h * 2.3) : h;
        if (idle) {
          return <View key={i} style={[styles.bar, { height: barHeight, backgroundColor: alpha.w14 }]} />;
        }
        return (
          <Gradient
            key={i}
            deg={180}
            colors={[colors.accent, colors.primary]}
            style={[
              styles.bar,
              {
                height: barHeight,
                borderRadius: tall ? 3 : 2,
                opacity:
                  lit != null
                    ? i < Math.round(lit * heights.length)
                      ? 0.95
                      : 0.28
                    : tall
                      ? i < 10
                        ? 0.95
                        : 0.4
                      : 0.8,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  bar: { flex: 1, borderRadius: 2 },
});
