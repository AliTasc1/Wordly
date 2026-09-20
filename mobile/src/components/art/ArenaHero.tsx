import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../../theme/ThemeContext';
import type { Theme } from '../../theme/theme';
import { tint } from '../../theme/tint';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Gradient } from '../Gradient';
import { Txt } from '../Txt';
import { LetterTile } from './LetterTile';
import { font, radii } from '../../theme/tokens';

/*
  Tanıtım ekranının kahraman görseli.

  Burada çizgili bir yer tutucu duruyordu; üstünde "görsel: harf arenası
  sahnesi" yazıyordu. Uygulamayı ilk açan kişinin gördüğü ilk şey, henüz
  yapılmamış bir işin notuydu.

  Yerine gelen çizim uydurma bir sahne değil: oyunun kendisi. Altı yuva
  uygulamanın adını heceliyor, dördü dolu, ikisi boş; üstte üç serbest harf
  duruyor — yani ekranda görünen şey, iki dokunuş sonra kullanıcının
  yapacağı şeyin ta kendisi.

  Tamamen vektör: ne indirilecek dosya var, ne pakete eklenen ağırlık, ne de
  temaya uymayan sabit bir resim. Açık temada da koyu temada da kendi
  renklerini temadan alıyor.
*/

const SLOTS = [
  { letter: 'W', filled: true },
  { letter: 'O', filled: true },
  { letter: 'R', filled: true },
  { letter: 'D', filled: true },
  { letter: 'L', filled: false },
  { letter: 'Y', filled: false },
];

/** Üstte duran serbest harfler — seçilmeyi bekleyenler. */
const LOOSE = [
  { letter: 'Y', deg: -9 },
  { letter: 'L', deg: 5 },
  { letter: 'K', deg: -4 },
];

export function ArenaHero({ height = 300 }: { height?: number }) {
  const t = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <View style={[styles.wrap, { height }]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="hero-glow-a" cx="78%" cy="14%" r="62%">
            <Stop offset="0" stopColor={t.colors.accent} stopOpacity={t.dark ? 0.3 : 0.16} />
            <Stop offset="1" stopColor={t.colors.accent} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="hero-glow-b" cx="16%" cy="86%" r="66%">
            <Stop offset="0" stopColor={t.colors.secondary} stopOpacity={t.dark ? 0.26 : 0.14} />
            <Stop offset="1" stopColor={t.colors.secondary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#hero-glow-a)" />
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#hero-glow-b)" />
        {/* Kesikli halka: arenanın harf çarkı. Ortada duruyor ve taşların
            arkasında kalıyor, sahneyi çerçeveliyor. */}
        <Circle
          cx="50%"
          cy="44%"
          r={96}
          fill="none"
          stroke={t.alpha.w14}
          strokeWidth={1.5}
          strokeDasharray="5 9"
        />
        <Circle
          cx="50%"
          cy="44%"
          r={68}
          fill="none"
          stroke={t.alpha.w08}
          strokeWidth={1}
          strokeDasharray="3 7"
        />
      </Svg>

      <View style={styles.scene}>
        <View style={styles.loose}>
          {LOOSE.map((l) => (
            <LetterTile
              key={l.letter}
              letter={l.letter}
              state="loose"
              size={38}
              style={{ transform: [{ rotate: `${l.deg}deg` }] }}
            />
          ))}
        </View>

        <View style={styles.slots}>
          {SLOTS.map((s) => (
            <LetterTile
              key={s.letter}
              letter={s.letter}
              state={s.filled ? 'filled' : 'empty'}
              size={40}
            />
          ))}
        </View>

        {/* İlerleme şeridi: dört harf konmuş, iki harf kalmış. Sayı
            uydurulmuyor — yukarıdaki yuvaların gerçek durumu. */}
        <View style={styles.bar}>
          <Gradient
            deg={90}
            colors={t.gradients.progress}
            style={[
              styles.barFill,
              { width: `${(SLOTS.filter((s) => s.filled).length / SLOTS.length) * 100}%` },
            ]}
          />
        </View>
        <Txt f="mono" s={font.label} w={700} c={t.colors.textFaint} ls={0.12}>
          HARF ARENASI
        </Txt>
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: {
      borderRadius: radii.screen,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: t.alpha.w08,
      backgroundColor: tint(t.colors.surface, t.dark ? 1 : 0.6),
      alignItems: 'center',
      justifyContent: 'center',
    },
    scene: { alignItems: 'center', gap: 14 },
    loose: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    slots: { flexDirection: 'row', gap: 6 },
    bar: {
      width: 148,
      height: 6,
      borderRadius: 9,
      backgroundColor: t.alpha.w08,
      overflow: 'hidden',
      marginTop: 2,
    },
    barFill: { height: '100%', borderRadius: 9 },
  });
