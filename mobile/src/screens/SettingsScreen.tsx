import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press } from '../components/Buttons';
import { IconTile } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { SETTING_GROUPS, SETTINGS_FOOTER } from '../data/subscription';
import { attribution } from '../content';
import { useApp } from '../state/AppContext';
import { useAuth } from '../state/AuthContext';
import { useBack, useGo } from '../navigation/useGo';

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
  const { go } = useGo();
  const back = useBack('profile');
  const { fire, cefr, resetProgress, sync } = useApp();
  const { user, loading, signOut } = useAuth();

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
            tint={user ? colors.success : colors.primary}
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
            <Txt s={11.5} c={colors.textFaint} style={styles.itemSub}>
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
              tint={sync.problem ? colors.warning : colors.accent}
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
                c={sync.problem ? colors.warningText : colors.textFaint}
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
              tint={colors.warning}
              size={42}
              radius={radii.card}
              fontSize={17}
            />
            <View style={styles.flex}>
              <Txt f="m" s={13.5} w={700}>
                Liderlik tablosu
              </Txt>
              <Txt s={11.5} c={colors.textFaint} style={styles.itemSub}>
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
          <Gradient colors={gradients.violetCyan} style={styles.premiumIcon}>
            <Txt s={18}>✦</Txt>
          </Gradient>
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              {SETTINGS_FOOTER.premium.title}
            </Txt>
            <Txt s={11.5} c={colors.violetSoft}>
              {SETTINGS_FOOTER.premium.sub}
            </Txt>
          </View>
          <Txt f="m" s={20} w={800}>
            ›
          </Txt>
        </Gradient>
      </Press>

      {SETTING_GROUPS.map((group) => (
        <View key={group.name} style={styles.group}>
          <Txt
            f="mono"
            s={10}
            w={700}
            c={colors.textDisabled}
            ls={0.14}
            style={styles.groupName}>
            {group.name}
          </Txt>
          <View style={styles.groupBody}>
            {group.items.map((item, i) => (
              <Press
                key={item.name}
                onPress={() => fire(item.name, SETTINGS_FOOTER.settingToast)}
                scale={0.995}
                style={[styles.item, i < group.items.length - 1 && styles.itemDivider]}>
                <IconTile
                  glyph={item.glyph}
                  tint={item.tint}
                  size={36}
                  radius={12}
                  fontSize={15}
                />
                <View style={styles.flex}>
                  <Txt f="m" s={13} w={700}>
                    {item.name}
                  </Txt>
                  <Txt s={10.5} c={colors.textFaint} style={styles.itemSub}>
                    {item.sub}
                  </Txt>
                </View>
                <Txt
                  f="mono"
                  s={11}
                  w={700}
                  c={item.value === 'Kapalı' ? colors.textGhost : colors.textDim}>
                  {item.name === 'Seviye' ? cefr : item.value}
                </Txt>
              </Press>
            ))}
          </View>
        </View>
      ))}

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
          c={colors.textDisabled}
          ls={0.14}
          style={styles.groupName}>
          KAYNAKLAR
        </Txt>
        <View style={styles.groupBody}>
          {attribution().map((line, i, all) => (
            <View
              key={line}
              style={[styles.credit, i < all.length - 1 && styles.itemDivider]}>
              <Txt s={11.5} lh={1.55} c={colors.textFaint}>
                {line}
              </Txt>
            </View>
          ))}
        </View>
      </View>

      <Press onPress={askReset} style={styles.danger}>
        <Txt f="m" s={13.5} w={700} c={colors.textDim}>
          İlerlemeyi sıfırla
        </Txt>
      </Press>

      {/* Girişsizken "Çıkış yap" göstermek anlamsızdı; eski düğme yalnızca
          açılış ekranına dönüyordu, yani hiçbir oturumu kapatmıyordu. */}
      {user ? (
        <Press onPress={askSignOut} style={styles.signOut}>
          <Txt f="m" s={14} w={700} c={colors.errorSoft}>
            {SETTINGS_FOOTER.signOut}
          </Txt>
        </Press>
      ) : null}

      <Txt f="mono" s={10.5} w={600} c={colors.textDisabled} style={styles.version}>
        {SETTINGS_FOOTER.version}
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    borderColor: alpha.w08,
    borderRadius: radii.tile,
    backgroundColor: colors.surface,
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
    borderColor: alpha.w08,
    backgroundColor: alpha.w04,
  },
  group: { gap: 7 },
  groupName: { paddingHorizontal: 4 },
  groupBody: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w07,
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
  itemDivider: { borderBottomWidth: 1, borderBottomColor: alpha.w06 },
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
  version: { textAlign: 'center' },
});
