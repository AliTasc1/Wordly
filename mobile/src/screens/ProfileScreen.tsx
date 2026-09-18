import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Press } from '../components/Buttons';
import { Card, Pill, StatTile } from '../components/Surfaces';
import { ProgressBar, SkillBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii, shadows } from '../theme/tokens';
import { DUEL_STATS, USER } from '../data/profile';
import { useGo } from '../navigation/useGo';
import { useApp } from '../state/AppContext';
import { deckProgress, totals, tr } from '../content/progress';

/** 26 · Profil — a game-character profile for a learner. */
export function ProfileScreen() {
  const { go } = useGo();
  const { positions, cefr, savedWords, xp, streak } = useApp();

  // Bu üç sayı artık tasarımdan değil, öğrencinin gerçekten gördüklerinden
  // geliyor. "Düello kazanma oranı" kaldırıldı: düello ekranı hâlâ örnek
  // veriyle çalışıyor, olmayan bir maçın oranını göstermek uydurmaktır.
  const seen = totals(positions);
  const stats = [
    { value: tr(seen.words), label: 'kelime görüldü', tint: colors.accent },
    { value: tr(seen.lessons), label: 'gramer dersi', tint: colors.warning },
    { value: tr(savedWords.length), label: 'kaydedilen', tint: colors.secondary },
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
        colors={['rgba(124,92,255,.3)', 'rgba(46,107,255,.16)', 'transparent']}
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

        <View style={styles.identity}>
          <View>
            <Gradient colors={gradients.violetCyan} style={styles.avatar}>
              <Txt f="m" s={32} w={800}>
                {USER.initials}
              </Txt>
            </Gradient>
            <View style={styles.levelBadge}>
              <Txt f="mono" s={10} w={800} c={colors.accent}>
                {USER.levelNo}
              </Txt>
            </View>
          </View>

          <View style={styles.flex}>
            <Txt f="m" s={23} w={800}>
              {USER.fullName}
            </Txt>
            <Txt s={12} w={600} c={colors.textSubtle} style={styles.handle}>
              {USER.handle}
            </Txt>
            <View style={styles.pills}>
              <Pill label={USER.level} tint={colors.accent} size={10.5} style={styles.pill} />
              <Pill
                label={streak ? `🔥 ${streak} gün` : 'seri yok'}
                tint={colors.warning}
                size={10.5}
                style={styles.pill}
              />
            </View>
          </View>
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpHead}>
            <Txt f="mono" s={11.5} w={700} c={colors.textSubtle}>
              TOPLAM XP
            </Txt>
            <Txt f="mono" s={11.5} w={700} c={colors.accent}>
              {tr(xp)} / {tr(nextMark)} XP
            </Txt>
          </View>
          <ProgressBar
            pct={Math.round(((xp % 1000) / 1000) * 100)}
            from={colors.secondary}
            to={colors.accent}
            height={9}
            track={alpha.w10}
            glow={shadows.glowCyanSoft}
          />
          <Txt s={11} c={colors.textDim}>
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
              from={deck.pct < 55 ? colors.warning : colors.secondary}
              to={deck.pct < 55 ? colors.orange : colors.accent}
            />
          ))}
        </Card>

        <Gradient
          colors={['rgba(255,77,94,.14)', 'rgba(14,20,38,.92)']}
          style={styles.duelStats}>
          <View style={styles.duelHead}>
            <Txt f="m" s={14} w={700}>
              {DUEL_STATS.title}
            </Txt>
            <Txt f="mono" s={11} w={700} c={colors.errorSoft}>
              {DUEL_STATS.matches}
            </Txt>
          </View>
          <View style={styles.duelBar}>
            <Gradient
              deg={90}
              colors={gradients.success}
              style={{ width: `${DUEL_STATS.win}%` }}
            />
            <View style={{ width: `${DUEL_STATS.draw}%`, backgroundColor: colors.warning }} />
            <View style={{ width: `${DUEL_STATS.loss}%`, backgroundColor: colors.error }} />
          </View>
          <View style={styles.duelLegend}>
            {DUEL_STATS.legend.map((l) => (
              <Txt key={l} s={11} w={600} c={colors.textSubtle}>
                {l}
              </Txt>
            ))}
          </View>
        </Gradient>

        <Press onPress={() => go('achv')} scale={0.99} style={styles.navRow}>
          <View style={styles.badgeStack}>
            <View style={[styles.badge, styles.badgeWarm]}>
              <Txt s={16}>🔥</Txt>
            </View>
            <View style={[styles.badge, styles.badgeViolet, styles.badgeOverlap]}>
              <Txt s={16}>🏅</Txt>
            </View>
            <View style={[styles.badge, styles.badgeCyan, styles.badgeOverlap]}>
              <Txt s={16}>⚔</Txt>
            </View>
          </View>
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              Başarımlar
            </Txt>
            <Txt s={11.5} c={colors.textDim}>
              14 / 48 açıldı
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
            <Txt s={11.5} c={colors.textDim}>
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { paddingTop: 58, paddingHorizontal: 18, paddingBottom: 22, gap: 14 },
  heroTop: { flexDirection: 'row', justifyContent: 'flex-end' },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: alpha.w14,
    backgroundColor: alpha.w07,
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
    boxShadow: shadows.avatar,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.chipSm,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: alpha.w18,
  },
  handle: { marginTop: 2 },
  pills: { flexDirection: 'row', gap: 7, marginTop: 9 },
  pill: { paddingVertical: 5, paddingHorizontal: 9 },
  xpCard: {
    backgroundColor: 'rgba(0,0,0,.28)',
    borderWidth: 1,
    borderColor: alpha.w10,
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
    borderColor: 'rgba(255,77,94,.26)',
    borderRadius: radii.section,
    padding: 16,
    gap: 10,
  },
  duelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  duelBar: { flexDirection: 'row', height: 12, borderRadius: 9, overflow: 'hidden' },
  duelLegend: { flexDirection: 'row', gap: 14 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
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
  badgeWarm: { backgroundColor: 'rgba(245,165,36,.2)', borderColor: 'rgba(245,165,36,.4)' },
  badgeViolet: { backgroundColor: 'rgba(124,92,255,.2)', borderColor: 'rgba(124,92,255,.4)' },
  badgeCyan: { backgroundColor: 'rgba(34,211,238,.2)', borderColor: 'rgba(34,211,238,.4)' },
  badgeBlue: { backgroundColor: 'rgba(46,107,255,.2)', borderColor: 'rgba(46,107,255,.4)' },
});
