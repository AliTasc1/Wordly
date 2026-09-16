import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Press, PrimaryButton } from '../components/Buttons';
import { IconTile } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii, shadows } from '../theme/tokens';
import { BENEFITS, PAYWALL, PLANS } from '../data/subscription';
import { useApp } from '../state/AppContext';
import { useBack } from '../navigation/useGo';

/** 30 · Paywall — annual highlighted, seven-day trial, no dark patterns. */
export function PaywallScreen() {
  const close = useBack('home');
  const { fire, plan, setPlan } = useApp();
  const selected = PLANS.find((p) => p.id === plan) ?? PLANS[0];

  return (
    <Screen
      padTop={58}
      padH={20}
      padBottom={30}
      gap={16}
      glows={[
        { rx: 240, ry: 190, cx: 0.5, cy: 0.06, color: colors.secondary, opacity: 0.32, stop: 0.62 },
      ]}>
      <View style={styles.closeRow}>
        <Press
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          style={styles.close}>
          <Txt f="m" s={14} w={700} c={colors.textSubtle}>
            ✕
          </Txt>
        </Press>
      </View>

      <View style={styles.headline}>
        <Gradient colors={gradients.violetCyan} style={styles.badge}>
          <Txt f="mono" s={10} w={800} ls={0.14}>
            {PAYWALL.badge}
          </Txt>
        </Gradient>
        <Txt f="m" s={31} w={800} lh={1.18} ls={-0.02}>
          {PAYWALL.title}
        </Txt>
        <Txt s={14} lh={1.55} c={colors.textMuted}>
          {PAYWALL.sub}
        </Txt>
      </View>

      <View style={styles.benefits}>
        {BENEFITS.map((benefit) => (
          <View key={benefit.name} style={styles.benefit}>
            <IconTile
              glyph={benefit.glyph}
              tint={benefit.tint}
              size={38}
              radius={13}
              fontSize={16}
            />
            <View style={styles.flex}>
              <Txt f="m" s={13} w={700}>
                {benefit.name}
              </Txt>
              <Txt s={11} c={colors.textDim}>
                {benefit.sub}
              </Txt>
            </View>
            <Txt f="mono" s={11} w={700} c={colors.textGhost}>
              {benefit.free}
            </Txt>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        {PLANS.map((p) => {
          const on = p.id === plan;
          const content = (
            <>
              <View style={styles.flex}>
                <View style={styles.planNameRow}>
                  <Txt f="m" s={15} w={800}>
                    {p.name}
                  </Txt>
                  {p.tag ? (
                    <View style={styles.planTag}>
                      <Txt f="mono" s={9} w={800} c="#06210F" ls={0.06}>
                        {p.tag}
                      </Txt>
                    </View>
                  ) : null}
                </View>
                <Txt s={11.5} c={colors.textDim} style={styles.planSub}>
                  {p.sub}
                </Txt>
              </View>
              <View style={styles.priceCol}>
                <Txt f="m" s={18} w={800}>
                  {p.price}
                </Txt>
                <Txt f="mono" s={10.5} w={600} c={colors.textFaint}>
                  {p.unit}
                </Txt>
              </View>
              <View style={[styles.radio, on ? styles.radioOn : styles.radioOff]}>
                <Txt f="m" s={12} w={800} c={on ? colors.text : 'transparent'}>
                  ✓
                </Txt>
              </View>
            </>
          );

          return (
            <Press
              key={p.id}
              onPress={() => setPlan(p.id)}
              scale={0.99}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}>
              {on ? (
                <Gradient
                  colors={['rgba(46,107,255,.26)', 'rgba(124,92,255,.18)']}
                  style={[styles.plan, styles.planOn]}>
                  {content}
                </Gradient>
              ) : (
                <View style={[styles.plan, styles.planOff]}>{content}</View>
              )}
            </Press>
          );
        })}
      </View>

      <PrimaryButton
        label={PAYWALL.cta}
        height={58}
        shadow={shadows.ctaBrandLarge}
        onPress={() => fire(PAYWALL.trialStarted, selected.trialToast)}
      />

      <Txt s={11.5} lh={1.6} c={colors.textFaint} style={styles.legal}>
        {selected.trialNote}
        {'\n'}
        {PAYWALL.legal}
      </Txt>

      <View style={styles.links}>
        {PAYWALL.links.map((link) => (
          <Txt key={link} s={11} w={600} c={colors.textGhost}>
            {link}
          </Txt>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  closeRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  close: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: alpha.w14,
    backgroundColor: alpha.w06,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: { gap: 9, alignItems: 'flex-start' },
  badge: { paddingVertical: 6, paddingHorizontal: 11, borderRadius: radii.chip },
  benefits: { gap: 9 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  plans: { gap: 10 },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radii.tile,
    borderWidth: 1.5,
  },
  planOn: { borderColor: colors.blueTint, boxShadow: '0px 0px 0px 4px rgba(46,107,255,.12)' },
  planOff: { backgroundColor: colors.surface, borderColor: alpha.w08 },
  planNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planTag: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 7,
    backgroundColor: colors.success,
  },
  planSub: { marginTop: 3 },
  priceCol: { alignItems: 'flex-end' },
  radio: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.primary },
  radioOff: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,.22)' },
  legal: { textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
});
