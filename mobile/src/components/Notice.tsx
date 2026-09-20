import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Txt } from './Txt';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { font, radii } from '../theme/tokens';
import { tint } from '../theme/tint';

export type NoticeTone = 'error' | 'ok' | 'info';

/**
 * Tonun kenarı, dolgusu ve yazı rengi.
 *
 * Sabit bir tabloydu ve dolgular koyu temaya göre elle yazılmıştı
 * (`rgba(255,77,94,.10)` gibi). Açık temada o değerler beyaz zeminde
 * neredeyse görünmez kalıyordu. Artık dolgu, tonun kendi renginden
 * türetiliyor: hangi temada olursa olsun aynı işi görüyor.
 */
function tonesOf(t: Theme): Record<NoticeTone, { border: string; fill: string; text: string }> {
  return {
    error: {
      border: tint(t.colors.error, 0.42),
      fill: tint(t.colors.error, t.dark ? 0.1 : 0.07),
      text: t.colors.errorTint,
    },
    ok: {
      border: tint(t.colors.success, 0.42),
      fill: tint(t.colors.success, t.dark ? 0.1 : 0.07),
      text: t.colors.successText,
    },
    info: {
      border: tint(t.colors.accent, 0.38),
      fill: tint(t.colors.accent, t.dark ? 0.09 : 0.07),
      text: t.colors.accentSoft,
    },
  };
}

/**
 * Ekranın söylemek zorunda olduğu tek cümlelik durum.
 *
 * `detail` sunucunun kendi metni. Çevirisini bilmediğimiz bir hatada onu
 * silmek yerine küçük puntoyla altına koyuyoruz: kullanıcıya "bir şeyler ters
 * gitti" deyip sebebi saklamak, sorunu bildirmesini de imkânsız kılar.
 */
export function Notice({
  tone = 'info',
  text,
  detail,
}: {
  tone?: NoticeTone;
  text: string;
  detail?: string;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const look = tonesOf(t)[tone];
  return (
    <View style={[styles.box, { borderColor: look.border, backgroundColor: look.fill }]}>
      <Txt f="m" s={font.footnote} w={700} lh={1.45} c={look.text}>
        {text}
      </Txt>
      {detail ? (
        <Txt s={font.caption} lh={1.45} c={t.colors.textGhost}>
          {detail}
        </Txt>
      ) : null}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    box: {
      borderWidth: 1,
      borderRadius: radii.input,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 6,
    },
  });
