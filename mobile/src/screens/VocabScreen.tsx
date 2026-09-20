import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press, PrimaryButton, GhostButton } from '../components/Buttons';
import { StatTile } from '../components/Surfaces';
import { ProgressBar } from '../components/Progress';
import { Waveform } from '../components/Waveform';
import { Txt } from '../components/Txt';
import { radii } from '../theme/tokens';
import { vocabOf } from '../content';
import { useApp } from '../state/AppContext';
import { useStudySession } from '../state/useStudySession';
import { useBack } from '../navigation/useGo';
import { primeVoices, speakLine, stopSpeech } from '../audio/speech';
import { wordClip } from '../audio/clips';
import { otherSenses } from '../content/senses';

/** 10 · Kelime — a word as a collectible object. */
export function VocabScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  useStudySession();
  const back = useBack('lesson');
  const { cefr, position, setPosition, fire, isSaved, toggleSavedWord, savedWords, award } =
    useApp();

  const deck = useMemo(() => vocabOf(cefr), [cefr]);
  // A level switch can leave the stored index past the end of a shorter deck:
  // C1 has 1.040 cards where B2 has 2.755.
  const index = Math.min(position('vocab', cefr), deck.length - 1);
  const card = deck[index];
  const saved = isSaved(card.id);
  const senses = useMemo(() => otherSenses(card.id), [card.id]);

  // Kelimeyi mi örnek cümleyi mi okuduğumuzu gösteriyor; dalga formu buna
  // göre yanıyor, yoksa iki düğme de aynı ölü süsü paylaşıyor.
  const [speaking, setSpeaking] = useState<'word' | 'example' | null>(null);

  useEffect(() => {
    primeVoices();
    return stopSpeech;
  }, []);

  // Karttan karta geçerken önceki kelimenin okunması sürmemeli.
  useEffect(() => {
    stopSpeech();
    setSpeaking(null);
  }, [card.id]);

  /*
    Kelimenin üretilmiş telaffuzu varsa o çalıyor, yoksa cihazın sesi okuyor.

    A1 ve A2'nin 2.335 kelimesi pakete gömülü; üstü cihazda kalıyor. Sebebi
    `content/build-audio.py` içinde ölçümüyle yazılı — hepsini gömmek +62 MB
    ve %34 daha büyük JS paketi demekti. Kelimeyi ilk kez duyan öğrenci için
    doğru telaffuz en çok alt seviyelerde önemli: B2 okuyan biri yanlış
    vurgulanmış bir kelimeyi fark eder, A1 okuyan onu doğru diye öğrenir.

    Örnek cümlenin kaydı yok; yalnızca kelimeler üretildi. O yüzden cümle
    her zaman cihaz sesinde.
  */
  const say = (what: 'word' | 'example', text: string) => {
    const clip = what === 'word' ? wordClip(card.cefr, card.id) : null;

    stopSpeech();
    setSpeaking(what);
    speakLine(text, {
      level: card.cefr,
      // 0.85 cihaz sesi içindi: tek bir kelimeyi normal hızda okuyunca
      // anlaşılmıyordu. Kayıtta gereksiz — zaten tane tane söylenmiş — ve
      // zararlı: hız çarpanı kaydı yavaşlatıp sesi bozuyor.
      speed: clip == null && what === 'word' ? 0.85 : 1,
      clip: clip ?? undefined,
      onDone: () => setSpeaking(null),
    });
  };

  const advance = () => setPosition('vocab', cefr, (index + 1) % deck.length);

  const onSave = () => {
    toggleSavedWord(card.id);
    fire(
      saved ? 'Kelime listeden çıktı' : `“${card.word}” kaydedildi`,
      saved ? 'Tekrar sırasından kaldırıldı' : 'Aralıklı tekrara eklendi',
    );
  };

  const onKnown = () => {
    award(10);
    fire('+10 XP', `“${card.word}” koleksiyonuna eklendi`);
    advance();
  };

  const onAgain = () => {
    fire('Tekrar sırasına alındı', '10 dakika içinde yeniden sorulacak');
    advance();
  };

  return (
    <Screen
      padTop={62}
      gap={14}
      footer={
        <View style={styles.actions}>
          <GhostButton
            label="Tekrar göster"
            height={52}
            radius={16}
            fill={t.alpha.w04}
            onPress={onAgain}
            style={styles.flex}
          />
          <PrimaryButton
            label="Biliyorum · +10 XP"
            height={52}
            radius={16}
            size={14.5}
            shadow={t.shadows.ctaBrandSmall}
            onPress={onKnown}
            style={styles.flexWide}
          />
        </View>
      }>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <ProgressBar
          pct={((index + 1) / deck.length) * 100}
          from={t.colors.secondary}
          to={t.colors.accent}
          style={styles.flex}
        />
        <Txt f="mono" s={12} w={700} c={t.colors.textDim}>
          {index + 1}/{deck.length}
        </Txt>
      </View>

      <Gradient deg={165} colors={[t.colors.surfaceNode, t.colors.surface]} style={styles.card}>
        <View style={styles.cardActions}>
          <Press
            onPress={onSave}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Kayıtlardan çıkar' : 'Kelimeyi kaydet'}
            style={[styles.iconBtn, saved ? styles.saved : styles.unsaved]}>
            <Txt s={15}>{saved ? '★' : '☆'}</Txt>
          </Press>
          <Press
            onPress={() => say('word', card.word)}
            accessibilityRole="button"
            accessibilityState={{ selected: speaking === 'word' }}
            accessibilityLabel={`“${card.word}” telaffuzunu dinle`}
            style={[styles.iconBtn, styles.audioBtn]}>
            <Txt s={15}>🔊</Txt>
          </Press>
        </View>

        <View style={styles.pos}>
          <Txt f="mono" s={10} w={700} c={t.colors.violetSoft} ls={0.1}>
            {card.cefr}
          </Txt>
        </View>

        <View>
          {/* Tür artık kelimenin hemen altında ve okunur boyutta.
              Köşedeki küçük etiketteyken kimse görmüyordu: test eden kişi
              "take" isim kartını fiil sanıp anlamı yanlış buldu. Aynı
              yazılışı paylaşan 956 kelime var, yani tür bu kartın kimliğinin
              yarısı — üçüncül bir bilgi değil. */}
          <Txt f="m" s={40} w={800} ls={-0.02}>
            {card.word}
          </Txt>
          <Txt f="m" s={13} w={700} c={t.colors.violetSoft} style={styles.posLine}>
            {card.posLabel.toLocaleLowerCase('tr-TR')}
          </Txt>
          <View style={styles.ipaRow}>
            {card.ipa ? (
              <Txt f="mono" s={14} w={600} c={t.colors.accentSoft}>
                {card.ipa}
              </Txt>
            ) : null}
            <Txt s={13} w={600} c={t.colors.textDim}>
              · {card.tr}
            </Txt>
          </View>
        </View>

        <Press
          onPress={() => say('word', card.word)}
          scale={0.99}
          accessibilityRole="button"
          accessibilityLabel={`“${card.word}” telaffuzunu dinle`}>
          <Waveform height={34} lit={speaking === 'word' ? 1 : 0} />
        </Press>

        <View style={styles.block}>
          <Txt f="mono" s={10} w={700} c={t.colors.textFaint} ls={0.1} style={styles.blockKicker}>
            TANIM
          </Txt>
          <Txt s={13.5} lh={1.5} c={t.colors.textBright}>
            {card.definition}
          </Txt>
        </View>

        {/* Aynı yazılışın başka anlamı varsa kartta söyleniyor.
            Gizlemek karışıklığı sürdürürdü; söylemek hem karışıklığı
            gideriyor hem ikinci anlamı öğretiyor. */}
        {senses.length ? (
          <View style={styles.senses}>
            <Txt f="mono" s={9.5} w={700} c={t.colors.textDisabled} ls={0.12}>
              AYNI YAZILIŞ, BAŞKA ANLAM
            </Txt>
            {senses.map((sense) => (
              <Txt
                key={`${sense.pos}-${sense.cefr}`}
                s={12.5}
                lh={1.5}
                c={t.colors.textDim}
                style={styles.senseRow}>
                <Txt f="m" s={12.5} w={700} c={t.colors.violetSoft}>
                  {sense.pos.toLocaleLowerCase('tr-TR')}
                </Txt>
                {`  ${sense.tr}  ·  ${sense.cefr}`}
              </Txt>
            ))}
          </View>
        ) : null}

        <View style={[styles.block, styles.exampleBlock]}>
          <Press
            onPress={() => say('example', card.example)}
            accessibilityRole="button"
            accessibilityState={{ selected: speaking === 'example' }}
            accessibilityLabel="Örnek cümleyi dinle"
            style={styles.blockKickerRow}>
            <Txt f="mono" s={10} w={700} c={t.colors.blueSoft} ls={0.1}>
              ÖRNEK
            </Txt>
            <Txt s={12}>🔊</Txt>
          </Press>
          <Example sentence={card.example} word={card.word} />
          <Txt s={12} c={t.colors.textDim} style={styles.exampleTr}>
            {card.exampleTr}
          </Txt>
        </View>
      </Gradient>

      <View style={styles.stats}>
        <StatTile value={String(savedWords.length)} label="kaydedilen kelime" tint={t.colors.accent} />
        <StatTile value={String(index + 1)} label="bu seviyede görülen" tint={t.colors.secondary} />
        <StatTile
          value={String(deck.length - index - 1)}
          label="kalan kart"
          tint={t.colors.warning}
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
  const t = useTheme();
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
      <Txt s={14} w={600} c={t.colors.accent}>
        {sentence.slice(at, at + word.length)}
      </Txt>
      {sentence.slice(at + word.length)}
    </Txt>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    flexWide: { flex: 1.4 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    card: {
      borderWidth: 1,
      borderColor: t.alpha.w10,
      borderRadius: radii.screen,
      padding: 20,
      gap: 14,
      boxShadow: t.shadows.card,
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
    saved: { backgroundColor: tint(t.colors.warning, 0.24), borderColor: t.colors.warning },
    unsaved: { backgroundColor: t.alpha.w06, borderColor: t.alpha.w12 },
    audioBtn: { backgroundColor: tint(t.colors.primary, 0.16), borderColor: tint(t.colors.primary, 0.35) },
    posLine: { marginTop: -2 },
    senses: {
      gap: 5,
      padding: 13,
      borderRadius: radii.input,
      borderWidth: 1,
      borderColor: tint(t.colors.secondary, 0.25),
      backgroundColor: tint(t.colors.secondary, 0.08),
    },
    senseRow: { marginTop: 1 },
    pos: {
      alignSelf: 'flex-start',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: radii.chipSm,
      backgroundColor: tint(t.colors.secondary, 0.18),
      borderWidth: 1,
      borderColor: tint(t.colors.secondary, 0.32),
    },
    ipaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
    block: { backgroundColor: t.alpha.w04, borderRadius: radii.input, padding: 13 },
    blockKicker: { marginBottom: 5 },
    blockKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
    exampleBlock: { backgroundColor: tint(t.colors.primary, 0.1) },
    exampleTr: { marginTop: 4 },
    actions: { flexDirection: 'row', gap: 10 },
    stats: { flexDirection: 'row', gap: 9 },
  });
