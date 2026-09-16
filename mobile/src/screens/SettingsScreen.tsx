import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press } from '../components/Buttons';
import { IconTile } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { SETTING_GROUPS, SETTINGS_FOOTER } from '../data/subscription';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 31 · Ayarlar — account, notifications, audio, accessibility, language. */
export function SettingsScreen() {
  const { go, reset } = useGo();
  const back = useBack('profile');
  const { fire } = useApp();

  return (
    <Screen tabbed padTop={62} gap={13}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <Txt f="m" s={17} w={800}>
          Ayarlar
        </Txt>
      </View>

      <Press onPress={() => go('sub')} scale={0.99}>
        <Gradient
          colors={['rgba(124,92,255,.22)', 'rgba(14,20,38,.92)']}
          style={styles.premium}>
          <Gradient colors={gradients.violetCyan} style={styles.premiumIcon}>
            <Txt s={18}>✦</Txt>
          </Gradient>
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              {SETTINGS_FOOTER.premium.title}
            </Txt>
            <Txt s={11.5} c={colors.violetSoft}>
              {SETTINGS_FOOTER.premium.sub}
            </Txt>
          </View>
          <Txt f="m" s={20} w={800}>
            ›
          </Txt>
        </Gradient>
      </Press>

      {SETTING_GROUPS.map((group) => (
        <View key={group.name} style={styles.group}>
          <Txt f="mono" s={10} w={700} c={colors.textDisabled} ls={0.14} style={styles.groupName}>
            {group.name}
          </Txt>
          <View style={styles.groupBody}>
            {group.items.map((item, i) => (
              <Press
                key={item.name}
                onPress={() => fire(item.name, SETTINGS_FOOTER.settingToast)}
                scale={0.995}
                style={[styles.item, i < group.items.length - 1 && styles.itemDivider]}>
                <IconTile
                  glyph={item.glyph}
                  tint={item.tint}
                  size={36}
                  radius={12}
                  fontSize={15}
                />
                <View style={styles.flex}>
                  <Txt f="m" s={13} w={700}>
                    {item.name}
                  </Txt>
                  <Txt s={10.5} c={colors.textFaint} style={styles.itemSub}>
                    {item.sub}
                  </Txt>
                </View>
                <Txt
                  f="mono"
                  s={11}
                  w={700}
                  c={item.value === 'Kapalı' ? colors.textGhost : colors.textDim}>
                  {item.value}
                </Txt>
              </Press>
            ))}
          </View>
        </View>
      ))}

      <Press onPress={() => reset('splash')} style={styles.signOut}>
        <Txt f="m" s={14} w={700} c={colors.errorSoft}>
          {SETTINGS_FOOTER.signOut}
        </Txt>
      </Press>

      <Txt f="mono" s={10.5} w={600} c={colors.textDisabled} style={styles.version}>
        {SETTINGS_FOOTER.version}
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  premium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,.32)',
    borderRadius: radii.tile,
    padding: 15,
  },
  premiumIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: { gap: 7 },
  groupName: { paddingHorizontal: 4 },
  groupBody: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w07,
    borderRadius: radii.panel,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: alpha.w06 },
  itemSub: { marginTop: 1 },
  signOut: {
    height: 50,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: 'rgba(255,77,94,.3)',
    backgroundColor: 'rgba(255,77,94,.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  version: { textAlign: 'center' },
});
