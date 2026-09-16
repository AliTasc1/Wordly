import React from 'react';
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient';

/**
 * Converts a CSS gradient angle (0deg = up, clockwise) into the `start`/`end`
 * fractions expo-linear-gradient expects, normalised so the ramp spans the
 * whole box the way CSS does.
 */
export function angle(deg: number) {
  const rad = (deg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const scale = 1 / Math.max(Math.abs(dx), Math.abs(dy) || 1e-6);
  const sx = (dx * scale) / 2;
  const sy = (dy * scale) / 2;
  return {
    start: { x: 0.5 - sx, y: 0.5 - sy },
    end: { x: 0.5 + sx, y: 0.5 + sy },
  };
}

export type GradientProps = Omit<LinearGradientProps, 'start' | 'end'> & {
  /** CSS angle in degrees. Defaults to 135° — the design's workhorse. */
  deg?: number;
};

/** `linear-gradient(<deg>, …)` as a view. */
export function Gradient({ deg = 135, ...rest }: GradientProps) {
  const { start, end } = angle(deg);
  return <LinearGradient start={start} end={end} {...rest} />;
}
