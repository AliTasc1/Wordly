import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen } from '../components/Screen';
import { BackButton, Press } from '../components/Buttons';
import { IconTile, ScreenHeading } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { alertsOf } from '../content/alerts';
import { fetchBoard } from '../server/leaderboard';
import { today } from '../state/days';
import { useApp } from '../state/AppContext';
import { useAuth } from '../state/AuthContext';
import { useBack, useGo } from '../navigation/useGo';

/**
 * 25 · Bildirimler — hepsi öğrencinin kendi durumundan türetiliyor.
 *
 * Liste tasarımdan gelen altı sabit satırdı ve üçü var olmayan özelliklere
 * aitti: düello daveti, kulüp turnuvası, "AI Koç yeni plan hazırladı".
 * Uygulamayı ilk açan kişi iki okunmamış bildirimle karşılaşıyordu ve
 * hiçbirine dokunamıyordu.
 *
 * "Tümünü okundu işaretle" düğmesi de kaldırıldı: okunmuşluk diye bir şey
 * tutulmuyordu, düğme yalnızca bir bildirim kutusu açıyordu.
 */
export function NotificationsScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const back = useBack('home');
  const { go } = useGo();
  const { streak, daily, mistakes, sync } = useApp();
  const { user } = useAuth();

  // Liderlik sırası tek gerçek uzak veri. Hesap yoksa hiç sorulmuyor.
  const [place, setPlace] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    if (!user) {
      setPlace(null);
      return;
    }
    void fetchBoard(user.id, 1).then((result) => {
      if (alive && result.ok) setPlace(result.board.mine?.place ?? null);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  const list = alertsOf({
    streak,
    todayXp: daily[today()] ?? 0,
    mistakes: Object.keys(mistakes).length,
    place,
    syncProblem: sync.problem,
    signedIn: Boolean(user),
  });

  return (
    <Screen padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <ScreenHeading kicker="BİLDİRİMLER" title="Neler oluyor" />
      </View>

      {list.length ? (
        list.map((item) => (
          <Press key={item.id} onPress={() => go(item.target)} scale={0.99}>
            <View style={styles.row}>
              <IconTile
                glyph={item.glyph}
                tint={t.colors[item.tint]}
                size={42}
                radius={radii.card}
                fontSize={17}
              />
              <View style={styles.flex}>
                <View style={styles.rowHead}>
                  <Txt f="mono" s={font.label} w={700} c={t.colors[item.tint]} ls={0.12}>
                    {item.kind}
                  </Txt>
                </View>
                <Txt f="m" s={font.body} w={700} style={styles.title}>
                  {item.title}
                </Txt>
                <Txt s={font.caption} lh={1.5} c={t.colors.textDim}>
                  {item.text}
                </Txt>
              </View>
              <Txt f="m" s={font.headline} w={800} c={t.colors.textGhost}>
                ›
              </Txt>
            </View>
          </Press>
        ))
      ) : (
        <View style={styles.empty}>
          <Txt s={font.giant}>🔕</Txt>
          <Txt f="m" s={font.body} w={700}>
            Bekleyen bir şey yok
          </Txt>
          <Txt s={font.footnote} lh={1.55} c={t.colors.textDim} style={styles.emptyText}>
            Serin güvende, hata defterin boş. Burası yalnızca gerçekten ilgilenmen gereken
            bir şey olduğunda dolar.
          </Txt>
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: radii.tile,
      borderWidth: 1,
      borderColor: t.alpha.w08,
      backgroundColor: t.colors.surface,
    },
    rowHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    title: { marginTop: 2, marginBottom: 2 },
    empty: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 40,
      paddingHorizontal: 20,
      borderRadius: radii.section,
      borderWidth: 1,
      borderColor: t.alpha.w08,
      backgroundColor: t.alpha.w03,
    },
    emptyText: { textAlign: 'center' },
  });
