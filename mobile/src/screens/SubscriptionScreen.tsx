import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { BackButton } from '../components/Buttons';
import { Notice } from '../components/Notice';
import { ScreenHeading } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { useBack } from '../navigation/useGo';

/**
 * 29 · Abonelik.
 *
 * Bu ekran bir ödeme ekranıydı ve sattığı şey yoktu.
 *
 * Kullanım sayaçları uydurmaydı: "Günlük ders 3/5", "AI konuşma 1/1 · limit
 * doldu", "Oyun turu 6/10". Uygulamada böyle bir limit hiç olmadı; sayılar
 * sabit yazılmıştı ve tek işlevleri baskı yaratmaktı.
 *
 * Premium listesi de öyleydi:
 *
 * - "Sınırsız ders" — var olmayan bir limiti kaldırmayı vaat ediyordu
 * - "AI İngilizce Koçu · hafızalı kişisel öğretmen" — böyle bir şey yok
 * - "Sınırsız konuşma · telaffuz analizi dahil" — telaffuz puanı yok
 * - "Gelişmiş analiz" — analiz zaten ücretsiz ve herkese açık
 * - "Kişisel müfredat" — yok
 * - "Çevrimdışı öğrenme" — uygulama zaten tamamen çevrimdışı çalışıyor
 *
 * Yani ₺1.099/yıl karşılığında ya zaten ücretsiz olan ya da hiç var olmayan
 * şeyler satılıyordu. Parayı almadan önce verecek bir şeyin olması gerekir.
 *
 * Ekran, ödeme altyapısı (RevenueCat) ve gerçekten kilitli bir özellik
 * geldiğinde geri gelecek. O güne kadar doğru olanı söylüyor.
 */
export function SubscriptionScreen() {
  const back = useBack('profile');

  return (
    <Screen tabbed padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <ScreenHeading kicker="PLAN" title="Abonelik" />
      </View>

      <Notice
        tone="ok"
        text="Şu an her şey ücretsiz."
        detail="Ücretli bir plan yok ve hiçbir bölüm kilitli değil."
      />

      <View style={styles.card}>
        <Txt f="mono" s={10} w={700} c={colors.textDisabled} ls={0.14}>
          AÇIK OLANLAR
        </Txt>
        <Txt s={13} lh={1.7} c={colors.textSubtle}>
          · Altı seviyenin tamamı (A1–C2){'\n'}· Kelime, gramer, okuma, dinleme, konuşma,
          yazma{'\n'}· Günlük ve oyun turu sınırı yok{'\n'}· İstatistikler, başarımlar ve
          hata defteri{'\n'}· Çevrimdışı çalışma{'\n'}· Hesap ve cihazlar arası eşitleme
        </Txt>
      </View>

      <View style={styles.card}>
        <Txt f="mono" s={10} w={700} c={colors.textDisabled} ls={0.14}>
          HENÜZ YAPILMADI
        </Txt>
        <Txt s={13} lh={1.7} c={colors.textSubtle}>
          · Telaffuz puanlama{'\n'}· Yazma ve konuşmaya serbest geri bildirim{'\n'}·
          Arkadaş, kulüp ve düello
        </Txt>
        <Txt s={12} lh={1.55} c={colors.textFaint} style={styles.note}>
          Bunlar ileride ücretli olabilir. Olduğunda burada yazacak — önceden para isteyip
          sonra vermek olmaz.
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: {
    gap: 8,
    padding: 16,
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: alpha.w08,
    backgroundColor: colors.surface,
  },
  note: { marginTop: 2 },
});
