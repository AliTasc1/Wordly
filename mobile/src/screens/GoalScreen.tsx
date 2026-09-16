import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { BackButton, Press, PrimaryButton } from '../components/Buttons';
import { Chip, Divider } from '../components/Surfaces';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { GOAL_SCREEN, GOALS, SKILL_OPTIONS, TIME_OPTIONS } from '../data/onboarding';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 03 · Hedef Seçimi — goals, daily time and focus skills build the syllabus. */
export function GoalScreen() {
  const { go } = useGo();
  const back = useBack('onb');
  const { goals, toggleGoal, dailyTime, setDailyTime, skills, toggleSkill } = useApp();

  const summary = goals.length
    ? `${goals.join(' · ')} · ${dailyTime} · ${skills.length} beceri`
    : GOAL_SCREEN.emptySummary;

  return (
    <Screen padTop={72} padH={22} padBottom={30} gap={20}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <ProgressBar
          pct={GOAL_SCREEN.progress}
          from={colors.primary}
          to={colors.secondary}
          style={styles.headerBar}
        />
        <Txt f="mono" s={12} w={700} c={colors.textDim}>
          {GOAL_SCREEN.step}
        </Txt>
      </View>

      <View>
        <Txt f="m" s={27} w={800} lh={1.2} ls={-0.02}>
          {GOAL_SCREEN.title}
        </Txt>
        <Txt s={13.5} c={colors.textDim} style={styles.sub}>
          {GOAL_SCREEN.sub}
        </Txt>
      </View>

      <View style={styles.grid}>
        {GOALS.map((goal) => {
          const active = goals.includes(goal.label);
          return (
            <Press
              key={goal.label}
              scale={0.98}
              onPress={() => toggleGoal(goal.label)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.goal, active ? styles.goalActive : styles.goalIdle]}>
              <Txt f="m" s={14} w={700}>
                {goal.label}
              </Txt>
              <Txt s={11} c={colors.textFaint}>
                {goal.sub}
              </Txt>
            </Press>
          );
        })}
      </View>

      <Divider />

      <View>
        <Txt f="m" s={15} w={700} style={styles.groupTitle}>
          {GOAL_SCREEN.timeTitle}
        </Txt>
        <View style={styles.timeRow}>
          {TIME_OPTIONS.map((t) => (
            <Chip
              key={t}
              label={t}
              active={dailyTime === t}
              onPress={() => setDailyTime(t)}
              padV={12}
              padH={0}
              style={styles.flex}
            />
          ))}
        </View>
      </View>

      <View>
        <Txt f="m" s={15} w={700} style={styles.groupTitle}>
          {GOAL_SCREEN.skillTitle}
        </Txt>
        <View style={styles.skillRow}>
          {SKILL_OPTIONS.map((s) => (
            <Chip
              key={s}
              label={s}
              active={skills.includes(s)}
              onPress={() => toggleSkill(s)}
              padV={9}
              padH={13}
            />
          ))}
        </View>
      </View>

      <Spacer />

      <View style={styles.footer}>
        <Txt s={11.5} c={colors.textDim} style={styles.summary}>
          {summary}
        </Txt>
        <PrimaryButton label={GOAL_SCREEN.cta} onPress={() => go('test')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBar: { flex: 1 },
  sub: { marginTop: 7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goal: {
    width: '48%',
    flexGrow: 1,
    gap: 3,
    padding: 13,
    borderRadius: radii.input,
    borderWidth: 1,
  },
  goalActive: {
    backgroundColor: 'rgba(46,107,255,.18)',
    borderColor: colors.primary,
    boxShadow: '0px 0px 0px 3px rgba(46,107,255,.1)',
  },
  goalIdle: { backgroundColor: colors.surface, borderColor: alpha.w08 },
  groupTitle: { marginBottom: 10 },
  timeRow: { flexDirection: 'row', gap: 8 },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1 },
  footer: { gap: 8 },
  summary: { textAlign: 'center' },
});
