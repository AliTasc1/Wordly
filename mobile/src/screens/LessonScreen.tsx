import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton } from '../components/Buttons';
import { IconTile, Row } from '../components/Surfaces';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { LESSON_STEPS, OPEN_UNIT } from '../data/curriculum';
import { useBack, useGo } from '../navigation/useGo';

/** 09 · Ders — the open unit split into six sections. */
export function LessonScreen() {
  const { go } = useGo();
  const back = useBack('map');

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
              {OPEN_UNIT.number}
            </Txt>
          </View>
        </View>
        <Txt f="m" s={28} w={800} lh={1.2} ls={-0.02}>
          {OPEN_UNIT.title}
        </Txt>
        <Txt s={13} lh={1.5} c={colors.textSubtle}>
          {OPEN_UNIT.meta}
        </Txt>
        <ProgressBar
          pct={OPEN_UNIT.progress}
          from={colors.accent}
          to={colors.primary}
          height={8}
          track="rgba(0,0,0,.4)"
        />
      </Gradient>

      <View style={styles.steps}>
        {LESSON_STEPS.map((step) => {
          const done = step.tag === 'BİTTİ';
          const current = step.tag === 'DEVAM';
          return (
            <Row key={step.name} active={current} onPress={() => go(routeFor(step.target))}>
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
                <Txt s={11.5} c={colors.textDim} style={styles.stepSub}>
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
              Ünite Sınavı
            </Txt>
            <Txt s={11.5} c={colors.textDim}>
              4 bölümü bitirince açılır
            </Txt>
          </View>
          <Txt f="mono" s={11} w={700} c={colors.textGhost}>
            KİLİTLİ
          </Txt>
        </View>
      </View>
    </Screen>
  );
}

const routeFor = (target: string) =>
  ({ Vocab: 'vocab', Grammar: 'grammar', Listen: 'listen', Read: 'read', Speak: 'speak' })[
    target
  ] as 'vocab' | 'grammar' | 'listen' | 'read' | 'speak';

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
