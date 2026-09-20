import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { tint } from '../../theme/tint';
import { Gradient } from '../Gradient';
import { Txt } from '../Txt';
import { font, radii } from '../../theme/tokens';

/**
 * Harf taşı.
 *
 * Arenada oynanan şey bu: harfler alınıp yuvalara konuyor. Tanıtım
 * ekranındaki çizim de bunu göstersin diye aynı taş, çizim parçası olarak
 * ayrıldı — çizimdeki taşla oyundaki taş aynı şey olmalı, biri ötekinin
 * resmi değil.
 *
 * Harfler `mono` ile yazılıyor. Manrope 800'de büyük U ile V, I ile l
 * birbirine karışıyor ve bir harf oyununda bu, oyunun kendisini bozar —
 * kullanıcı geri bildirimi tam olarak bunu söyledi ("U harfi belli değil").
 */
export type TileState = 'filled' | 'empty' | 'loose';

export function LetterTile({
  letter,
  state = 'filled',
  size = 46,
  style,
}: {
  letter?: string;
  state?: TileState;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const box: ViewStyle = {
    width: size,
    height: size * 1.16,
    borderRadius: radii.card,
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (state === 'filled') {
    return (
      <Gradient
        deg={140}
        colors={t.gradients.brand}
        style={[box, { boxShadow: t.shadows.ctaBrandSmall }, style]}>
        <Txt f="mono" s={font.headline} w={800} c={t.colors.onBrand}>
          {letter}
        </Txt>
      </Gradient>
    );
  }

  if (state === 'loose') {
    return (
      <View
        style={[
          box,
          {
            backgroundColor: tint(t.colors.raised, 0.92),
            borderWidth: 1,
            borderColor: t.alpha.w12,
          },
          style,
        ]}>
        <Txt f="mono" s={font.headline} w={800} c={t.colors.textMuted}>
          {letter}
        </Txt>
      </View>
    );
  }

  // Boş yuva: kesikli çerçeve. Dolu taşla aynı ölçüde, böylece sıra
  // doldukça satır genişlemiyor — harf koydukça zıplayan bir satır,
  // nereye bastığını takip etmeyi zorlaştırıyordu.
  return (
    <View
      style={[
        box,
        {
          backgroundColor: t.colors.sunken,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: t.alpha.w18,
        },
        style,
      ]}
    />
  );
}

export const tileStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
