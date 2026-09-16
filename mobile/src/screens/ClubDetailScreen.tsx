import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Avatar } from '../components/Avatar';
import { BackButton, Press, TinyButton } from '../components/Buttons';
import { StatTile } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { CLUB_DETAIL } from '../data/social';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 24 · Kulüp Detayı — daily task, leaderboard, chat and tournament. */
export function ClubDetailScreen() {
  const { go } = useGo();
  const back = useBack('clubs');
  const { fire, joinedClub, toggleJoinedClub } = useApp();

  const onJoin = () => {
    const next = joinedClub ? CLUB_DETAIL.toasts.left : CLUB_DETAIL.toasts.joined;
    toggleJoinedClub();
    fire(next.title, next.note);
  };

  return (
    <Screen padTop={0} padH={0} gap={0}>
      <Gradient
        deg={155}
        colors={['rgba(34,197,94,.26)', 'rgba(46,107,255,.16)', 'transparent']}
        style={styles.hero}>
        <View style={styles.heroTop}>
          <BackButton onPress={back} strong />
          <Press
            onPress={onJoin}
            accessibilityRole="button"
            accessibilityState={{ selected: joinedClub }}
            style={[styles.join, joinedClub ? styles.joined : styles.notJoined]}>
            <Txt f="m" s={12} w={800} c={joinedClub ? colors.text : colors.onLight}>
              {joinedClub ? 'Üyesin ✓' : 'Katıl'}
            </Txt>
          </Press>
        </View>

        <View style={styles.identity}>
          <View style={styles.clubIcon}>
            <Txt s={26}>{CLUB_DETAIL.glyph}</Txt>
          </View>
          <View style={styles.flex}>
            <Txt f="m" s={21} w={800}>
              {CLUB_DETAIL.name}
            </Txt>
            <Txt s={11.5} w={600} c={colors.textSubtle} style={styles.clubMeta}>
              {CLUB_DETAIL.meta}
            </Txt>
          </View>
        </View>

        <Txt s={12.5} lh={1.55} c={colors.textSubtle}>
          {CLUB_DETAIL.description}
        </Txt>
      </Gradient>

      <View style={styles.body}>
        <Gradient
          colors={['rgba(46,107,255,.2)', 'rgba(14,20,38,.92)']}
          style={styles.task}>
          <View style={styles.taskIcon}>
            <Txt s={19}>🎯</Txt>
          </View>
          <View style={styles.flex}>
            <Txt f="m" s={13.5} w={700}>
              {CLUB_DETAIL.dailyTask.title}
            </Txt>
            <Txt s={11.5} c={colors.textSubtle}>
              {CLUB_DETAIL.dailyTask.sub}
            </Txt>
          </View>
          <TinyButton label={CLUB_DETAIL.dailyTask.cta} onPress={() => go('speak')} />
        </Gradient>

        <View style={styles.stats}>
          {CLUB_DETAIL.stats.map((s) => (
            <StatTile key={s.label} value={s.value} label={s.label} tint={s.tint} size={16} />
          ))}
        </View>

        <Txt f="m" s={13.5} w={700} style={styles.sectionTitle}>
          Kulüp lider tablosu
        </Txt>
        <View style={styles.board}>
          {CLUB_DETAIL.board.map((row) => (
            <View key={row.rank} style={[styles.boardRow, row.name === 'Sen' && styles.boardRowMe]}>
              <Txt f="mono" s={12} w={700} c={colors.textDim} style={styles.rank}>
                {row.rank}
              </Txt>
              <Avatar initials={row.initials} from={row.avatar[0]} to={row.avatar[1]} size={30} />
              <Txt f="m" s={13} w={700} style={styles.flex}>
                {row.name}
              </Txt>
              <Txt f="mono" s={12} w={700} c={colors.accent}>
                {row.xp}
              </Txt>
            </View>
          ))}
        </View>

        <Txt f="m" s={13.5} w={700} style={styles.sectionTitle}>
          Sohbet
        </Txt>
        <View style={styles.chat}>
          {CLUB_DETAIL.chat.map((message, i) => (
            <View key={i} style={styles.message}>
              <Avatar
                initials={message.initials}
                from={message.avatar[0]}
                to={message.avatar[1]}
                size={28}
              />
              <View style={styles.flex}>
                <Txt f="m" s={11.5} w={700}>
                  {message.name}
                </Txt>
                <Txt s={12.5} lh={1.5} c={colors.textBody}>
                  {message.text}
                </Txt>
              </View>
            </View>
          ))}
          <View style={styles.input}>
            <Txt s={12.5} c={colors.textGhost} style={styles.flex}>
              Mesaj yaz…
            </Txt>
            <Gradient colors={gradients.brand} style={styles.send}>
              <Txt f="m" s={12} w={700}>
                ↑
              </Txt>
            </Gradient>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { paddingTop: 58, paddingHorizontal: 18, paddingBottom: 20, gap: 12 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  join: {
    marginLeft: 'auto',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: radii.lg,
  },
  joined: { backgroundColor: alpha.w12, borderWidth: 1, borderColor: alpha.w24 },
  notJoined: { backgroundColor: colors.text },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  clubIcon: {
    width: 62,
    height: 62,
    borderRadius: radii.tile,
    backgroundColor: 'rgba(0,0,0,.3)',
    borderWidth: 1,
    borderColor: alpha.w18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubMeta: { marginTop: 2 },
  body: { paddingTop: 4, paddingHorizontal: 18, paddingBottom: 40, gap: 12 },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(46,107,255,.32)',
    borderRadius: radii.tile,
    padding: 15,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.input,
    backgroundColor: 'rgba(46,107,255,.26)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', gap: 9 },
  sectionTitle: { marginTop: 2 },
  board: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.tile,
    padding: 8,
  },
  boardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 9, borderRadius: radii.lg },
  boardRowMe: {
    backgroundColor: 'rgba(46,107,255,.14)',
    borderWidth: 1,
    borderColor: 'rgba(46,107,255,.3)',
  },
  rank: { width: 22 },
  chat: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.tile,
    padding: 14,
    gap: 10,
  },
  message: { flexDirection: 'row', gap: 9 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: alpha.w04,
    borderWidth: 1,
    borderColor: alpha.w10,
    borderRadius: radii.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  send: { width: 30, height: 30, borderRadius: radii.chip, alignItems: 'center', justifyContent: 'center' },
});
