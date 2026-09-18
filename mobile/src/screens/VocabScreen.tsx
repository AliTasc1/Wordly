import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press, PrimaryButton, GhostButton } from '../components/Buttons';
import { StatTile } from '../components/Surfaces';
import { ProgressBar } from '../components/Progress';
import { Waveform } from '../components/Waveform';
import { Txt } from '../components/Txt';
import { alpha, colors, radii, shadows } from '../theme/tokens';
import { vocabOf } from '../content';
import { useApp } from '../state/AppContext';
import { useBack } from '../navigation/useGo';

/** 10 · Kelime — a word as a collectible object. */
export function VocabScreen() {
  const back = useBack('lesson');
  const { cefr, position, setPosition, fire, isSaved, toggleSavedWord, savedWords } = useApp();

  const deck = useMemo(() => vocabOf(cefr), [cefr]);
  // A level switch can leave the stored index past the end of a shorter deck:
  // C1 has 1.040 cards where B2 has 2.755.
  const index = Math.min(position('vocab', cefr), deck.length - 1);
  const card = deck[index];
  const saved = isSaved(card.id);

  const advance = () => setPosition('vocab', cefr, (index + 1) % deck.length);

  const onSave = () => {
    toggleSavedWord(card.id);
    fire(
      saved ? 'Kelime listeden çıktı' : `“${card.word}” kaydedildi`,
      saved ? 'Tekrar sırasından kaldırıldı' : 'Aralıklı tekrara eklendi',
    );
  };

  const onKnown = () => {
    fire('+10 XP', `“${card.word}” koleksiyonuna eklendi`);
    advance();
  };

  const onAgain = () => {
    fire('Tekrar sırasına alındı', '10 dakika içinde yeniden sorulacak');
    advance();
  };

  return (
    <Screen padTop={62} gap={14}>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <ProgressBar
          pct={((index + 1) / deck.length) * 100}
          from={colors.secondary}
          to={colors.accent}
          style={styles.flex}
        />
        <Txt f="mono" s={12} w={700} c={colors.textDim}>
          {index + 1}/{deck.length}
        </Txt>
      </View>

      <Gradient deg={165} colors={[colors.surfaceNode, colors.surface]} style={styles.card}>
        <View style={styles.cardActions}>
          <Press
            onPress={onSave}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Kayıtlardan çıkar' : 'Kelimeyi kaydet'}
            style={[styles.iconBtn, saved ? styles.saved : styles.unsaved]}>
            <Txt s={15}>{saved ? '★' : '☆'}</Txt>
          </Press>
          <Press
            onPress={() => fire(`🔊 ${card.ipa ?? card.word}`, 'Telaffuz oynatılıyor · 0.75× dene')}
            accessibilityRole="button"
            accessibilityLabel="Telaffuzu dinle"
            style={[styles.iconBtn, styles.audioBtn]}>
            <Txt s={15}>🔊</Txt>
          </Press>
        </View>

        <View style={styles.pos}>
          <Txt f="mono" s={10} w={700} c={colors.violetSoft} ls={0.1}>
            {card.posLabel} · {card.cefr}
          </Txt>
        </View>

        <View>
          <Txt f="m" s={40} w={800} ls={-0.02}>
            {card.word}
          </Txt>
          <View style={styles.ipaRow}>
            {card.ipa ? (
              <Txt f="mono" s={14} w={600} c={colors.accentSoft}>
                {card.ipa}
              </Txt>
            ) : null}
            <Txt s={13} w={600} c={colors.textDim}>
              · {card.tr}
            </Txt>
          </View>
        </View>

        <Waveform height={34} />

        <View style={styles.block}>
          <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.1} style={styles.blockKicker}>
            TANIM
          </Txt>
          <Txt s={13.5} lh={1.5} c={colors.textBright}>
            {card.definition}
          </Txt>
        </View>

        <View style={[styles.block, styles.exampleBlock]}>
          <Txt f="mono" s={10} w={700} c={colors.blueSoft} ls={0.1} style={styles.blockKicker}>
            ÖRNEK
          </Txt>
          <Example sentence={card.example} word={card.word} />
          <Txt s={12} c={colors.textDim} style={styles.exampleTr}>
            {card.exampleTr}
          </Txt>
        </View>
      </Gradient>

      <View style={styles.actions}>
        <GhostButton
          label="Tekrar göster"
          height={52}
          radius={16}
          fill={alpha.w04}
          onPress={onAgain}
          style={styles.flex}
        />
        <PrimaryButton
          label="Biliyorum · +10 XP"
          height={52}
          radius={16}
          size={14.5}
          shadow={shadows.ctaBrandSmall}
          onPress={onKnown}
          style={styles.flexWide}
        />
      </View>

      <View style={styles.stats}>
        <StatTile value={String(savedWords.length)} label="kaydedilen kelime" tint={colors.accent} />
        <StatTile value={String(index + 1)} label="bu seviyede görülen" tint={colors.secondary} />
        <StatTile
          value={String(deck.length - index - 1)}
          label="kalan kart"
          tint={colors.warning}
        />
      </View>
    </Screen>
  );
}

/**
 * Highlights the head word inside its example sentence. The content files hold
 * one plain sentence rather than pre-split before/after parts, so the split
 * happens here — case-insensitively, since a sentence may open with the word.
 */
function Example({ sentence, word }: { sentence: string; word: string }) {
  const at = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (at < 0) {
    return (
      <Txt s={14} w={600} lh={1.5}>
        {sentence}
      </Txt>
    );
  }
  return (
    <Txt s={14} w={600} lh={1.5}>
      {sentence.slice(0, at)}
      <Txt s={14} w={600} c={colors.accent}>
        {sentence.slice(at, at + word.length)}
      </Txt>
      {sentence.slice(at + word.length)}
    </Txt>
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
  actions: { flexDirection: 'row', gap: 10 },
  stats: { flexDirection: 'row', gap: 9 },
});
