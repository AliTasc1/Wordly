import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Avatar, PresenceDot } from '../components/Avatar';
import { BackButton, Press, TinyButton } from '../components/Buttons';
import { Chip } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { DUEL_INVITE, FRIEND_TABS, FRIENDS } from '../data/social';
import { FX } from '../data/profile';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 22 · Arkadaşlar — friends, followers and following with live activity. */
export function FriendsScreen() {
  const { go } = useGo();
  const back = useBack('social');
  const { fire } = useApp();
  const [tab, setTab] = useState(FRIEND_TABS[0]);

  return (
    <Screen tabbed padTop={62} gap={13}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <Txt f="m" s={17} w={800}>
          Arkadaşlar
        </Txt>
        <Press
          onPress={() => fire(FX.achievement.title, FX.achievement.note)}
          style={styles.inviteWrap}>
          <Gradient colors={gradients.brand} style={styles.invite}>
            <Txt f="m" s={12} w={800}>
              + Davet et
            </Txt>
          </Gradient>
        </Press>
      </View>

      <View style={styles.tabs}>
        {FRIEND_TABS.map((t) => (
          <Chip
            key={t}
            label={t}
            active={tab === t}
            onPress={() => setTab(t)}
            padV={10}
            padH={0}
            style={styles.flex}
          />
        ))}
      </View>

      <Gradient
        colors={['rgba(255,77,94,.16)', 'rgba(14,20,38,.92)']}
        style={styles.inviteCard}>
        <Avatar
          initials={DUEL_INVITE.initials}
          from={colors.orange}
          to={colors.error}
          size={44}
        />
        <View style={styles.flex}>
          <Txt f="m" s={13.5} w={700}>
            {DUEL_INVITE.title}
          </Txt>
          <Txt s={11.5} c={colors.textDim}>
            {DUEL_INVITE.sub}
          </Txt>
        </View>
        <TinyButton label={DUEL_INVITE.accept} bg={colors.error} onPress={() => go('duel')} />
      </Gradient>

      {FRIENDS.map((friend) => (
        <View key={friend.name} style={styles.row}>
          <View>
            <Avatar
              initials={friend.initials}
              from={friend.avatar[0]}
              to={friend.avatar[1]}
              size={40}
            />
            <PresenceDot online={friend.online} />
          </View>
          <View style={styles.flex}>
            <View style={styles.nameRow}>
              <Txt f="m" s={13.5} w={700}>
                {friend.name}
              </Txt>
              <View style={styles.levelTag}>
                <Txt f="mono" s={9} w={700} c={colors.accentSoft}>
                  {friend.level}
                </Txt>
              </View>
            </View>
            <Txt s={11} c={colors.textFaint} style={styles.activity}>
              {friend.activity}
            </Txt>
          </View>
          <Press
            onPress={() => (friend.action === 'Düello' ? go('duel') : fire(friend.action, friend.name))}
            style={styles.action}>
            <Txt f="m" s={11} w={800}>
              {friend.action}
            </Txt>
          </Press>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inviteWrap: { marginLeft: 'auto' },
  invite: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: radii.md },
  tabs: { flexDirection: 'row', gap: 7 },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,77,94,.3)',
    borderRadius: radii.tile,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w07,
    borderRadius: radii.panel,
    padding: 12,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelTag: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(34,211,238,.14)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,.28)',
  },
  activity: { marginTop: 2 },
  action: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(46,107,255,.34)',
    backgroundColor: 'rgba(46,107,255,.16)',
  },
});
