import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Buttons';
import { Notice } from '../components/Notice';
import { ScreenHeading } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { useAuth } from '../state/AuthContext';
import { useGo } from '../navigation/useGo';

/**
 * 20 · Sosyal.
 *
 * Bu sekmede beş ekran vardı ve hepsi uydurmaydı: akışta Gözde'nin gönderisi,
 * Mert'in yorumu, "48 beğeni", arkadaş listesi, "Developers English" kulübü ve
 * haftalık turnuvası. Hiçbiri var olmadı. Uygulamayı açan kişi kendisinden
 * başka kimsenin olmadığı bir yerde kalabalık görüyordu.
 *
 * Silmek yerine "yakında" yazmak da bir söz olurdu; onun yerine neyin neden
 * olmadığı yazılı. Gerçekten yapılabilen tek sosyal şey — haftalık sıralama —
 * zaten çalışıyor ve buradan erişiliyor.
 *
 * Akış ve kulüpler kullanıcı üretimi içerik demek: moderasyon, şikâyet ve
 * engelleme gerektiriyor. App Store bunu şart koşuyor ve haklı olarak — bir
 * yazma alanı açıp denetimsiz bırakmak, oradaki herkesi korumasız bırakmaktır.
 */
export function SocialScreen() {
  const { go } = useGo();
  const { user } = useAuth();

  return (
    <Screen tabbed padTop={62} gap={14}>
      <ScreenHeading kicker="TOPLULUK" title="Sosyal" />

      <Press onPress={() => go('board')} scale={0.99}>
        <View style={styles.card}>
          <Txt s={24}>🏆</Txt>
          <View style={styles.flex}>
            <Txt f="m" s={15} w={800}>
              Haftalık liderlik
            </Txt>
            <Txt s={12} lh={1.5} c={colors.textDim}>
              {user
                ? 'Katılanların bu hafta kazandığı XP sıralanır'
                : 'Hesap açtığında katılabilirsin'}
            </Txt>
          </View>
          <Txt f="m" s={20} w={800}>
            ›
          </Txt>
        </View>
      </Press>

      <Notice
        tone="info"
        text="Akış, arkadaşlar ve kulüpler henüz yok."
        detail="Buradaki gönderiler, yorumlar ve kulüpler tasarım maketinden gelen örneklerdi; kimse gerçek değildi. Uydurma bir kalabalık göstermektense yerini boş bırakıyoruz."
      />

      <View style={styles.why}>
        <Txt f="mono" s={10} w={700} c={colors.textDisabled} ls={0.14}>
          NEDEN BEKLİYOR
        </Txt>
        <Txt s={12.5} lh={1.65} c={colors.textSubtle}>
          Paylaşım açmak, yazılanları denetlemeyi, şikâyet edebilmeyi ve engelleyebilmeyi
          de gerektiriyor. Bunlar olmadan bir yazma alanı açmak, oradaki herkesi korumasız
          bırakmak olurdu.
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 16,
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: alpha.w08,
    backgroundColor: colors.surface,
  },
  why: {
    gap: 8,
    padding: 16,
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: alpha.w08,
    backgroundColor: alpha.w03,
  },
});
