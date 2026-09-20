import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { GhostButton, PrimaryButton } from './Buttons';

/**
 * Alıştırma ekranlarının sabit eylem çubuğu.
 *
 * Bölümler arka arkaya bağlı: gramer bitince dinleme, dinleme bitince okuma.
 * Zincir kendi başına iyi bir şey — öğrenci "şimdi ne yapsam" diye durmuyor.
 * Ama tek çıkışı olan bir koridor oluyordu: bugün yalnızca dinleme çalışmak
 * isteyen kişi, bölüm sonunda kendini okuma ekranında buluyordu.
 *
 * Çözüm zinciri kırmak değil, yanına bir kapı koymak. Son adımda iki düğme
 * çıkıyor: "Derse dön" ve zincirin devamı. Devam düğmesi baskın kalıyor,
 * çünkü çoğunluk için doğru olan hâlâ o.
 *
 * Ara adımlarda tek düğme var: orada çıkış zaten geri düğmesiyle mümkün ve
 * her soruda bir "Derse dön" göstermek, asıl eylemin yanına sürekli bir
 * kaçış yolu koyup onu zayıflatırdı.
 */
export function StepFooter({
  label,
  onPress,
  onExit,
  disabled,
}: {
  label: string;
  onPress: () => void;
  /** Verilirse yanına "Derse dön" çıkıyor — bölümün son adımında. */
  onExit?: () => void;
  disabled?: boolean;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const next = (
    <PrimaryButton
      label={label}
      height={54}
      size={15.5}
      shadow={t.shadows.ctaBrand}
      onPress={onPress}
      disabled={disabled}
      style={onExit ? styles.grow : undefined}
    />
  );

  if (!onExit) return next;

  return (
    <View style={styles.row}>
      <GhostButton
        label="Derse dön"
        height={54}
        radius={16}
        size={14}
        fill={t.alpha.w04}
        onPress={onExit}
        style={styles.exit}
      />
      {next}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: 10 },
    // Çıkış düğmesi dar: eşit bölünmüş iki düğme, ikisini de eşit derecede
    // doğru gösterir. Devam etmek çoğunluk için doğru olan.
    exit: { flexBasis: 118 },
    grow: { flex: 1 },
  });
