import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { BackButton, Press } from '../components/Buttons';
import { IconTile, Tag } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import { CLUBS } from '../data/social';
import { useBack, useGo } from '../navigation/useGo';

/** 23 · Kulüpler — interest-based communities. */
export function ClubsScreen() {
  const { go } = useGo();
  const back = useBack('social');

  return (
    <Screen tabbed padTop={62} gap={13}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View>
          <Txt f="m" s={17} w={800}>
            Kulüpler
          </Txt>
          <Txt s={11} w={600} c={colors.textDim}>
            İlgi alanına göre öğren
          </Txt>
        </View>
      </View>

      {CLUBS.map((club) => (
        <Press key={club.name} onPress={() => go('club')} scale={0.99} style={styles.row}>
          <IconTile glyph={club.glyph} tint={club.tint} size={46} radius={16} fontSize={20} />
          <View style={styles.flex}>
            <View style={styles.nameRow}>
              <Txt f="m" s={14} w={700}>
                {club.name}
              </Txt>
              <Tag label={club.tag} tint={club.tint} size={9} />
            </View>
            <Txt s={11.5} c={colors.textDim} style={styles.meta}>
              {club.meta}
            </Txt>
          </View>
          <Txt f="mono" s={11} w={700} c={colors.link}>
            {club.cta}
          </Txt>
        </Press>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.tile,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w07,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  meta: { marginTop: 2 },
});
