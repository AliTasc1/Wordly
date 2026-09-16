import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press, PrimaryButton, GhostButton } from '../components/Buttons';
import { StatTile } from '../components/Surfaces';
import { ProgressBar } from '../components/Progress';
import { Waveform } from '../components/Waveform';
import { Txt } from '../components/Txt';
import { alpha, colors, radii, shadows } from '../theme/tokens';
import { WORD_CARD } from '../data/vocab';
import { useApp } from '../state/AppContext';
import { useBack } from '../navigation/useGo';

/** 10 · Kelime — a word as a collectible object. */
export function VocabScreen() {
  const back = useBack('lesson');
  const { fire, savedWord, toggleSavedWord } = useApp();
  const t = WORD_CARD.toasts;

  const onSave = () => {
    toggleSavedWord();
    const next = savedWord ? t.unsaved : t.saved;
    fire(next.title, next.note);
  };

  return (
    <Screen padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <ProgressBar
          pct={WORD_CARD.progress}
          from={colors.secondary}
          to={colors.accent}
          style={styles.flex}
        />
        <Txt f="mono" s={12} w={700} c={colors.textDim}>
          {WORD_CARD.index}
        </Txt>
      </View>

      <Gradient deg={165} colors={[colors.surfaceNode, colors.surface]} style={styles.card}>
        <View style={styles.cardActions}>
          <Press
            onPress={onSave}
            accessibilityRole="button"
            accessibilityLabel={savedWord ? 'Kayıtlardan çıkar' : 'Kelimeyi kaydet'}
            style={[styles.iconBtn, savedWord ? styles.saved : styles.unsaved]}>
            <Txt s={15}>{savedWord ? '★' : '☆'}</Txt>
          </Press>
          <Press
            onPress={() => fire(t.audio.title, t.audio.note)}
            accessibilityRole="button"
            accessibilityLabel="Telaffuzu dinle"
            style={[styles.iconBtn, styles.audioBtn]}>
            <Txt s={15}>🔊</Txt>
          </Press>
        </View>

        <View style={styles.pos}>
          <Txt f="mono" s={10} w={700} c={colors.violetSoft} ls={0.1}>
            {WORD_CARD.pos}
          </Txt>
        </View>

        <View>
          <Txt f="m" s={40} w={800} ls={-0.02}>
            {WORD_CARD.word}
          </Txt>
          <View style={styles.ipaRow}>
            <Txt f="mono" s={14} w={600} c={colors.accentSoft}>
              {WORD_CARD.ipa}
            </Txt>
            <Txt s={13} w={600} c={colors.textDim}>
              {WORD_CARD.translation}
            </Txt>
          </View>
        </View>

        <Waveform height={34} />

        <View style={styles.block}>
          <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.1} style={styles.blockKicker}>
            TANIM
          </Txt>
          <Txt s={13.5} lh={1.5} c={colors.textBright}>
            {WORD_CARD.definition}
          </Txt>
        </View>

        <View style={[styles.block, styles.exampleBlock]}>
          <Txt f="mono" s={10} w={700} c={colors.blueSoft} ls={0.1} style={styles.blockKicker}>
            ÖRNEK
          </Txt>
          <Txt s={14} w={600} lh={1.5}>
            {WORD_CARD.example.before}
            <Txt s={14} w={600} c={colors.accent}>
              {WORD_CARD.example.highlight}
            </Txt>
            {WORD_CARD.example.after}
          </Txt>
          <Txt s={12} c={colors.textDim} style={styles.exampleTr}>
            {WORD_CARD.example.translation}
          </Txt>
        </View>

        <View style={styles.relations}>
          <RelationRow label="EŞ ANLAM" items={WORD_CARD.synonyms} tone="success" />
          <RelationRow label="ZIT ANLAM" items={WORD_CARD.antonyms} tone="error" />
          <RelationRow label="BİRLİKTE" items={WORD_CARD.collocations} tone="neutral" />
        </View>

        <View style={styles.mastery}>
          <Txt s={11} w={700} c={colors.textDim}>
            Ustalık
          </Txt>
          <ProgressBar
            pct={WORD_CARD.mastery}
            from={colors.success}
            to={colors.accent}
            height={7}
            style={styles.flex}
          />
          <Txt f="m" s={13} w={800} c={colors.successSoft}>
            %{WORD_CARD.mastery}
          </Txt>
        </View>
      </Gradient>

      <View style={styles.actions}>
        <GhostButton
          label="Tekrar göster"
          height={52}
          radius={16}
          fill={alpha.w04}
          onPress={() => fire(t.again.title, t.again.note)}
          style={styles.flex}
        />
        <PrimaryButton
          label="Biliyorum · +10 XP"
          height={52}
          radius={16}
          size={14.5}
          shadow={shadows.ctaBrandSmall}
          onPress={() => fire(t.known.title, t.known.note)}
          style={styles.flexWide}
        />
      </View>

      <View style={styles.stats}>
        {WORD_CARD.stats.map((s, i) => (
          <StatTile
            key={s.label}
            value={s.value}
            label={s.label}
            tint={[colors.accent, colors.secondary, colors.warning][i]}
          />
        ))}
      </View>
    </Screen>
  );
}

function RelationRow({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: 'success' | 'error' | 'neutral';
}) {
  const style =
    tone === 'success'
      ? { bg: 'rgba(34,197,94,.12)', border: 'rgba(34,197,94,.26)', color: colors.mintSoft }
      : tone === 'error'
        ? { bg: 'rgba(255,77,94,.12)', border: 'rgba(255,77,94,.26)', color: colors.errorTint }
        : { bg: alpha.w06, border: alpha.w10, color: colors.textSubtle };

  return (
    <View style={styles.relationRow}>
      <Txt f="mono" s={10} w={700} c={colors.textFaint} style={styles.relationLabel}>
        {label}
      </Txt>
      <View style={styles.relationItems}>
        {items.map((item) => (
          <View
            key={item}
            style={[styles.relationChip, { backgroundColor: style.bg, borderColor: style.border }]}>
            <Txt s={11.5} w={600} c={style.color}>
              {item}
            </Txt>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexWide: { flex: 1.4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: alpha.w10,
    borderRadius: radii.screen,
    padding: 20,
    gap: 14,
    boxShadow: shadows.card,
  },
  cardActions: { position: 'absolute', top: 14, right: 16, flexDirection: 'row', gap: 8, zIndex: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saved: { backgroundColor: 'rgba(245,165,36,.24)', borderColor: colors.warning },
  unsaved: { backgroundColor: alpha.w06, borderColor: alpha.w12 },
  audioBtn: { backgroundColor: 'rgba(46,107,255,.16)', borderColor: 'rgba(46,107,255,.35)' },
  pos: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.chipSm,
    backgroundColor: 'rgba(124,92,255,.18)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,.32)',
  },
  ipaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
  block: { backgroundColor: alpha.w04, borderRadius: radii.input, padding: 13 },
  blockKicker: { marginBottom: 5 },
  exampleBlock: { backgroundColor: 'rgba(46,107,255,.1)' },
  exampleTr: { marginTop: 4 },
  relations: { gap: 8 },
  relationRow: { flexDirection: 'row', gap: 7, alignItems: 'flex-start' },
  relationLabel: { width: 74, paddingTop: 5 },
  relationItems: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  relationChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.chipSm,
    borderWidth: 1,
  },
  mastery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: alpha.w04,
    borderRadius: radii.card,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  actions: { flexDirection: 'row', gap: 10 },
  stats: { flexDirection: 'row', gap: 9 },
});
