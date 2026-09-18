import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Press } from './Buttons';
import { Txt } from './Txt';
import { alpha, colors, radii } from '../theme/tokens';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Alanın altında kırmızı gösterilen sorun. Boşsa satır hiç çizilmez. */
  problem?: string | null;
  /** Şifre alanı: metin gizlenir ve bir "göster" düğmesi eklenir. */
  secret?: boolean;
  /** Alanın altındaki açıklama — kural varsa kullanıcı denemeden önce bilmeli. */
  hint?: string;
};

/**
 * Etiketli giriş alanı.
 *
 * Şifre alanında gizlemeyi açıp kapatan bir düğme var. Telefon klavyesinde
 * yazılan şifreyi hiç görememek, yanlış yazıp nedenini anlayamamak demek;
 * kullanıcı ne yazdığını görebilmeli. Varsayılan yine gizli.
 */
export function Field({ label, problem, secret = false, hint, ...rest }: Props) {
  const [shown, setShown] = useState(false);
  const bad = Boolean(problem);

  return (
    <View style={styles.wrap}>
      <Txt f="m" s={12.5} w={700} c={colors.textMuted}>
        {label}
      </Txt>

      <View style={styles.row}>
        <TextInput
          placeholderTextColor={colors.textGhost}
          secureTextEntry={secret && !shown}
          style={[styles.input, bad && styles.inputBad, secret && styles.inputWithButton]}
          accessibilityLabel={label}
          {...rest}
        />

        {secret ? (
          <Press
            onPress={() => setShown((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={shown ? 'Şifreyi gizle' : 'Şifreyi göster'}
            style={styles.eye}>
            <Txt f="m" s={12} w={700} c={colors.textMuted}>
              {shown ? 'Gizle' : 'Göster'}
            </Txt>
          </Press>
        ) : null}
      </View>

      {problem ? (
        <Txt s={12} lh={1.45} c={colors.errorTint}>
          {problem}
        </Txt>
      ) : hint ? (
        <Txt s={12} lh={1.45} c={colors.textGhost}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  row: { justifyContent: 'center' },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: alpha.w14,
    backgroundColor: alpha.w04,
    borderRadius: radii.input,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 15.5,
  },
  inputWithButton: { paddingRight: 72 },
  inputBad: {
    borderColor: 'rgba(255,77,94,.55)',
    backgroundColor: 'rgba(255,77,94,.08)',
  },
  eye: {
    position: 'absolute',
    right: 12,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
});
