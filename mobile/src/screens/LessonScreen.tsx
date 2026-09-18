import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton } from '../components/Buttons';
import { IconTile, Row } from '../components/Surfaces';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
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
        colors={['rgba(46,107,255,.3)', 'rgba(124,92,255,.14)', 'transparent']}
        style={styles.hero}>
        <View style={styles.heroTop}>
          <BackButton onPress={back} strong />
          <View style={styles.unitTag}>
            <Txt f="mono" s={11} w={700} c={colors.textSubtle}>
              {cefr} · DERS {String(lesson.order).padStart(2, '0')}
            </Txt>
          </View>
        </View>
        <Txt f="m" s={28} w={800} lh={1.2} ls={-0.02}>
          {lesson.title}
        </Txt>
        <Txt s={13} lh={1.5} c={colors.textSubtle}>
          {lesson.canDo}
        </Txt>
        <ProgressBar
          pct={progress}
          from={colors.accent}
          to={colors.primary}
          height={8}
          track="rgba(0,0,0,.4)"
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
                tint={done ? colors.success : colors.textDim}
                size={44}
                radius={15}
                fontSize={18}
                solid={current ? gradients.brand : undefined}
                style={!done && !current ? styles.stepIdle : undefined}
              />
              <View style={styles.flex}>
                <Txt f="m" s={14.5} w={700}>
                  {step.name}
                </Txt>
                <Txt s={11.5} c={colors.textDim} style={styles.stepSub} numberOfLines={1}>
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
                  s={10}
                  w={700}
                  ls={0.06}
                  c={done ? colors.successSoft : current ? '#9FBEFF' : colors.textFaint}>
                  {step.tag}
                </Txt>
              </View>
            </Row>
          );
        })}

        <View style={styles.exam}>
          <View style={styles.examIcon}>
            <Txt s={18}>🏆</Txt>
          </View>
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              Seviye Sınavı
            </Txt>
            <Txt s={11.5} c={colors.textDim}>
              40 soruda seviyeni ölç
            </Txt>
          </View>
          <Txt f="mono" s={11} w={700} c={colors.link} onPress={() => go('test')}>
            ÇÖZ ›
          </Txt>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { paddingTop: 62, paddingHorizontal: 20, paddingBottom: 22, gap: 12 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitTag: {
    marginLeft: 'auto',
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radii.chip,
    backgroundColor: 'rgba(0,0,0,.35)',
  },
  steps: { paddingTop: 6, paddingHorizontal: 18, gap: 10 },
  stepIdle: { backgroundColor: alpha.w05, borderColor: alpha.w10 },
  stepSub: { marginTop: 2 },
  tag: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: radii.sm },
  tagDone: { backgroundColor: 'rgba(34,197,94,.14)' },
  tagNow: { backgroundColor: 'rgba(46,107,255,.2)' },
  tagIdle: { backgroundColor: alpha.w05 },
  exam: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: alpha.w14,
    borderRadius: radii.tile,
    padding: 16,
    backgroundColor: alpha.w02,
  },
  examIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.card,
    backgroundColor: 'rgba(245,165,36,.16)',
    borderWidth: 1,
    borderColor: 'rgba(245,165,36,.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
