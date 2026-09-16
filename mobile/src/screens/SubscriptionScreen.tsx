import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, GhostButton, PrimaryButton } from '../components/Buttons';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { CURRENT_PLAN, SUBSCRIPTION_CTA, USAGE } from '../data/subscription';
import { FX } from '../data/profile';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 29 · Abonelik — current plan, daily limits and management. */
export function SubscriptionScreen() {
  const { go } = useGo();
  const back = useBack('settings');
  const { fire } = useApp();

  return (
    <Screen tabbed padTop={62} gap={13}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <Txt f="m" s={17} w={800}>
          Aboneliğin
        </Txt>
      </View>

      <Gradient
        deg={140}
        colors={['rgba(255,255,255,.1)', 'rgba(14,20,38,.95)']}
        style={styles.planCard}>
        <View style={styles.planHead}>
          <View>
            <Txt f="mono" s={10} w={700} c={colors.textDim} ls={0.12}>
              {CURRENT_PLAN.kicker}
            </Txt>
            <Txt f="m" s={20} w={800} style={styles.planName}>
              {CURRENT_PLAN.name}
            </Txt>
          </View>
          <View style={styles.status}>
            <Txt f="mono" s={11} w={700} c={colors.textSubtle}>
              {CURRENT_PLAN.status}
            </Txt>
          </View>
        </View>
        <Txt s={12.5} lh={1.55} c={colors.textDim}>
          {CURRENT_PLAN.note}
        </Txt>
      </Gradient>

      <Txt f="m" s={13.5} w={700}>
        {SUBSCRIPTION_CTA.usageTitle}
      </Txt>

      {USAGE.map((item) => {
        const maxed = item.pct === 100;
        return (
          <View key={item.name} style={styles.usage}>
            <View style={styles.usageHead}>
              <Txt f="m" s={13} w={700}>
                {item.name}
              </Txt>
              <Txt f="mono" s={11.5} w={700} c={maxed ? colors.errorSoft : colors.textDim}>
                {item.value}
              </Txt>
            </View>
            <ProgressBar
              pct={item.pct}
              from={maxed ? colors.error : colors.primary}
              to={maxed ? colors.orange : colors.accent}
            />
            <Txt s={11} c={colors.textFaint}>
              {item.note}
            </Txt>
          </View>
        );
      })}

      <PrimaryButton
        label={SUBSCRIPTION_CTA.upgrade}
        size={16}
        onPress={() => go('paywall')}
      />
      <GhostButton
        label={SUBSCRIPTION_CTA.restore}
        size={13.5}
        color={colors.textDim}
        onPress={() => fire(FX.xp.title, FX.xp.note)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planCard: {
    borderWidth: 1,
    borderColor: alpha.w14,
    borderRadius: radii.section,
    padding: 16,
    gap: 11,
  },
  planHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { marginTop: 3 },
  status: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radii.chip,
    backgroundColor: alpha.w08,
  },
  usage: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w07,
    borderRadius: radii.panel,
    padding: 14,
    gap: 8,
  },
  usageHead: { flexDirection: 'row', justifyContent: 'space-between' },
});
