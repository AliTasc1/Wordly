import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Avatar } from '../components/Avatar';
import { Press } from '../components/Buttons';
import { Chip } from '../components/Surfaces';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { FEED, SOCIAL_TABS } from '../data/social';
import { FX } from '../data/profile';
import { useApp } from '../state/AppContext';
import { useGo } from '../navigation/useGo';

/** 20 · Sosyal Akış — every post is progress or a question, not a photo feed. */
export function SocialScreen() {
  const { go } = useGo();
  const { fire } = useApp();
  const [tab, setTab] = useState(SOCIAL_TABS[0]);

  return (
    <Screen tabbed padTop={62} gap={13}>
      <View style={styles.header}>
        <Txt f="m" s={24} w={800} ls={-0.02}>
          Topluluk
        </Txt>
        <View style={styles.headerActions}>
          <Press
            onPress={() => go('friends')}
            accessibilityRole="button"
            accessibilityLabel="Arkadaşlar"
            style={styles.headerBtn}>
            <Txt s={15}>👥</Txt>
          </Press>
          <Press
            onPress={() => go('clubs')}
            accessibilityRole="button"
            accessibilityLabel="Kulüpler"
            style={styles.headerBtn}>
            <Txt s={15}>🏛</Txt>
          </Press>
        </View>
      </View>

      <View style={styles.tabs}>
        {SOCIAL_TABS.map((t) => (
          <Chip
            key={t}
            label={t}
            active={tab === t}
            onPress={() => {
              setTab(t);
              if (t === 'Arkadaşlar') go('friends');
              if (t === 'Kulüpler') go('clubs');
            }}
            padV={10}
            padH={0}
            style={styles.flex}
          />
        ))}
      </View>

      <View style={styles.composer}>
        <Avatar initials="A" from={colors.primary} to={colors.secondary} size={34} />
        <Txt s={12.5} c={colors.textGhost} style={styles.flex}>
          Bugün ne öğrendin?
        </Txt>
        <Press onPress={() => fire(FX.xp.title, FX.xp.note)}>
          <Gradient colors={gradients.brand} style={styles.share}>
            <Txt f="m" s={11.5} w={800}>
              Paylaş
            </Txt>
          </Gradient>
        </Press>
      </View>

      {FEED.map((post) => (
        <Press key={post.name} onPress={() => go('post')} scale={0.99} style={styles.post}>
          <View style={styles.postHead}>
            <Avatar initials={post.initials} from={post.avatar[0]} to={post.avatar[1]} size={38} />
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <Txt f="m" s={13.5} w={700}>
                  {post.name}
                </Txt>
                <View style={styles.levelTag}>
                  <Txt f="mono" s={9.5} w={700} c={colors.accentSoft}>
                    {post.level}
                  </Txt>
                </View>
              </View>
              <Txt s={10.5} w={600} c={colors.textFaint}>
                {post.meta}
              </Txt>
            </View>
            <Txt f="mono" s={11} w={700} c={colors.textGhost}>
              {post.time}
            </Txt>
          </View>

          <Txt s={14} lh={1.6} c={colors.textBright}>
            {post.text}
          </Txt>

          {post.card ? (
            <Gradient colors={post.card.gradient} style={styles.postCard}>
              <Txt f="mono" s={10} w={700} ls={0.12} style={styles.cardKicker}>
                {post.card.kicker}
              </Txt>
              <Txt f="m" s={17} w={800} style={styles.cardTitle}>
                {post.card.title}
              </Txt>
              <Txt s={11.5} style={styles.cardSub}>
                {post.card.sub}
              </Txt>
            </Gradient>
          ) : null}

          <View style={styles.postFooter}>
            <Txt s={11.5} w={700} c={colors.textDim}>
              ♥ {post.likes}
            </Txt>
            <Txt s={11.5} w={700} c={colors.textDim}>
              💬 {post.comments}
            </Txt>
            <Txt f="m" s={11} w={800} c={colors.link} style={styles.cta}>
              {post.cta}
            </Txt>
          </View>
        </Press>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: alpha.w10,
    backgroundColor: alpha.w04,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: { flexDirection: 'row', gap: 7 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.panel,
    padding: 12,
  },
  share: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radii.pill },
  post: {
    gap: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.w08,
    borderRadius: radii.section,
    padding: 15,
  },
  postHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelTag: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 7,
    backgroundColor: 'rgba(34,211,238,.16)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,.32)',
  },
  postCard: {
    borderRadius: radii.input,
    padding: 14,
    borderWidth: 1,
    borderColor: alpha.w14,
  },
  cardKicker: { opacity: 0.8 },
  cardTitle: { marginTop: 4 },
  cardSub: { opacity: 0.8, marginTop: 2 },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 2 },
  cta: { marginLeft: 'auto' },
});
