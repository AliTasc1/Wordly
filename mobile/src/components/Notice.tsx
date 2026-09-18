import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Txt } from './Txt';
import { colors, radii } from '../theme/tokens';

export type NoticeTone = 'error' | 'ok' | 'info';

const TONES: Record<NoticeTone, { border: string; fill: string; text: string }> = {
  error: {
    border: 'rgba(255,77,94,.42)',
    fill: 'rgba(255,77,94,.10)',
    text: colors.errorTint,
  },
  ok: {
    border: 'rgba(34,197,94,.42)',
    fill: 'rgba(34,197,94,.10)',
    text: colors.successText,
  },
  info: {
    border: 'rgba(34,211,238,.38)',
    fill: 'rgba(34,211,238,.09)',
    text: colors.accentSoft,
  },
};

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
  const t = TONES[tone];
  return (
    <View style={[styles.box, { borderColor: t.border, backgroundColor: t.fill }]}>
      <Txt f="m" s={13} w={700} lh={1.45} c={t.text}>
        {text}
      </Txt>
      {detail ? (
        <Txt s={11.5} lh={1.45} c={colors.textGhost}>
          {detail}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radii.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 5,
  },
});
