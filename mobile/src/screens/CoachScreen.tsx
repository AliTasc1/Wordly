import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press } from '../components/Buttons';
import { Panel, Tag } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { radii } from '../theme/tokens';
import { kindLabel, mistakesByKind, rankedMistakes } from '../content/stats';
import { tr } from '../content/progress';
import { useApp } from '../state/AppContext';
import type { DeckKind } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';
import type { ScreenId } from '../navigation/routes';

/**
 * 15 · Hata defteri.
 *
 * Bu ekran tasarımda "AI Koç"tu: bir sohbet kutusu, hazır sorular ve
 * "dün Past Perfect'te zorlandın" diyen sabit bir metin. O cümle hiçbir zaman
 * doğru değildi — uygulama neyi yanlış yaptığını bilmiyordu.
 *
 * Artık biliyor. Sohbet kutusu, arkasında gerçek bir dil modeli olana kadar
 * burada durmuyor; onun yerine öğrencinin gerçekten yanıldığı sorular ve
 * hangi bölüme dönmesi gerektiği var. Bu, koçun yapabileceğinin sahtesi değil,
 * küçük ama gerçek olanı.
 */

/** Hata defterindeki bölümden o bölümün ekranına. */
const SCREEN_OF: Record<DeckKind, ScreenId> = {
  vocab: 'vocab',
  grammar: 'grammar',
  reading: 'read',
  listening: 'listen',
  speaking: 'speak',
  writing: 'write',
};

/**
 * Bölüm renkleri.
 *
 * Sabit bir tabloydu; temaya bağlanınca modül yüklenirken okunamaz oldu.
 * Fonksiyon olarak duruyor ve her bölüm aynı **rolü** koruyor: kelime mor,
 * gramer mavi, okuma yeşil. İki temada da aynı eşleme, farklı tonlar.
 */
const tintOf = (t: Theme): Record<DeckKind, string> => ({
  vocab: t.colors.secondary,
  grammar: t.colors.primary,
  reading: t.colors.success,
  listening: t.colors.accent,
  speaking: t.colors.warning,
  writing: t.colors.error,
});

export function CoachScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();
  const back = useBack('home');
  const { mistakes, forgetMistake, fire } = useApp();

  const list = useMemo(() => rankedMistakes(mistakes), [mistakes]);
  const byKind = useMemo(() => mistakesByKind(mistakes), [mistakes]);
  const worst = byKind[0];
  const total = byKind.reduce((n, k) => n + k.count, 0);

  return (
    <Screen tabbed padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View style={styles.flex}>
          <Txt f="m" s={17} w={800}>
            Hata defteri
          </Txt>
          <Txt s={11} w={600} c={t.colors.textDim}>
            {list.length
              ? `${list.length} soru · ${tr(total)} yanlış`
              : 'Yanlış yaptığın sorular burada birikir'}
          </Txt>
        </View>
      </View>

      {worst ? (
        <Gradient
          deg={145}
          colors={['rgba(124,92,255,.28)', 'rgba(34,211,238,.1)', 'rgba(14,20,38,.95)']}
          style={styles.plan}>
          <Txt f="mono" s={10} w={700} c={t.colors.violetSoft} ls={0.12}>
            EN ÇOK ZORLANDIĞIN BÖLÜM
          </Txt>
          <Txt f="m" s={20} w={800}>
            {worst.label}
          </Txt>
          <Txt s={14} w={600} lh={1.6} c={t.colors.textDim}>
            {byKind.length > 1
              ? `${tr(worst.count)} yanlışın ${tr(total)} yanlışının ${Math.round((worst.count / total) * 100)}%'i bu bölümde.`
              : `Bu bölümde ${tr(worst.count)} kez yanıldın.`}
          </Txt>
          <Press onPress={() => go(SCREEN_OF[worst.kind])} style={styles.planCta}>
            <Txt f="m" s={15} w={800}>
              {worst.label} bölümüne dön
            </Txt>
          </Press>
        </Gradient>
      ) : (
        <Panel gap={8} radius={radii.hero}>
          <Txt s={28}>📕</Txt>
          <Txt f="m" s={16} w={800}>
            Defter boş
          </Txt>
          <Txt s={13} lh={1.6} c={t.colors.textDim}>
            Bir soruyu yanlış yaptığında buraya düşer. Sonra tek tek üstünden
            geçip "öğrendim" diyerek defterden silersin.
          </Txt>
          <Press onPress={() => go('grammar')} style={styles.emptyCta}>
            <Txt f="m" s={14} w={800}>
              Gramer çalış
            </Txt>
          </Press>
        </Panel>
      )}

      {list.length ? (
        <Txt f="m" s={13.5} w={700} style={styles.sectionTitle}>
          En çok yanıldıkların
        </Txt>
      ) : null}

      {list.map((m) => (
        <View key={m.key} style={styles.row}>
          <View style={styles.rowHead}>
            <Tag label={kindLabel(m.kind)} tint={tintOf(t)[m.kind]} />
            <Txt f="mono" s={10} w={700} c={t.colors.textFaint}>
              {m.level}
            </Txt>
            <View style={styles.flex} />
            <Txt f="mono" s={10} w={700} c={m.times > 1 ? t.colors.errorSoft : t.colors.textFaint}>
              {m.times} KEZ
            </Txt>
          </View>

          <Txt s={13.5} lh={1.5}>
            {m.text}
          </Txt>

          <View style={styles.answer}>
            <Txt f="mono" s={10} w={700} c={t.colors.successSoft}>
              ✓
            </Txt>
            <Txt s={12.5} w={600} c={t.colors.successSoft} style={styles.flex}>
              {m.answer}
            </Txt>
          </View>

          <Press
            onPress={() => {
              forgetMistake(m.key);
              fire('Defterden silindi', 'Bir daha yanılırsan geri gelir.');
            }}
            accessibilityRole="button"
            accessibilityLabel="Bu soruyu defterden sil"
            style={styles.learned}>
            <Txt f="m" s={12} w={700} c={t.colors.textDim}>
              Öğrendim
            </Txt>
          </Press>
        </View>
      ))}
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    plan: {
      borderWidth: 1,
      borderColor: 'rgba(124,92,255,.32)',
      borderRadius: radii.hero,
      padding: 18,
      gap: 8,
    },
    planCta: {
      height: 50,
      borderRadius: radii.input,
      backgroundColor: t.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: t.shadows.ctaViolet,
      marginTop: 6,
    },
    emptyCta: {
      height: 46,
      borderRadius: radii.input,
      backgroundColor: t.alpha.w08,
      borderWidth: 1,
      borderColor: t.alpha.w14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    sectionTitle: { marginTop: 2 },
    row: {
      gap: 8,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.alpha.w07,
      borderRadius: radii.panel,
      padding: 14,
    },
    rowHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    answer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      backgroundColor: 'rgba(34,197,94,.1)',
      borderRadius: radii.input,
      paddingVertical: 9,
      paddingHorizontal: 11,
    },
    learned: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: t.alpha.w12,
      borderRadius: radii.chip,
      paddingVertical: 7,
      paddingHorizontal: 13,
    },
  });
