import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton } from '../components/Buttons';
import { IconTile, Row } from '../components/Surfaces';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { grammarOf, listeningOf, readingOf, speakingOf, writingOf } from '../content';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';
import type { ScreenId } from '../navigation/routes';

/**
 * 09 · Ders — the open lesson and the five sections around it.
 *
 * The sections are not invented: each one names the actual next item waiting
 * in that deck, so tapping a row opens exactly what the subtitle promised.
 */
export function LessonScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();
  const back = useBack('map');
  const { cefr, position } = useApp();

  const lessons = useMemo(() => grammarOf(cefr), [cefr]);
  const at = Math.min(position('grammar', cefr), lessons.length - 1);
  const lesson = lessons[at];

  const reading = useMemo(() => readingOf(cefr), [cefr]);
  const listening = useMemo(() => listeningOf(cefr), [cefr]);
  const speaking = useMemo(() => speakingOf(cefr), [cefr]);
  const writing = useMemo(() => writingOf(cefr), [cefr]);

  const nextIn = <T extends { title: string; minutes: number }>(items: T[], kind: Parameters<typeof position>[0]) =>
    items[Math.min(position(kind, cefr), items.length - 1)];

  const read = nextIn(reading, 'reading');
  const listen = nextIn(listening, 'listening');
  const speak = nextIn(speaking, 'speaking');

  const steps: {
    name: string;
    sub: string;
    target: ScreenId;
    glyph: string;
    tag: string;
    state: 'done' | 'now' | 'idle';
  }[] = [
    {
      name: 'Kelime',
      sub: `${cefr} destesi · sırada ${position('vocab', cefr) + 1}. kart`,
      target: 'vocab',
      glyph: '🔤',
      tag: 'DESTE',
      state: 'idle',
    },
    {
      name: 'Gramer',
      sub: lesson.topic,
      target: 'grammar',
      glyph: '📐',
      tag: 'DEVAM',
      state: 'now',
    },
    {
      name: 'Dinleme',
      sub: listen.title,
      target: 'listen',
      glyph: '🎧',
      tag: `${listen.minutes} dk`,
      state: 'idle',
    },
    {
      name: 'Okuma',
      sub: read.title,
      target: 'read',
      glyph: '📖',
      tag: `${read.minutes} dk`,
      state: 'idle',
    },
    {
      name: 'Konuşma',
      sub: speak.title,
      target: 'speak',
      glyph: '🎙',
      tag: `${speak.minutes} dk`,
      state: 'idle',
    },
  ];

  // Yazma seviye seviye yazılıyor; henüz hazır olmayan seviyede adımı hiç
  // göstermiyoruz. Boş bir bölüme götüren düğme, olmayan bir şeyi vaat eder.
  if (writing.length) {
    steps.push({
      name: 'Yazma',
      sub: writing[Math.min(position('writing', cefr), writing.length - 1)].title,
      target: 'write',
      glyph: '✍️',
      tag: `${writing.length} set`,
      state: 'idle',
    });
  }

  const progress = lessons.length ? Math.round((at / lessons.length) * 100) : 0;

  return (
    <Screen tabbed padTop={0} padH={0} gap={0}>
      <Gradient
        deg={160}
        colors={[tint(t.colors.primary, 0.3), tint(t.colors.secondary, 0.14), 'transparent']}
        style={styles.hero}>
        <View style={styles.heroTop}>
          <BackButton onPress={back} strong />
          <View style={styles.unitTag}>
            <Txt f="mono" s={font.caption} w={700} c={t.colors.textSubtle}>
              {cefr} · DERS {String(lesson.order).padStart(2, '0')}
            </Txt>
          </View>
        </View>
        <Txt f="m" s={font.jumbo} w={800} lh={1.2} ls={-0.02}>
          {lesson.title}
        </Txt>
        <Txt s={font.footnote} lh={1.5} c={t.colors.textSubtle}>
          {lesson.canDo}
        </Txt>
        <ProgressBar
          pct={progress}
          from={t.colors.accent}
          to={t.colors.primary}
          height={8}
          track={t.alpha.black40}
        />
      </Gradient>

      <View style={styles.steps}>
        {steps.map((step) => {
          const done = step.state === 'done';
          const current = step.state === 'now';
          return (
            <Row key={step.name} active={current} onPress={() => go(step.target)}>
              <IconTile
                glyph={step.glyph}
                tint={done ? t.colors.success : t.colors.textDim}
                size={44}
                radius={15}
                fontSize={18}
                solid={current ? t.gradients.brand : undefined}
                style={!done && !current ? styles.stepIdle : undefined}
              />
              <View style={styles.flex}>
                <Txt f="m" s={font.body} w={700}>
                  {step.name}
                </Txt>
                <Txt s={font.caption} c={t.colors.textDim} style={styles.stepSub} numberOfLines={1}>
                  {step.sub}
                </Txt>
              </View>
              <View
                style={[
                  styles.tag,
                  done ? styles.tagDone : current ? styles.tagNow : styles.tagIdle,
                ]}>
                <Txt
                  f="mono"
                  s={font.label}
                  w={700}
                  ls={0.06}
                  c={done ? t.colors.successSoft : current ? t.colors.blueSoft : t.colors.textFaint}>
                  {step.tag}
                </Txt>
              </View>
            </Row>
          );
        })}

        <View style={styles.exam}>
          <View style={styles.examIcon}>
            <Txt s={font.title}>🏆</Txt>
          </View>
          <View style={styles.flex}>
            <Txt f="m" s={font.body} w={700}>
              Seviye Sınavı
            </Txt>
            <Txt s={font.caption} c={t.colors.textDim}>
              40 soruda seviyeni ölç
            </Txt>
          </View>
          <Txt f="mono" s={font.caption} w={700} c={t.colors.link} onPress={() => go('test')}>
            ÇÖZ ›
          </Txt>
        </View>
      </View>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    hero: { paddingTop: 62, paddingHorizontal: 20, paddingBottom: 22, gap: 12 },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    unitTag: {
      marginLeft: 'auto',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: radii.chip,
      backgroundColor: t.alpha.black35,
    },
    steps: { paddingTop: 6, paddingHorizontal: 18, gap: 10 },
    stepIdle: { backgroundColor: t.alpha.w05, borderColor: t.alpha.w10 },
    stepSub: { marginTop: 2 },
    tag: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: radii.sm },
    tagDone: { backgroundColor: tint(t.colors.success, 0.14) },
    tagNow: { backgroundColor: tint(t.colors.primary, 0.2) },
    tagIdle: { backgroundColor: t.alpha.w05 },
    exam: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: t.alpha.w14,
      borderRadius: radii.tile,
      padding: 16,
      backgroundColor: t.alpha.w02,
    },
    examIcon: {
      width: 44,
      height: 44,
      borderRadius: radii.card,
      backgroundColor: tint(t.colors.warning, 0.16),
      borderWidth: 1,
      borderColor: tint(t.colors.warning, 0.3),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
