import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Avatar } from '../components/Avatar';
import { BackButton, PrimaryButton, Press } from '../components/Buttons';
import { Notice } from '../components/Notice';
import { ScreenHeading, StatTile } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { avatarOf, gapToNext, initialsOf, weekEndsText } from '../content/board';
import { tr } from '../content/progress';
import { fetchBoard, type Board } from '../server/leaderboard';
import { useAuth } from '../state/AuthContext';
import { useBack, useGo } from '../navigation/useGo';

/**
 * 19 · Liderlik — bu haftanın gerçek sıralaması.
 *
 * Tasarımdan gelen çok şey silindi, hepsi aynı sebeple: ölçmediğimiz ya da
 * var olmayan bir şeyi göstermiyoruz.
 *
 * - **Ligler** (Bronz…Elit): lig sistemi yok. Altı sekmeli bir şerit çizip
 *   birini "aktif" göstermek, olmayan bir yapıyı varmış gibi sunmaktı.
 * - **Yükselme sayacı** ("İlk 5 Elmas'a çıkar · 3 gün 4 saat"): yükselme
 *   diye bir şey yok. Yerine haftanın gerçekten ne zaman sıfırlandığı yazıyor.
 * - **▲▼ hareket okları**: geçen haftanın sırası tutulmuyor, dolayısıyla
 *   yön bilinmiyor.
 * - **"%68 düello kazanma"**: düello ölçülmüyor.
 *
 * Kalan üç sayı gerçek: haftalık XP, sıra ve bir üsttekine fark.
 */
export function LeaderboardScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const back = useBack('play');
  const { go } = useGo();
  const { user } = useAuth();

  const [board, setBoard] = useState<Board | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    const result = await fetchBoard(user.id);
    setBusy(false);
    if (result.ok) {
      setBoard(result.board);
      setProblem(null);
    } else {
      setProblem(result.problem.raw ?? result.problem.text);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  // Hesapsız tabloyu göstermiyoruz. Giriş yapmadan başkalarının adlarını
  // toplayabilen bir uç nokta, lider tablosu değil veri kaynağıdır — sunucu
  // da buna izin vermiyor.
  if (!user) {
    return (
      <Screen padTop={62} gap={14}>
        <View style={styles.header}>
          <BackButton onPress={back} />
          <ScreenHeading kicker="HAFTALIK" title="Liderlik" />
        </View>

        <Notice
          tone="info"
          text="Liderlik tablosu için hesap gerekiyor."
          detail="Tabloya girmek ayrıca senin seçimin; hesap açmak tek başına seni listelemez."
        />

        <PrimaryButton label="Giriş yap" onPress={() => go('signin')} />
      </Screen>
    );
  }

  const mine = board?.mine ?? null;
  const entries = board?.entries ?? [];
  const gap = board ? gapToNext(entries, mine) : null;

  return (
    <Screen padTop={62} gap={14} scroll={false} style={styles.fill}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <ScreenHeading kicker="HAFTALIK" title="Liderlik" />
      </View>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={busy} onRefresh={load} tintColor={t.colors.textDim} />
        }>
        <Gradient
          colors={[tint(t.colors.primary, 0.18), tint(t.colors.surface, 0.92)]}
          style={styles.week}>
          <Txt s={font.title}>🗓</Txt>
          <Txt s={font.footnote} lh={1.5} c={t.colors.textSubtle} style={styles.flex}>
            {weekEndsText()}
          </Txt>
        </Gradient>

        {problem ? (
          <Notice tone="error" text="Tablo yüklenemedi." detail={problem} />
        ) : null}

        {/* Katılmayan kullanıcı tabloyu görebiliyor ama içinde değil.
            Bunu gizlemek yerine söylüyoruz: neden listede olmadığını
            anlamayan biri, hatayı uygulamada sanır. */}
        {board && !mine ? (
          <Notice
            tone="info"
            text="Bu hafta tabloda değilsin."
            detail="Ayarlar → Liderlik'ten katılabilirsin. Katılım kapalıyken adın kimseye görünmüyor."
          />
        ) : null}

        {mine ? (
          <View style={styles.stats}>
            <StatTile value={tr(mine.xp)} label="haftalık XP" tint={t.colors.accent} />
            <StatTile
              value={`${mine.place}.`}
              label={`${mine.total} kişi içinde`}
              tint={t.colors.warning}
            />
            <StatTile
              value={gap == null ? '—' : tr(gap)}
              label={gap == null ? 'zirvedesin' : 'üsttekine fark'}
              tint={t.colors.secondary}
            />
          </View>
        ) : null}

        {entries.length ? (
          <View style={styles.board}>
            {entries.map((row) => {
              const tint = avatarOf(row.name);
              return (
                <View key={row.userId} style={[styles.row, row.me && styles.rowMe]}>
                  <Txt f="mono" s={font.footnote} w={700} c={t.colors.textDim} style={styles.rank}>
                    {row.place}
                  </Txt>
                  <Avatar
                    initials={initialsOf(row.name)}
                    from={t.colors[tint[0]]}
                    to={t.colors[tint[1]]}
                    size={34}
                  />
                  <Txt f="m" s={font.body} w={700} style={styles.flex}>
                    {row.name}
                    {row.me ? ' · sen' : ''}
                  </Txt>
                  <Txt f="mono" s={font.footnote} w={700} c={t.colors.accent}>
                    {tr(row.xp)}
                  </Txt>
                </View>
              );
            })}
          </View>
        ) : board && !problem ? (
          <View style={styles.empty}>
            <Txt s={font.giant}>🏁</Txt>
            <Txt f="m" s={font.body} w={700}>
              Tablo bu hafta henüz boş
            </Txt>
            <Txt s={font.footnote} lh={1.55} c={t.colors.textDim} style={styles.emptyText}>
              Katılan kimse bu hafta XP kazanmamış. İlk sen olabilirsin.
            </Txt>
            <Press onPress={() => go('learn')} style={styles.emptyAction}>
              <Txt f="m" s={font.footnote} w={700} c={t.colors.link}>
                Derse git
              </Txt>
            </Press>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: { flex: 1 },
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    list: { gap: 14, paddingBottom: 30 },
    week: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: tint(t.colors.primary, 0.3),
      borderRadius: radii.tile,
      padding: 14,
    },
    board: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.alpha.w08,
      borderRadius: radii.section,
      padding: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 10,
      borderRadius: radii.card,
    },
    rowMe: {
      backgroundColor: tint(t.colors.primary, 0.14),
      borderWidth: 1,
      borderColor: tint(t.colors.primary, 0.34),
    },
    rank: { width: 24 },
    stats: { flexDirection: 'row', gap: 10 },
    empty: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 30,
      paddingHorizontal: 20,
      borderRadius: radii.section,
      borderWidth: 1,
      borderColor: t.alpha.w08,
      backgroundColor: t.alpha.w03,
    },
    emptyText: { textAlign: 'center' },
    emptyAction: { paddingVertical: 8 },
  });
