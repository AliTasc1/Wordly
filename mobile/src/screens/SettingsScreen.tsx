import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press } from '../components/Buttons';
import { IconTile } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { radii } from '../theme/tokens';
import { LINKS } from '../data/links';
import { APP_VERSION, SETTINGS_FOOTER } from '../data/subscription';
import { attribution } from '../content';
import { useApp } from '../state/AppContext';
import { useAuth } from '../state/AuthContext';
import { useBack, useGo } from '../navigation/useGo';
import { shareExport } from '../state/exportFile';

/**
 * Eşitlemenin altındaki açıklama.
 *
 * Başarısızlıkta sunucunun kendi metnini gizlemiyoruz. "Bir şeyler ters
 * gitti" demek, kullanıcının da bizim de neyin bozuk olduğunu öğrenmemizi
 * engeller. Yanına ilerlemenin kaybolmadığını yazıyoruz, çünkü asıl merak
 * edilen o.
 */
function syncNote(sync: ReturnType<typeof useApp>['sync']): string {
  if (sync.running) return 'Sunucuyla karşılaştırılıyor';
  if (sync.problem)
    return `Son deneme başarısız — ilerlemen telefonda duruyor. ${sync.problem}`;
  if (sync.at == null) return 'Henüz eşitlenmedi';

  const minutes = Math.floor((Date.now() - sync.at) / 60000);
  if (minutes < 1) return 'Az önce eşitlendi';
  if (minutes < 60) return `${minutes} dakika önce eşitlendi`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce eşitlendi`;
  return `${Math.floor(hours / 24)} gün önce eşitlendi`;
}

/** 31 · Ayarlar — account, notifications, audio, accessibility, language. */
export function SettingsScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();
  const back = useBack('profile');
  const { fire, cefr, goals, dailyTime, resetProgress, sync, haptics, setHaptics, saved } =
    useApp();
  const { user, loading, signOut, deleteAccount } = useAuth();

  // Silme geri alınamıyor, o yüzden onay isteniyor. Yıkıcı işlem tek
  // dokunuşla olmamalı.
  const askReset = () =>
    Alert.alert(
      'İlerlemeyi sıfırla',
      'Kaldığın yerler, kaydettiğin kelimeler ve seviye testi sonucun silinecek. Bu geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            fire('İlerleme sıfırlandı', 'Her bölüm baştan başlıyor');
          },
        },
      ],
    );

  // Dosya hazırlanırken düğme beklemeye alınıyor: paylaşım penceresi
  // açılana kadar geçen sürede ikinci kez basmak, ikinci bir pencere
  // açmaya çalışıp ikisini birden düşürüyor.
  const [exporting, setExporting] = useState(false);

  const onExport = () => {
    if (exporting) return;
    setExporting(true);
    void shareExport({
      saved,
      account: user
        ? { id: user.id, email: user.email ?? null, createdAt: user.created_at ?? null }
        : null,
      appVersion: APP_VERSION,
      at: Date.now(),
    })
      .then((result) => {
        if (!result.ok) fire('Dosya hazırlanamadı', result.problem);
      })
      .finally(() => setExporting(false));
  };

  // Hesap silme iki adımda soruluyor. Sıfırlamada tek onay yeterli: yanlışlıkla
  // basan öğrenci ilerlemesini kaybeder ama hesabı durur. Burada dönüş yok —
  // e-posta, eşitleme ve liderlik geçmişi dahil sunucudaki her şey gidiyor ve
  // aynı veriyi geri getirecek bir yol kalmıyor.
  //
  // İki metin de ne SİLİNMEDİĞİNİ söylüyor: telefondaki ilerleme duruyor.
  // Bunu yazmazsak "hesabımı silersem çalıştığım her şey gider mi" korkusu,
  // uygulamayı tamamen silmeye iter.
  const askDelete = () =>
    Alert.alert(
      'Hesabımı sil',
      'Sunucudaki her şey silinecek: e-posta adresin, eşitlenen ilerlemen ve liderlik geçmişin. Bu geri alınamaz.\n\nTelefonundaki ilerlemen silinmez; uygulama hesapsız çalışmaya devam eder.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Devam',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Emin misin?',
              `${user?.email ?? 'Hesabın'} ve sunucudaki tüm verisi kalıcı olarak silinecek.`,
              [
                { text: 'Vazgeç', style: 'cancel' },
                {
                  text: 'Hesabımı sil',
                  style: 'destructive',
                  onPress: () => {
                    void deleteAccount().then((problem) => {
                      if (problem) fire('Hesap silinemedi', problem.text);
                      else
                        fire(
                          'Hesabın silindi',
                          'Telefonundaki ilerlemen olduğu gibi duruyor',
                        );
                    });
                  },
                },
              ],
            ),
        },
      ],
    );

  // Çıkış ilerlemeyi silmiyor — telefondaki kayıt olduğu yerde duruyor. Bunu
  // söylemek gerekiyor, aksi hâlde kullanıcı her şeyini kaybedeceğini sanıp
  // çıkış yapmaktan çekinir.
  const askSignOut = () =>
    Alert.alert(
      'Çıkış yap',
      'İlerlemen bu telefonda kalmaya devam eder. Tekrar giriş yaptığında hesabına bağlanır.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış yap',
          style: 'destructive',
          onPress: () => {
            void signOut().then((problem) => {
              if (problem) fire('Çıkış yapılamadı', problem.text);
              else fire('Çıkış yapıldı', 'İlerlemen telefonda duruyor');
            });
          },
        },
      ],
    );

  return (
    <Screen tabbed padTop={62} gap={13}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <Txt f="m" s={17} w={800}>
          Ayarlar
        </Txt>
      </View>

      {/* Hesap kutusu. Girişli ve girişsiz iki hâli var; ikisi de gerçek
          durumu gösteriyor, çünkü hesap isteğe bağlı ve girişsiz kullanım
          eksik bir hâl değil. */}
      <Press
        onPress={() => (user ? undefined : go('signin'))}
        disabled={Boolean(user) || loading}
        scale={user ? 1 : 0.99}>
        <View style={styles.account}>
          <IconTile
            glyph={user ? '✓' : '→'}
            tint={user ? t.colors.success : t.colors.primary}
            size={42}
            radius={radii.card}
            fontSize={17}
          />
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              {loading
                ? 'Hesap kontrol ediliyor…'
                : user
                  ? 'Hesabın bağlı'
                  : 'Hesabını bağla'}
            </Txt>
            <Txt s={11.5} c={t.colors.textFaint} style={styles.itemSub}>
              {loading
                ? ' '
                : user
                  ? (user.email ?? 'E-posta yok')
                  : 'İlerlemeni diğer cihazlarına taşı'}
            </Txt>
          </View>
          {!user && !loading ? (
            <Txt f="m" s={20} w={800}>
              ›
            </Txt>
          ) : null}
        </View>
      </Press>

      {/* Eşitleme satırı yalnızca hesap varken görünüyor. Girişsizken
          "eşitlenmedi" demek, olmayan bir eksikliği varmış gibi göstermek
          olurdu: ilerleme zaten telefonda ve orada güvende. */}
      {user ? (
        <Press onPress={sync.now} disabled={sync.running} scale={0.99}>
          <View style={styles.account}>
            <IconTile
              glyph={sync.problem ? '!' : '⟳'}
              tint={sync.problem ? t.colors.warning : t.colors.accent}
              size={42}
              radius={radii.card}
              fontSize={17}
            />
            <View style={styles.flex}>
              <Txt f="m" s={13.5} w={700}>
                {sync.running ? 'Eşitleniyor…' : 'İlerlemeyi eşitle'}
              </Txt>
              <Txt
                s={11.5}
                c={sync.problem ? t.colors.warningText : t.colors.textFaint}
                style={styles.itemSub}>
                {syncNote(sync)}
              </Txt>
            </View>
          </View>
        </Press>
      ) : null}

      {/* Liderlik katılımı. Hesapsızken gösterilmiyor: katılacak bir şey
          yok ve olmayan bir eksiklik gibi durur. */}
      {user ? (
        <Press onPress={() => go('boardjoin')} scale={0.99}>
          <View style={styles.account}>
            <IconTile
              glyph="🏆"
              tint={t.colors.warning}
              size={42}
              radius={radii.card}
              fontSize={17}
            />
            <View style={styles.flex}>
              <Txt f="m" s={13.5} w={700}>
                Liderlik tablosu
              </Txt>
              <Txt s={11.5} c={t.colors.textFaint} style={styles.itemSub}>
                Katılım ve görünen ad
              </Txt>
            </View>
            <Txt f="m" s={20} w={800}>
              ›
            </Txt>
          </View>
        </Press>
      ) : null}

      <Press onPress={() => go('sub')} scale={0.99}>
        <Gradient
          colors={['rgba(124,92,255,.22)', 'rgba(14,20,38,.92)']}
          style={styles.premium}>
          <Gradient colors={t.gradients.violetCyan} style={styles.premiumIcon}>
            <Txt s={18}>✦</Txt>
          </Gradient>
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              {SETTINGS_FOOTER.premium.title}
            </Txt>
            <Txt s={11.5} c={t.colors.violetSoft}>
              {SETTINGS_FOOTER.premium.sub}
            </Txt>
          </View>
          <Txt f="m" s={20} w={800}>
            ›
          </Txt>
        </Gradient>
      </Press>

      {/* Ayar satırları. Hepsi ya bir yere götürüyor ya bir şeyi
          değiştiriyor: eskiden on üç satır vardı ve hiçbiri bir şey
          yapmıyordu, dokununca "demo" diyordu. */}
      <View style={styles.group}>
        <Txt
          f="mono"
          s={10}
          w={700}
          c={t.colors.textDisabled}
          ls={0.14}
          style={styles.groupName}>
          ÖĞRENME
        </Txt>
        <View style={styles.groupBody}>
          <Press
            onPress={() => go('test')}
            scale={0.995}
            style={[styles.item, styles.itemDivider]}>
            <IconTile
              glyph="📊"
              tint={t.colors.accent}
              size={36}
              radius={12}
              fontSize={15}
            />
            <View style={styles.flex}>
              <Txt f="m" s={13} w={700}>
                Seviye
              </Txt>
              <Txt s={10.5} c={t.colors.textFaint} style={styles.itemSub}>
                Yeniden test et
              </Txt>
            </View>
            <Txt f="mono" s={11} w={700} c={t.colors.textDim}>
              {cefr}
            </Txt>
          </Press>

          <Press onPress={() => go('goal')} scale={0.995} style={styles.item}>
            <IconTile
              glyph="🎯"
              tint={t.colors.secondary}
              size={36}
              radius={12}
              fontSize={15}
            />
            <View style={styles.flex}>
              <Txt f="m" s={13} w={700}>
                Hedefler
              </Txt>
              <Txt s={10.5} c={t.colors.textFaint} style={styles.itemSub}>
                {goals.join(', ')} · {dailyTime}/gün
              </Txt>
            </View>
            <Txt f="mono" s={11} w={700} c={t.colors.textDim}>
              Değiştir
            </Txt>
          </Press>
        </View>
      </View>

      <View style={styles.group}>
        <Txt
          f="mono"
          s={10}
          w={700}
          c={t.colors.textDisabled}
          ls={0.14}
          style={styles.groupName}>
          UYGULAMA
        </Txt>
        <View style={styles.groupBody}>
          <Press
            onPress={() => setHaptics(!haptics)}
            scale={0.995}
            accessibilityRole="switch"
            accessibilityState={{ checked: haptics }}
            style={[styles.item, styles.itemDivider]}>
            <IconTile
              glyph="📳"
              tint={t.colors.secondary}
              size={36}
              radius={12}
              fontSize={15}
            />
            <View style={styles.flex}>
              <Txt f="m" s={13} w={700}>
                Titreşim
              </Txt>
              <Txt s={10.5} c={t.colors.textFaint} style={styles.itemSub}>
                Harf seçimi ve cevap dönüşü
              </Txt>
            </View>
            <Txt f="mono" s={11} w={700} c={haptics ? t.colors.success : t.colors.textGhost}>
              {haptics ? 'Açık' : 'Kapalı'}
            </Txt>
          </Press>

          {/* Bilgi satırları: tek seçenekli bir anahtar, anahtar değildir. */}
          <View style={[styles.item, styles.itemDivider]}>
            <IconTile
              glyph="🌍"
              tint={t.colors.primary}
              size={36}
              radius={12}
              fontSize={15}
            />
            <View style={styles.flex}>
              <Txt f="m" s={13} w={700}>
                Arayüz dili
              </Txt>
              <Txt s={10.5} c={t.colors.textFaint} style={styles.itemSub}>
                Şu an yalnızca Türkçe
              </Txt>
            </View>
            <Txt f="mono" s={11} w={700} c={t.colors.textDim}>
              TR
            </Txt>
          </View>

          <View style={styles.item}>
            <IconTile
              glyph="🎧"
              tint={t.colors.accent}
              size={36}
              radius={12}
              fontSize={15}
            />
            <View style={styles.flex}>
              <Txt f="m" s={13} w={700}>
                Aksan
              </Txt>
              <Txt s={10.5} c={t.colors.textFaint} style={styles.itemSub}>
                İçeriğin tamamı Amerikan yazımında
              </Txt>
            </View>
            <Txt f="mono" s={11} w={700} c={t.colors.textDim}>
              US
            </Txt>
          </View>
        </View>
      </View>

      {/*
        LICENSES.md, kelime listesinin ve telaffuz verisinin üçüncü taraf
        olması nedeniyle bu künyenin yayından önce uygulamada görünür olmasını
        şart koşuyor. Metinler manifest'ten geliyor, elle kopyalanmıyor.
      */}
      <View style={styles.group}>
        <Txt
          f="mono"
          s={10}
          w={700}
          c={t.colors.textDisabled}
          ls={0.14}
          style={styles.groupName}>
          KAYNAKLAR
        </Txt>
        <View style={styles.groupBody}>
          {attribution().map((line, i, all) => (
            <View
              key={line}
              style={[styles.credit, i < all.length - 1 && styles.itemDivider]}>
              <Txt s={11.5} lh={1.55} c={t.colors.textFaint}>
                {line}
              </Txt>
            </View>
          ))}
        </View>
      </View>

      {/* Yasal metinler tarayıcıda açılıyor. Uygulama içinde göstermek için
          ikinci bir kopya tutmak gerekirdi; metin güncellendiğinde uygulamayı
          da yayınlamak zorunda kalırdık ve mağaza incelemesi boyunca eski
          metin yürürlükte kalırdı. */}
      <View style={styles.group}>
        <Txt f="mono" s={10} w={700} c={t.colors.textDisabled} ls={0.14} style={styles.groupName}>
          YASAL
        </Txt>
        <View style={styles.groupBody}>
          {(
            [
              { label: 'Gizlilik Politikası', sub: 'Hangi veriyi neden tutuyoruz', url: LINKS.privacy, glyph: '🔒' },
              { label: 'Kullanım Şartları', sub: 'Ücret, hesap ve haklar', url: LINKS.terms, glyph: '📄' },
              { label: 'Destek', sub: 'Sorun bildir, yardım al', url: LINKS.support, glyph: '💬' },
            ] as const
          ).map((row, i, all) => (
            <Press
              key={row.url}
              onPress={() => {
                void Linking.openURL(row.url).catch(() =>
                  fire('Bağlantı açılamadı', row.url),
                );
              }}
              scale={0.995}
              accessibilityRole="link"
              style={[styles.item, i < all.length - 1 && styles.itemDivider]}>
              <IconTile
                glyph={row.glyph}
                tint={t.colors.textDim}
                size={36}
                radius={12}
                fontSize={15}
              />
              <View style={styles.flex}>
                <Txt f="m" s={13} w={700}>
                  {row.label}
                </Txt>
                <Txt s={10.5} c={t.colors.textFaint} style={styles.itemSub}>
                  {row.sub}
                </Txt>
              </View>
              <Txt f="m" s={16} w={800} c={t.colors.textGhost}>
                ↗
              </Txt>
            </Press>
          ))}
        </View>
      </View>

      {/* Verilerimi indir. Hesapsızken de çalışıyor: taşınabilirlik hakkı
          hesabı olana değil, verisi olana ait ve hesapsız kullanıcının
          telefonunda da aylarca birikmiş bir ilerleme var. */}
      <Press onPress={onExport} disabled={exporting} scale={0.99}>
        <View style={styles.account}>
          <IconTile
            glyph="↓"
            tint={t.colors.accent}
            size={42}
            radius={radii.card}
            fontSize={17}
          />
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              {exporting ? 'Dosya hazırlanıyor…' : 'Verilerimi indir'}
            </Txt>
            <Txt s={11.5} c={t.colors.textFaint} style={styles.itemSub}>
              Tüm ilerlemen tek bir dosyada — kaydet ya da kendine gönder
            </Txt>
          </View>
        </View>
      </Press>

      <Press onPress={askReset} style={styles.danger}>
        <Txt f="m" s={13.5} w={700} c={t.colors.textDim}>
          İlerlemeyi sıfırla
        </Txt>
      </Press>

      {/* Girişsizken "Çıkış yap" göstermek anlamsızdı; eski düğme yalnızca
          açılış ekranına dönüyordu, yani hiçbir oturumu kapatmıyordu. */}
      {user ? (
        <Press onPress={askSignOut} style={styles.signOut}>
          <Txt f="m" s={14} w={700} c={t.colors.errorSoft}>
            {SETTINGS_FOOTER.signOut}
          </Txt>
        </Press>
      ) : null}

      {/* Hesap silme en altta ve en sönük duruyor. Mağaza kuralı bunu
          "kolay bulunur" olmaya zorluyor, ama kolay bulunur ile göze
          batan aynı şey değil: gün içinde defalarca açılan bir ekranda
          en yıkıcı düğme, en kolay basılan düğme olmamalı. */}
      {user ? (
        <Press onPress={askDelete} style={styles.deleteAccount}>
          <Txt f="m" s={13} w={700} c={t.colors.textDim}>
            Hesabımı sil
          </Txt>
        </Press>
      ) : null}

      <Txt f="mono" s={10.5} w={600} c={t.colors.textDisabled} style={styles.version}>
        {SETTINGS_FOOTER.version}
      </Txt>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    premium: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: 'rgba(124,92,255,.32)',
      borderRadius: radii.tile,
      padding: 15,
    },
    account: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: t.alpha.w08,
      borderRadius: radii.tile,
      backgroundColor: t.colors.surface,
      padding: 15,
    },
    premiumIcon: {
      width: 42,
      height: 42,
      borderRadius: radii.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    danger: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: radii.input,
      borderWidth: 1,
      borderColor: t.alpha.w08,
      backgroundColor: t.alpha.w04,
    },
    group: { gap: 7 },
    groupName: { paddingHorizontal: 4 },
    groupBody: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.alpha.w07,
      borderRadius: radii.panel,
      overflow: 'hidden',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 13,
      paddingHorizontal: 14,
    },
    itemDivider: { borderBottomWidth: 1, borderBottomColor: t.alpha.w06 },
    itemSub: { marginTop: 1 },
    signOut: {
      height: 50,
      borderRadius: radii.input,
      borderWidth: 1,
      borderColor: 'rgba(255,77,94,.3)',
      backgroundColor: 'rgba(255,77,94,.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    credit: { paddingVertical: 11, paddingHorizontal: 13 },
    deleteAccount: { alignItems: 'center', paddingVertical: 12 },
    version: { textAlign: 'center' },
  });
