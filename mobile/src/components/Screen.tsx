import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import React, { useState } from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glow, GlowSpec } from './Glow';
import { Gradient } from './Gradient';
import { spacing } from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  /** Radial washes layered behind the content. */
  glows?: GlowSpec[];
  /** Design top padding. Grown to clear the notch when the inset is larger. */
  padTop?: number;
  /** Horizontal gutter. `0` for screens whose header bleeds edge to edge. */
  padH?: number;
  padBottom?: number;
  /** Adds room for the bottom tab bar (design: `padding-bottom:112px`). */
  tabbed?: boolean;
  /** Vertical rhythm between children (design: `gap:14px` on most screens). */
  gap?: number;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Rendered above the scroll area and pinned (used by the arena timer bar). */
  background?: React.ReactNode;
  /**
   * Ekranın altına sabitlenen eylem çubuğu — "Sonraki soru" gibi.
   *
   * Önce bu düğmeler içeriğin sonundaydı ve araya `<Spacer />` konuyordu.
   * Kısa ekranda doğru çalışıyordu: boşluk düğmeyi görüş alanının altına
   * itiyordu. Uzun ekranda ise düğme içeriğin sonuna düşüyor, yani ekranın
   * dışında kalıyordu. Okuma parçasını okuyan öğrenci şıkkı en üstte
   * işaretliyor, sonra onaylamak için aşağı kaydırmak zorunda kalıyordu —
   * her soruda, kırk soruluk seviye testinde kırk kez.
   *
   * Burada verilen düğme kaydırma alanının dışında, görüş alanının altına
   * sabitleniyor. Yüksekliği ölçülüp içeriğin alt boşluğuna ekleniyor;
   * yoksa son satır çubuğun arkasında kalır ve okunmaz.
   */
  footer?: React.ReactNode;
};

export function Screen({
  children,
  glows,
  padTop = 62,
  padH = spacing.gutter,
  padBottom = 40,
  tabbed = false,
  gap = 14,
  scroll = true,
  style,
  contentStyle,
  background,
  footer,
}: Props) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(padTop, insets.top + 8);

  // Çubuğun yüksekliği önceden bilinemiyor: içindeki düğme tek satır da
  // olabilir, yan yana iki düğme de. Ölçülüp içeriğin altına ekleniyor.
  const [footerHeight, setFooterHeight] = useState(0);
  const onFooterLayout = (event: LayoutChangeEvent) =>
    setFooterHeight(event.nativeEvent.layout.height);

  const paddingBottom =
    (tabbed ? spacing.tabBar + insets.bottom : padBottom + insets.bottom) +
    (footer ? footerHeight : 0);

  const inner: StyleProp<ViewStyle> = [
    { paddingTop, paddingHorizontal: padH, paddingBottom, gap },
    contentStyle,
  ];

  return (
    <View style={[styles.root, style]}>
      {glows ? <Glow glows={glows} /> : null}
      {background}
      {scroll ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.grow, inner]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, inner]}>{children}</View>
      )}

      {footer ? (
        <View
          onLayout={onFooterLayout}
          style={[
            styles.footer,
            {
              paddingHorizontal: padH,
              // Çubuk sekme menüsünün üstünde duruyor; tabbed ekranda menü
              // zaten alt şeridi kaplıyor, o yüzden güvenli alan payı orada
              // tekrar eklenmiyor.
              paddingBottom: tabbed ? 14 : 14 + insets.bottom,
              bottom: tabbed ? spacing.tabBar - 14 : 0,
            },
          ]}>
          {/* İçerik çubuğun altından geçerken sert bir kenarla kesilmesin:
              yukarı doğru saydamlaşan bir geçiş, altta devam eden metin
              olduğunu da gösteriyor. */}
          <Gradient
            deg={180}
            colors={['rgba(7,10,20,0)', t.colors.bg, t.colors.bg]}
            locations={[0, 0.45, 1]}
            style={styles.footerWash}
          />
          {footer}
        </View>
      ) : null}
    </View>
  );
}

/**
 * `flex:1` boşluk.
 *
 * Temasız: yalnızca yer kaplıyor, hiçbir rengi yok. Stil sayfası temaya
 * bağlandığı için buradan erişilemiyor ve bir kanca çağırmak yalnızca
 * `flex: 1` için abartı olurdu.
 */
export const Spacer = () => <View style={{ flex: 1 }} />;

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  root: { flex: 1, backgroundColor: t.colors.bg },
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 14,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.alpha.w06,
  },
  // Geçiş çubuğun üstüne taşıyor: kesme çizgisi çubuğun kendi sınırında
  // değil, ondan 18 piksel yukarıda başlıyor.
  footerWash: { position: 'absolute', left: 0, right: 0, bottom: 0, top: -18 },
});
