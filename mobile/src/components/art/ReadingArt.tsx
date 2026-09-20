import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../../theme/ThemeContext';
import type { Theme } from '../../theme/theme';
import { tint } from '../../theme/tint';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Txt } from '../Txt';
import { font, radii } from '../../theme/tokens';

/*
  Okuma parçasının görseli üretilmediğinde ne görünecek?

  Önce çizgili bir yer tutucu vardı, üstünde parçanın İngilizce başlığı
  yazıyordu. Diyagonal çizgiler "bu iş bitmedi" demenin görsel hâliydi ve
  yüz elli parçanın yüz ellisinde öyle duruyordu.

  Yerine geçen çizim bir yer tutucu değil, bir kapak: parçanın başlığını
  taşıyan, sayfayı andıran bir sahne. Görseli üretilmiş parçalar yine
  fotoğrafı gösteriyor; üretilmemiş olanlar eksik değil, sade duruyor.

  Rengi parçanın kimliğinden türüyor, rastgele değil: aynı parça her
  açılışta aynı renkte. Sonraki parçaya geçince renk değişiyor, böylece
  arka arkaya iki parça birbirine benzemiyor.
*/

/** Aynı kimlik her zaman aynı sahne. */
function hashOf(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.codePointAt(0)!) % 100_000;
  return h;
}

export function ReadingArt({ id, title }: { id: string; title: string }) {
  const t = useTheme();
  const styles = useStyles(makeStyles);

  const h = hashOf(id);
  const tonlar = [t.colors.primary, t.colors.secondary, t.colors.accent, t.colors.success];
  const renk = tonlar[h % tonlar.length];
  // Tepe çizgisinin yüksekliği de kimlikten: her parçanın ufku başka.
  const ufuk = 58 + (h % 5) * 6;

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox="0 0 320 180" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={`read-${id}`} cx="72%" cy="22%" r="72%">
            <Stop offset="0" stopColor={renk} stopOpacity={t.dark ? 0.34 : 0.2} />
            <Stop offset="1" stopColor={renk} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={320} height={180} fill={`url(#read-${id})`} />
        {/* Ufuk: iki yumuşak tepe. Hangi konu olduğunu iddia etmiyor —
            görselin işi sahneyi anlatmak değil, sayfaya bir üst kapak
            vermek. */}
        <Path
          d={`M0 ${ufuk + 62} C 60 ${ufuk + 20}, 110 ${ufuk + 74}, 176 ${ufuk + 40} S 268 ${ufuk}, 320 ${ufuk + 52} L320 180 L0 180 Z`}
          fill={tint(renk, t.dark ? 0.22 : 0.14)}
        />
        <Path
          d={`M0 ${ufuk + 96} C 74 ${ufuk + 58}, 138 ${ufuk + 108}, 208 ${ufuk + 74} S 286 ${ufuk + 46}, 320 ${ufuk + 88} L320 180 L0 180 Z`}
          fill={tint(renk, t.dark ? 0.34 : 0.22)}
        />
        <Circle cx={258} cy={44} r={20} fill={tint(renk, t.dark ? 0.5 : 0.3)} />
      </Svg>

      <View style={styles.label} pointerEvents="none">
        <Txt f="m" s={font.callout} w={800} numberOfLines={2}>
          {title}
        </Txt>
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    // Yer tutucu 132 piksel sabitti; gerçek görseller 16:9. İkisi aynı
    // oranda duruyor, böylece görseller parça parça geldikçe ekran
    // zıplamıyor.
    wrap: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: radii.input,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: t.alpha.w08,
      backgroundColor: t.colors.sunken,
      justifyContent: 'flex-end',
    },
    label: { padding: 14 },
  });
