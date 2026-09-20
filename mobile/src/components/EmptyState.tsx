import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme, ColorRole } from '../theme/theme';
import { tint } from '../theme/tint';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Press } from './Buttons';
import { Txt } from './Txt';
import { font, radii } from '../theme/tokens';

/*
  Boş durum.

  Dört ekranda dört ayrı boş durum vardı: her biri elle yazılmış, biri
  emojiyi 31 puntoda gösteriyor, öteki 27'de, birinde düğme var, ötekinde
  yok. Aynı durumu anlatan dört farklı ekran, tek bir ekranın dört kez
  yazılmış hâlinden kötüdür — kullanıcı her seferinde yeni bir arayüz
  öğreniyor sanıyor.

  Simge artık boşlukta duran bir emoji değil, madalyonun içinde: iki kesikli
  halka ve rengi rolden gelen yumuşak bir hale. Aynı öğe, dört ekranda aynı
  yerde, aynı ölçüde.
*/

export function EmptyState({
  glyph,
  title,
  text,
  action,
  onAction,
  role = 'accent',
}: {
  glyph: string;
  title: string;
  text: string;
  /** Tek bir eylem. İki eylem, boş bir ekranda karar yüküdür. */
  action?: string;
  onAction?: () => void;
  role?: ColorRole;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const renk = t.colors[role];

  return (
    <View style={styles.wrap}>
      <View style={styles.medallion}>
        <Svg width={104} height={104} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id={`empty-${role}`} cx="50%" cy="42%" r="58%">
              <Stop offset="0" stopColor={renk} stopOpacity={t.dark ? 0.28 : 0.16} />
              <Stop offset="1" stopColor={renk} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={52} cy={52} r={50} fill={`url(#empty-${role})`} />
          <Circle
            cx={52}
            cy={52}
            r={50}
            fill="none"
            stroke={tint(renk, 0.3)}
            strokeWidth={1.5}
            strokeDasharray="4 8"
          />
          <Circle
            cx={52}
            cy={52}
            r={38}
            fill="none"
            stroke={t.alpha.w08}
            strokeWidth={1}
            strokeDasharray="2 6"
          />
        </Svg>
        <Txt s={font.jumbo}>{glyph}</Txt>
      </View>

      <Txt f="m" s={font.callout} w={800} style={styles.center}>
        {title}
      </Txt>
      <Txt s={font.footnote} lh={1.6} c={t.colors.textDim} style={styles.center}>
        {text}
      </Txt>

      {action && onAction ? (
        <Press
          onPress={onAction}
          accessibilityRole="button"
          style={[styles.cta, { borderColor: tint(renk, 0.35), backgroundColor: tint(renk, 0.12) }]}>
          <Txt f="m" s={font.footnote} w={800}>
            {action}
          </Txt>
        </Press>
      ) : null}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 18 },
    medallion: {
      width: 104,
      height: 104,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    center: { textAlign: 'center' },
    cta: {
      marginTop: 6,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: radii.input,
      borderWidth: 1,
    },
  });
