import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Press } from '../components/Buttons';
import { Card, Pill, StatTile } from '../components/Surfaces';
import { ProgressBar, SkillBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { radii } from '../theme/tokens';
import { displayNameOf, initialOf, memberText } from '../content/identity';
import { achievementsOf, facts, summarize } from '../content/achievements';
import { useAuth } from '../state/AuthContext';
import { useGo } from '../navigation/useGo';
import { useApp } from '../state/AppContext';
import { deckProgress, totals, tr } from '../content/progress';

/** 26 · Profil — a game-character profile for a learner. */
export function ProfileScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();
  const { positions, cefr, savedWords, xp, streak } = useApp();
  const { user } = useAuth();

  // Ad sırası: kullanıcının seçtiği ad → e-postanın yerel kısmı → "Öğrenci".
  // Hesapsız kullanıcıya uydurma bir isim vermiyoruz.
  // Başarım sayısı, rozet ekranıyla aynı hesaptan geliyor; iki ekranın farklı
  // sayı göstermemesi için tek kaynak.
  const badges = summarize(achievementsOf(facts(positions, xp, streak)));

  const name = displayNameOf(
    user?.user_metadata?.display_name as string | undefined,
    user?.email,
  );

  // Bu üç sayı artık tasarımdan değil, öğrencinin gerçekten gördüklerinden
  // geliyor. "Düello kazanma oranı" kaldırıldı: düello ekranı hâlâ örnek
  // veriyle çalışıyor, olmayan bir maçın oranını göstermek uydurmaktır.
  const seen = totals(positions);
  const stats = [
    { value: tr(seen.words), label: 'kelime görüldü', tint: t.colors.accent },
    { value: tr(seen.lessons), label: 'gramer dersi', tint: t.colors.warning },
    { value: tr(savedWords.length), label: 'kaydedilen', tint: t.colors.secondary },
  ];

  // Beceri dağılımı da gerçek: bulunduğun seviyede her bölümün ne kadarını
  // bitirdiğin. Eski listede "Yazma" ve "Telaffuz" da vardı — uygulamada
  // böyle iki bölüm yok, olmayan becerinin yüzdesi olmaz.
  const decks = deckProgress(positions, cefr);

  // Sahte "seviye 24 → 25" yerine gerçek bir eşik: bir sonraki bin XP.
  // Uydurma bir seviye sistemi kurmaktansa sayının kendisini göstermek daha
  // dürüst; gerçek seviye sistemi kurulduğunda buraya o gelir.
  const nextMark = (Math.floor(xp / 1000) + 1) * 1000;

  return (
    <Screen tabbed padTop={0} padH={0} gap={0}>
      <Gradient
        deg={160}
        colors={[tint(t.colors.secondary, 0.3), tint(t.colors.primary, 0.16), 'transparent']}
        style={styles.hero}>
        <View style={styles.heroTop}>
          <Press
            onPress={() => go('settings')}
            accessibilityRole="button"
            accessibilityLabel="Ayarlar"
            style={styles.settingsBtn}>
            <Txt s={15}>⚙</Txt>
          </Press>
        </View>

        {/* Başlık tasarımda sabitti: herkes "Ali Yılmaz"dı, "@aliyilmaz · 42
            gündür üye"ydi ve "LV 24 · ALTIN" rozetleri taşıyordu. Seviye
            numarası ve lig diye bir şey hiç olmadı; ikisi de silindi.
            Üyelik süresi ise gerçekten hesaplanabiliyor. */}
        <View style={styles.identity}>
          <Gradient colors={t.gradients.violetCyan} style={styles.avatar}>
            <Txt f="m" s={32} w={800}>
              {initialOf(name)}
            </Txt>
          </Gradient>

          <View style={styles.flex}>
            <Txt f="m" s={23} w={800}>
              {name}
            </Txt>
            <Txt s={12} w={600} c={t.colors.textSubtle} style={styles.handle}>
              {memberText(user?.created_at)}
            </Txt>
            <View style={styles.pills}>
              <Pill label={cefr} tint={t.colors.accent} size={10.5} style={styles.pill} />
              <Pill
                label={streak ? `🔥 ${streak} gün` : 'seri yok'}
                tint={t.colors.warning}
                size={10.5}
                style={styles.pill}
              />
            </View>
          </View>
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpHead}>
            <Txt f="mono" s={11.5} w={700} c={t.colors.textSubtle}>
              TOPLAM XP
            </Txt>
            <Txt f="mono" s={11.5} w={700} c={t.colors.accent}>
              {tr(xp)} / {tr(nextMark)} XP
            </Txt>
          </View>
          <ProgressBar
            pct={Math.round(((xp % 1000) / 1000) * 100)}
            from={t.colors.secondary}
            to={t.colors.accent}
            height={9}
            track={t.alpha.w10}
            glow={t.shadows.glowCyanSoft}
          />
          <Txt s={11} c={t.colors.textDim}>
            Bir sonraki bine {tr(nextMark - xp)} XP kaldı.
          </Txt>
        </View>
      </Gradient>

      <View style={styles.body}>
        <View style={styles.stats}>
          {stats.map((s) => (
            <StatTile
              key={s.label}
              value={s.value}
              label={s.label}
              tint={s.tint}
              size={19}
              style={styles.statTile}
            />
          ))}
        </View>

        <Card gap={11}>
          <Txt f="m" s={14} w={700}>
            {cefr} seviyesinde ilerleme
          </Txt>
          {decks.map((deck) => (
            <SkillBar
              key={deck.kind}
              name={deck.label}
              value={`${tr(deck.done)}/${tr(deck.total)}`}
              pct={deck.pct}
              from={deck.pct < 55 ? t.colors.warning : t.colors.secondary}
              to={deck.pct < 55 ? t.colors.orange : t.colors.accent}
            />
          ))}
        </Card>

        {/* "Düello istatistikleri · 38 maç · %68 galibiyet" buradaydı.
            Düello yazılmadı; oynanmamış maçların galibiyet oranını
            göstermek, öğrenciye hiç yapmadığı bir şeyin karnesini
            vermekti. */}

        <Press onPress={() => go('achv')} scale={0.99} style={styles.navRow}>
          <View style={styles.badgeStack}>
            <View style={[styles.badge, styles.badgeWarm]}>
              <Txt s={16}>🔥</Txt>
            </View>
            <View style={[styles.badge, styles.badgeViolet, styles.badgeOverlap]}>
              <Txt s={16}>🏅</Txt>
            </View>
            <View style={[styles.badge, styles.badgeCyan, styles.badgeOverlap]}>
              {/* Kılıç rozeti düelloyu simgeliyordu; düello yok. */}
              <Txt s={16}>📓</Txt>
            </View>
          </View>
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              Başarımlar
            </Txt>
            <Txt s={11.5} c={t.colors.textDim}>
              {/* "14 / 48" sabit yazılıydı; başarım hesabı gerçek olduğu
                  hâlde bu satır uydurma bir sayı gösteriyordu. */}
              {badges.unlocked} / {badges.total} açıldı
            </Txt>
          </View>
          <Txt f="m" s={20} w={800}>
            ›
          </Txt>
        </Press>

        {/* Sosyal sekmesi kaldırıldığında liderliğin erişimi buraya taşındı;
            ana sayfadaki şerit de duruyor. */}
        <Press onPress={() => go('board')} scale={0.99} style={styles.navRow}>
          <View style={[styles.badge, styles.badgeWarm]}>
            <Txt s={16}>🏆</Txt>
          </View>
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              Haftalık liderlik
            </Txt>
            <Txt s={11.5} c={t.colors.textDim}>
              Katılanların bu hafta kazandığı XP
            </Txt>
          </View>
          <Txt f="m" s={20} w={800}>
            ›
          </Txt>
        </Press>

        <Press onPress={() => go('stats')} scale={0.99} style={styles.navRow}>
          <View style={[styles.badge, styles.badgeBlue]}>
            <Txt s={16}>📈</Txt>
          </View>
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              Gelişim analizi
            </Txt>
            <Txt s={11.5} c={t.colors.textDim}>
              Haftalık rapor hazır
            </Txt>
          </View>
          <Txt f="m" s={20} w={800}>
            ›
          </Txt>
        </Press>
      </View>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    hero: { paddingTop: 58, paddingHorizontal: 18, paddingBottom: 22, gap: 14 },
    heroTop: { flexDirection: 'row', justifyContent: 'flex-end' },
    settingsBtn: {
      width: 38,
      height: 38,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: t.alpha.w14,
      backgroundColor: t.alpha.w07,
      alignItems: 'center',
      justifyContent: 'center',
    },
    identity: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: t.shadows.avatar,
    },
    handle: { marginTop: 2 },
    pills: { flexDirection: 'row', gap: 7, marginTop: 9 },
    pill: { paddingVertical: 5, paddingHorizontal: 9 },
    xpCard: {
      backgroundColor: t.alpha.black28,
      borderWidth: 1,
      borderColor: t.alpha.w10,
      borderRadius: radii.panel,
      padding: 13,
      gap: 8,
    },
    xpHead: { flexDirection: 'row', justifyContent: 'space-between' },
    body: { paddingTop: 4, paddingHorizontal: 18, gap: 13 },
    stats: { flexDirection: 'row', gap: 9 },
    statTile: { borderRadius: radii.panel, padding: 13 },
    duelStats: {
      borderWidth: 1,
      borderColor: tint(t.colors.error, 0.26),
      borderRadius: radii.section,
      padding: 16,
      gap: 10,
    },
    duelHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    duelBar: { flexDirection: 'row', height: 12, borderRadius: 9, overflow: 'hidden' },
    duelLegend: { flexDirection: 'row', gap: 14 },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.alpha.w08,
      borderRadius: radii.tile,
      padding: 15,
    },
    badgeStack: { flexDirection: 'row' },
    badge: {
      width: 36,
      height: 36,
      borderRadius: radii.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeOverlap: { marginLeft: -8 },
    badgeWarm: {
      backgroundColor: tint(t.colors.warning, 0.2),
      borderColor: tint(t.colors.warning, 0.4),
    },
    badgeViolet: {
      backgroundColor: tint(t.colors.secondary, 0.2),
      borderColor: tint(t.colors.secondary, 0.4),
    },
    badgeCyan: {
      backgroundColor: tint(t.colors.accent, 0.2),
      borderColor: tint(t.colors.accent, 0.4),
    },
    badgeBlue: {
      backgroundColor: tint(t.colors.primary, 0.2),
      borderColor: tint(t.colors.primary, 0.4),
    },
  });
