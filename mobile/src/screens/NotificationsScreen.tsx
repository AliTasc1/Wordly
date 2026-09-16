import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { BackButton, Press } from '../components/Buttons';
import { IconTile, Tag } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { FX, NOTIFICATIONS } from '../data/profile';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 25 · Bildirimler — grouped, each with an icon and a text label. */
export function NotificationsScreen() {
  const { go } = useGo();
  const back = useBack('home');
  const { fire } = useApp();

  return (
    <Screen padTop={62} gap={12}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <Txt f="m" s={17} w={800}>
          Bildirimler
        </Txt>
        <Press onPress={() => fire(FX.xp.title, FX.xp.note)} style={styles.markAll}>
          <Txt s={12} w={700} c={colors.link}>
            Tümünü okundu işaretle
          </Txt>
        </Press>
      </View>

      {NOTIFICATIONS.map((item) => (
        <Press
          key={item.title}
          onPress={() => go(item.target)}
          scale={0.99}
          style={[styles.row, item.unread ? styles.unread : styles.read]}>
          <IconTile glyph={item.glyph} tint={item.tint} size={40} radius={14} fontSize={17} />
          <View style={styles.flex}>
            <View style={styles.titleRow}>
              <Txt f="m" s={13} w={700} style={styles.flex}>
                {item.title}
              </Txt>
              <Tag label={item.kind} tint={item.tint} size={8.5} />
            </View>
            <Txt s={11.5} lh={1.45} c={colors.textDim} style={styles.text}>
              {item.text}
            </Txt>
          </View>
          <Txt f="mono" s={10} w={600} c={colors.textGhost}>
            {item.time}
          </Txt>
        </Press>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  markAll: { marginLeft: 'auto' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: radii.panel,
    borderWidth: 1,
  },
  unread: { backgroundColor: 'rgba(46,107,255,.1)', borderColor: 'rgba(46,107,255,.26)' },
  read: { backgroundColor: colors.surface, borderColor: alpha.w07 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  text: { marginTop: 2 },
});
