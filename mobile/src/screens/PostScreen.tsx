import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Avatar } from '../components/Avatar';
import { BackButton, Press } from '../components/Buttons';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { POST } from '../data/social';
import { useApp } from '../state/AppContext';
import { useBack, useGo } from '../navigation/useGo';

/** 21 · Gönderi — post detail with comments and a challenge action. */
export function PostScreen() {
  const { go } = useGo();
  const back = useBack('social');
  const { fire, liked, toggleLiked, following, toggleFollowing } = useApp();

  const onFollow = () => {
    const next = following ? POST.toasts.unfollow : POST.toasts.follow;
    toggleFollowing();
    fire(next.title, next.note);
  };

  return (
    <Screen padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <Txt f="m" s={16} w={800}>
          Gönderi
        </Txt>
      </View>

      <View style={styles.card}>
        <View style={styles.author}>
          <Avatar
            initials={POST.author.initials}
            from={POST.author.avatar[0]}
            to={POST.author.avatar[1]}
            size={42}
          />
          <View style={styles.flex}>
            <View style={styles.nameRow}>
              <Txt f="m" s={14.5} w={700}>
                {POST.author.name}
              </Txt>
              <View style={styles.levelTag}>
                <Txt f="mono" s={9.5} w={700} c={colors.accentSoft}>
                  {POST.author.level}
                </Txt>
              </View>
            </View>
            <Txt s={11} w={600} c={colors.textFaint}>
              {POST.author.meta}
            </Txt>
          </View>
          <Press
            onPress={onFollow}
            accessibilityRole="button"
            accessibilityState={{ selected: following }}>
            {following ? (
              <View style={[styles.follow, styles.followOn]}>
                <Txt f="m" s={11.5} w={800} c={colors.textSubtle}>
                  Takiptesin
                </Txt>
              </View>
            ) : (
              <Gradient colors={gradients.brand} style={styles.follow}>
                <Txt f="m" s={11.5} w={800}>
                  Takip et
                </Txt>
              </Gradient>
            )}
          </Press>
        </View>

        <Txt s={15} lh={1.65} c={colors.textBright}>
          {POST.text}
        </Txt>

        <Gradient
          colors={['rgba(124,92,255,.3)', 'rgba(34,211,238,.16)']}
          style={styles.achievement}>
          <View style={styles.medal}>
            <Txt s={24}>{POST.achievement.glyph}</Txt>
          </View>
          <View style={styles.flex}>
            <Txt f="mono" s={10} w={700} ls={0.12} style={styles.medalKicker}>
              {POST.achievement.kicker}
            </Txt>
            <Txt f="m" s={18} w={800} style={styles.medalTitle}>
              {POST.achievement.title}
            </Txt>
            <Txt s={11.5} style={styles.medalSub}>
              {POST.achievement.sub}
            </Txt>
          </View>
        </Gradient>

        <View style={styles.actions}>
          <Press
            onPress={toggleLiked}
            accessibilityRole="button"
            accessibilityState={{ selected: liked }}
            style={[styles.action, liked ? styles.likeOn : styles.likeOff]}>
            <Txt f="m" s={13} w={700} c={liked ? colors.errorTint : colors.textSubtle}>
              {liked ? '♥ 49' : '♡ 48'}
            </Txt>
          </Press>
          <Press
            onPress={() => fire(POST.toasts.comment.title, POST.toasts.comment.note)}
            style={[styles.action, styles.likeOff]}>
            <Txt f="m" s={13} w={700} c={colors.textSubtle}>
              💬 Yorum
            </Txt>
          </Press>
          <Press onPress={() => go('duel')} style={styles.flex}>
            <Gradient colors={gradients.brand} style={styles.challenge}>
              <Txt f="m" s={13} w={800}>
                ⚔ Çağır
              </Txt>
            </Gradient>
          </Press>
        </View>
      </View>

      <Txt f="m" s={13.5} w={700}>
        {POST.commentCount}
      </Txt>

      {POST.comments.map((comment) => (
        <View key={comment.name} style={styles.comment}>
          <Avatar
            initials={comment.initials}
            from={comment.avatar[0]}
            to={comment.avatar[1]}
            size={32}
          />
          <View style={styles.flex}>
            <View style={styles.commentHead}>
              <Txt f="m" s={12.5} w={700}>
                {comment.name}
              </Txt>
              <Txt f="mono" s={10} w={600} c={colors.textGhost}>
                {comment.time}
              </Txt>
            </View>
            <Txt s={13} lh={1.55} c={colors.textBody} style={styles.commentBody}>
              {comment.text}
            </Txt>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: {
    gap: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.section,
    padding: 16,
  },
  author: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelTag: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 7,
    backgroundColor: 'rgba(34,211,238,.16)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,.32)',
  },
  follow: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followOn: { backgroundColor: alpha.w06, borderWidth: 1, borderColor: alpha.w14 },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radii.panel,
    padding: 16,
    borderWidth: 1,
    borderColor: alpha.w14,
  },
  medal: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,.28)',
    borderWidth: 1.5,
    borderColor: alpha.w30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalKicker: { opacity: 0.85 },
  medalTitle: { marginTop: 3 },
  medalSub: { opacity: 0.82 },
  actions: { flexDirection: 'row', gap: 9 },
  action: {
    flex: 1,
    height: 44,
    borderRadius: radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  likeOn: { backgroundColor: 'rgba(255,77,94,.18)', borderColor: colors.error },
  likeOff: { backgroundColor: alpha.w04, borderColor: alpha.w12 },
  challenge: { height: 44, borderRadius: radii.card, alignItems: 'center', justifyContent: 'center' },
  comment: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: alpha.w03,
    borderWidth: 1,
    borderColor: alpha.w06,
    borderRadius: radii.panel,
    padding: 13,
  },
  commentHead: { flexDirection: 'row', alignItems: 'baseline', gap: 7 },
  commentBody: { marginTop: 3 },
});
