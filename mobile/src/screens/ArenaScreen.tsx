import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { bad, ok, tap } from '../audio/feel';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Glow } from '../components/Glow';
import { BackButton, Press } from '../components/Buttons';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { orbitFor, seats, wheelSize } from '../content/wheel';
import { font, radii } from '../theme/tokens';
import { ARENA } from '../data/play';
import { arenaRound } from '../content/arena';
import {
  clock,
  MODE_RULES,
  onMissed,
  onSkipped,
  onSolved,
  onTick,
  quitRound,
  rewardFor,
  startRound,
  summaryTitle,
  timePct,
} from '../content/arena-game';
import { useApp } from '../state/AppContext';
import { useBack } from '../navigation/useGo';

/** Tasarımın istediği çark. Harf sayısı sığmazsa `orbitFor` açıyor. */
const WHEEL = 280;
const ORBIT = 112;
const KEY = 50;

/** 17 · Harf Arenası — the signature game: build a word from the wheel. */
export function ArenaScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const back = useBack('play');
  const { cefr, fire, arenaMode, arenaSolved, arenaMissed, award } = useApp();

  const [picked, setPicked] = useState<number[]>([]);
  const [rotation, setRotation] = useState(0);
  const [round, setRound] = useState(0);

  /*
    Turun kendi durumu. Başlıkta eskiden ömür boyu XP duruyordu ve bu turun
    skoruymuş gibi görünüyordu; sayaç ise sabit bir metindi ("00:24"), yani
    süreli bir oyunun süresi hiç işlemiyordu.

    Ömür boyu sayaçlar (`game.arenaXp` vb.) hâlâ birikiyor — profil ve
    başarımlar onlardan besleniyor — ama ekranda bu turun sayıları var.
  */
  const [state, setState] = useState(() => startRound(arenaMode));

  // Mod değişince tur baştan kurulur. Play merkezinden başka bir modla
  // gelindiğinde eski turun kalan süresiyle oynanmamalı.
  useEffect(() => {
    setState(startRound(arenaMode));
    setPicked([]);
    setRound(0);
  }, [arenaMode]);

  // Saniye sayacı yalnızca süreli modda ve tur sürerken dönüyor.
  useEffect(() => {
    if (state.over || state.secondsLeft == null) return;
    const id = setInterval(() => setState(onTick), 1000);
    return () => clearInterval(id);
  }, [state.over, state.secondsLeft == null]);

  // The round is drawn from the learner's own level deck, so the arena drills
  // words they are actually meant to know. It is memoised because the wheel
  // must not reshuffle under the player's finger on every state change.
  const puzzle = useMemo(() => arenaRound(cefr, round), [cefr, round]);
  const rule = MODE_RULES[state.mode];

  const offset = rotation % puzzle.letters.length;
  const order = [...puzzle.letters.slice(offset), ...puzzle.letters.slice(0, offset)];
  const word = picked.map((i) => order[i]).join('');

  /*
    Harfler çemberde nereye oturuyor?

    Burada sabit 36 derece vardı — yani tam on harf varsayılıyordu. Bir tur
    9 ile 11 harf arasında değişiyor (5–7 harfli kelime + 4 tuzak): dokuzda
    çemberin bir dilimi boş kalıyor, on birde son harf ilkinin üstüne
    biniyordu. Üst üste binen iki harf, "harfler karmaşık geliyor"un kendisi.
  */
  const orbit = orbitFor(order.length, KEY, ORBIT);
  const wheelBox = Math.max(WHEEL, wheelSize(orbit, KEY));
  const koltuklar = seats(order.length, wheelBox / 2, orbit);
  const ready = word.length === puzzle.slots;

  /*
    Harfe dokunmak iki yönlü çalışıyor.

    Önce tek yönlüydü: seçilen harf kilitleniyordu ve kelime dolduğunda
    hiçbir harfe dokunulamıyordu. Son harfi yanlış koyan öğrencinin tek
    çaresi "Temizle" ile her şeye baştan başlamaktı — yedi harfli bir
    kelimede altı doğru harfi de silmek demek.

    Şimdi seçili bir harfe dokunmak onu kelimeden çıkarıyor. Kelime dolu
    olsa bile: çıkarmak her zaman serbest, yalnızca eklemek sınırlı.
  */
  const tapLetter = (index: number) => {
    const at = picked.indexOf(index);
    if (at !== -1) {
      tap();
      setPicked((p) => p.filter((_, i) => i !== at));
      return;
    }
    if (ready) return;
    tap();
    setPicked((p) => [...p, index]);
  };

  /** Son harfi geri alır. */
  const backspace = () => {
    if (!picked.length) return;
    tap();
    setPicked((p) => p.slice(0, -1));
  };

  /*
    Pas. Takıldığı kelimeyi geçemeyen öğrencinin iki seçeneği vardı: turu
    bırakmak ya da canını bilmediği bir kelimeye vermek. İkisi de oyunu
    öğretici olmaktan çıkarıyordu.

    Geçilen kelimenin cevabı gösteriliyor — pasın öğrettiği şey o.
  */
  const skip = () => {
    if (state.over) return;
    setState(onSkipped);
    setPicked([]);
    setRound((r) => r + 1);
    fire(`Cevap: ${puzzle.target}`, puzzle.tr);
  };

  const submit = () => {
    if (!ready || state.over) return;
    if (word === puzzle.target) {
      const gained = rewardFor(state);
      ok();
      setState(onSolved);
      arenaSolved(gained);
      award(gained);
      setPicked([]);
      setRound((r) => r + 1);
      fire(`${puzzle.target} · +${gained} XP`, 'Kombo büyüdü');
    } else {
      bad();
      setState(onMissed);
      arenaMissed();
      setPicked([]);
      fire(`“${word}” aradığımız kelime değil`, `Kombo sıfırlandı · ipucu: ${puzzle.tr}`);
    }
  };

  const again = () => {
    setState(startRound(arenaMode));
    setPicked([]);
    setRound((r) => r + 1);
  };

  return (
    <Screen
      scroll={false}
      padTop={58}
      padBottom={26}
      gap={12}
      glows={[
        {
          rx: 230,
          ry: 230,
          cx: 0.5,
          cy: 0.58,
          color: t.colors.primary,
          opacity: 0.26,
          stop: 0.66,
        },
        {
          rx: 150,
          ry: 130,
          cx: 0.82,
          cy: 0.14,
          color: t.colors.secondary,
          opacity: 0.22,
          stop: 0.64,
        },
      ]}>
      <View style={styles.header}>
        <BackButton
          onPress={() => (state.over ? back() : setState(quitRound))}
          size={36}
          strong
        />
        <View style={styles.timer}>
          <View style={styles.timerHead}>
            <Txt f="mono" s={font.caption} w={700} c={t.colors.textDim}>
              {rule.name.toLocaleUpperCase('tr-TR')}
            </Txt>
            {/* Süresiz modda sayaç yerine kalan hak yazıyor; ikisi de yoksa
                satır boş kalıyor. Olmayan bir sayacı "00:24" diye çizmek,
                oyuncuya var olmayan bir baskı hissettirmekti. */}
            {state.secondsLeft != null ? (
              <Txt f="mono" s={font.caption} w={700} c={t.colors.warningText}>
                {clock(state.secondsLeft)}
              </Txt>
            ) : state.livesLeft != null ? (
              <Txt f="mono" s={font.caption} w={700} c={t.colors.errorTint}>
                {'♥'.repeat(state.livesLeft)}
              </Txt>
            ) : null}
          </View>
          <ProgressBar
            pct={Math.round(timePct(state) * 100)}
            from={t.colors.warning}
            to={t.colors.error}
            track={t.alpha.w10}
          />
        </View>
        <View style={styles.xp}>
          <Txt f="m" s={font.headline} w={800} c={t.colors.accent}>
            {state.xp}
          </Txt>
          <Txt f="mono" s={font.label} w={600} c={t.colors.textGhost}>
            XP
          </Txt>
        </View>
      </View>

      <View style={styles.stats}>
        <ArenaStat label="KOMBO" value={`×${state.combo}`} tint={t.colors.violetSoft} />
        <ArenaStat label="SERİ" value={String(state.streak)} tint={t.colors.warningSoft} />
        {/* Eskiden "3/8" yazıyordu: sekiz kelimelik bir hedef hiç yoktu. */}
        <ArenaStat label="KELİME" value={String(state.found)} tint={t.colors.successSoft} />
      </View>

      <Gradient
        deg={180}
        colors={[tint(t.colors.raised, 0.9), tint(t.colors.surface, 0.9)]}
        style={styles.mission}>
        <Txt f="mono" s={font.label} w={700} c={t.colors.textFaint} ls={0.12}>
          GÖREV
        </Txt>
        <Txt f="m" s={font.title} w={700} lh={1.4} style={styles.missionText}>
          Türkçesi verilen
          <Txt f="m" s={font.title} w={700} c={t.colors.accent}>
            {puzzle.slots} harfli
          </Txt>
          kelimeyi kur
        </Txt>
      </Gradient>

      <View style={styles.slots}>
        {Array.from({ length: puzzle.slots }).map((_, i) => (
          <View
            key={i}
            style={[styles.slot, word[i] ? styles.slotFilled : styles.slotEmpty]}>
            <Txt f="mono" s={font.headline} w={700} c={word[i] ? t.colors.text : t.colors.textGhost}>
              {word[i] ?? ''}
            </Txt>
          </View>
        ))}
      </View>

      <View style={[styles.wheel, { width: wheelBox, height: wheelBox }]}>
        <View style={styles.wheelRing} pointerEvents="none" />
        <View style={styles.wheelRingInner} pointerEvents="none" />
        <View style={styles.wheelCore} pointerEvents="none">
          <Glow
            glows={[
              {
                rx: 52,
                ry: 52,
                cx: 0.5,
                cy: 0.5,
                color: t.colors.primary,
                opacity: 0.34,
                stop: 0.7,
              },
            ]}
          />
          {/* Ortada yalnızca ipucu var. Kurulan kelime zaten tekerleğin
              üstündeki kutularda duruyor; ikinci kez göstermek, göz için
              iki ayrı doğru kaynağı demekti.

              "ipucu:" küçük bir yazıydı ve okunmuyordu: test eden kişi
              içerideki metnin ipucu mu başka bir şey mi olduğunu
              anlayamadığını söyledi. Etiket ayrı satıra alındı. */}
          <View style={styles.wheelCoreText}>
            <Txt f="mono" s={font.label} w={700} c={t.colors.textDisabled} ls={0.16}>
              İPUCU
            </Txt>
            <Txt f="m" s={font.footnote} w={700} c={t.colors.blueSoft} style={styles.coreHint}>
              {puzzle.tr}
            </Txt>
          </View>
        </View>

        {order.map((letter, i) => {
          const seat = koltuklar[i];
          const selected = picked.includes(i);
          const position = { left: seat.x - KEY / 2, top: seat.y - KEY / 2 };

          if (selected) {
            // Seçili harf de bir düğme: dokunmak onu kelimeden çıkarıyor.
            // Önce salt görseldi ve "harf alınamıyor" hissini veren şey buydu.
            return (
              <Press
                key={`${letter}-${i}`}
                onPress={() => tapLetter(i)}
                scale={0.94}
                accessibilityRole="button"
                accessibilityLabel={`${letter} harfini çıkar`}
                style={position}>
                <Gradient colors={t.gradients.brand} style={[styles.key, styles.keyOn]}>
                  <Txt f="mono" s={font.headline} w={700} c={t.colors.onBrand}>
                    {letter}
                  </Txt>
                </Gradient>
              </Press>
            );
          }
          return (
            <Press
              key={`${letter}-${i}`}
              onPress={() => tapLetter(i)}
              scale={0.94}
              accessibilityRole="button"
              accessibilityLabel={`Harf ${letter}`}
              style={[styles.key, styles.keyOff, position]}>
              <Txt f="mono" s={font.headline} w={700}>
                {letter}
              </Txt>
            </Press>
          );
        })}
      </View>

      {/* Tur sonu. Oyunun bitebilmesi gerekiyordu: eskiden ne süre doluyor ne
          hak tükeniyordu, dolayısıyla skor diye bir kavram da yoktu. */}
      {state.over ? (
        <View style={styles.summary}>
          <Txt f="m" s={font.title} w={800}>
            {summaryTitle(state)}
          </Txt>
          <View style={styles.summaryRow}>
            <ArenaStat label="XP" value={String(state.xp)} tint={t.colors.accent} />
            <ArenaStat
              label="KELİME"
              value={String(state.found)}
              tint={t.colors.successSoft}
            />
            <ArenaStat
              label="EN UZUN SERİ"
              value={String(state.bestStreak)}
              tint={t.colors.warningSoft}
            />
          </View>
          <Txt s={font.caption} lh={1.5} c={t.colors.textFaint} style={styles.summaryNote}>
            Kazandığın XP günlük toplamına eklendi.
          </Txt>
          <View style={styles.summaryActions}>
            <Press onPress={back} style={[styles.actionBtn, styles.clear]}>
              <Txt f="m" s={font.body} w={700} c={t.colors.textSubtle}>
                Çık
              </Txt>
            </Press>
            <Press onPress={again} style={styles.submitWrap}>
              <Gradient colors={t.gradients.brand} style={styles.submit}>
                <Txt f="m" s={font.body} w={800} c={t.colors.onBrand}>
                  Tekrar oyna
                </Txt>
              </Gradient>
            </Press>
          </View>
        </View>
      ) : (
        <View style={styles.actionsWrap}>
          <View style={styles.actions}>
            {/* Geri al, temizlemenin yerini aldı. Yedi harfli bir kelimede
                son harfi düzeltmek için altı doğru harfi de silmek
                gerekiyordu. Uzun basmak hepsini siliyor. */}
            <Press
              onPress={backspace}
              onLongPress={() => setPicked([])}
              disabled={!picked.length}
              accessibilityRole="button"
              accessibilityLabel="Son harfi geri al"
              style={[styles.actionBtn, styles.clear, !picked.length && styles.actionOff]}>
              <Txt f="m" s={font.title} w={700} c={t.colors.textSubtle}>
                ⌫
              </Txt>
            </Press>

            <Press
              onPress={() => {
                setRotation((r) => r + 3);
                setPicked([]);
              }}
              accessibilityRole="button"
              accessibilityLabel="Harfleri karıştır"
              style={[styles.actionBtn, styles.shuffle]}>
              <Txt s={font.callout}>🔀</Txt>
            </Press>

            {/* Gönder düğmesi her zaman burada. Eskiden kelime dolmadan
                yerinde "Harf seç" yazan, düğmeye benzeyen ama basılamayan
                bir kutu duruyordu; test eden kişi ne işe yaradığını
                anlamadığını söyledi. Artık aynı düğme, kaç harf kaldığını
                söyleyerek bekliyor. */}
            <Press
              onPress={submit}
              disabled={!ready}
              accessibilityRole="button"
              accessibilityState={{ disabled: !ready }}
              style={styles.submitWrap}>
              {ready ? (
                <Gradient colors={t.gradients.brand} style={styles.submit}>
                  <Txt f="m" s={font.body} w={800} c={t.colors.onBrand}>
                    {ARENA.submitReady}
                  </Txt>
                </Gradient>
              ) : (
                <View style={[styles.submit, styles.submitIdle]}>
                  <Txt f="m" s={font.body} w={700} c={t.colors.textDisabled}>
                    {puzzle.slots - word.length} harf kaldı
                  </Txt>
                </View>
              )}
            </Press>
          </View>

          {/* Pas. Takılan öğrencinin tek çıkışı turu bırakmaktı. */}
          <Press onPress={skip} accessibilityRole="button" style={styles.skip}>
            <Txt f="m" s={font.footnote} w={700} c={t.colors.textFaint}>
              Bu kelimeyi geç →
            </Txt>
          </Press>
        </View>
      )}
    </Screen>
  );
}

function ArenaStat({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: string;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.stat}>
      <Txt f="mono" s={font.label} w={600} c={t.colors.textFaint} ls={0.1}>
        {label}
      </Txt>
      <Txt f="m" s={font.callout} w={800} c={tint}>
        {value}
      </Txt>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    timer: { flex: 1, gap: 6 },
    timerHead: { flexDirection: 'row', justifyContent: 'space-between' },
    xp: { alignItems: 'flex-end' },
    stats: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    stat: {
      flex: 1,
      backgroundColor: t.alpha.w04,
      borderWidth: 1,
      borderColor: t.alpha.w09,
      borderRadius: radii.card,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    mission: {
      borderWidth: 1,
      borderColor: t.alpha.w10,
      borderRadius: radii.tile,
      padding: 14,
      alignItems: 'center',
    },
    missionText: { marginTop: 6, textAlign: 'center' },
    slots: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 56,
    },
    slot: {
      width: 40,
      height: 48,
      borderRadius: radii.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    slotFilled: {
      backgroundColor: tint(t.colors.accent, 0.16),
      borderColor: tint(t.colors.accent, 0.45),
    },
    slotEmpty: {
      backgroundColor: t.alpha.w03,
      borderStyle: 'dashed',
      borderColor: t.alpha.w16,
    },
    wheel: { alignSelf: 'center' },
    wheelRing: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: WHEEL,
      borderWidth: 1.5,
      borderColor: t.alpha.w10,
    },
    wheelRingInner: {
      position: 'absolute',
      top: 34,
      left: 34,
      right: 34,
      bottom: 34,
      borderRadius: WHEEL,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: t.alpha.w12,
    },
    wheelCore: {
      position: 'absolute',
      top: 88,
      left: 88,
      right: 88,
      bottom: 88,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionsWrap: { gap: 8 },
    actionOff: { opacity: 0.4 },
    skip: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16 },
    wheelCoreText: { alignItems: 'center' },
    coreHint: { marginTop: 2 },
    key: {
      position: 'absolute',
      width: KEY,
      height: KEY,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    keyOn: {
      borderColor: t.alpha.w30,
      transform: [{ scale: 1.06 }],
      boxShadow: t.shadows.keyLift,
    },
    keyOff: { backgroundColor: t.alpha.w06, borderColor: t.alpha.w14 },
    actions: { flexDirection: 'row', gap: 10, marginTop: 'auto' },
    summary: {
      marginTop: 'auto',
      gap: 10,
      padding: 16,
      borderRadius: radii.section,
      borderWidth: 1,
      borderColor: t.alpha.w12,
      backgroundColor: tint(t.colors.surface, 0.96),
      alignItems: 'center',
    },
    summaryRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
    summaryNote: { textAlign: 'center' },
    summaryActions: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
    actionBtn: {
      height: 50,
      borderRadius: radii.input,
      borderWidth: 1,
      borderColor: t.alpha.w12,
      backgroundColor: t.alpha.w04,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clear: { flex: 1 },
    shuffle: { width: 56 },
    submitWrap: { flex: 1.4 },
    submit: {
      height: 50,
      borderRadius: radii.input,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: t.shadows.ctaBrandSmall,
    },
    // `submit` zaten yüksekliği ve hizayı veriyor; burası yalnızca zemini
    // değiştiriyor. İkisini de tanımlamak, birini değiştirince diğerinin
    // geride kalması demekti.
    submitIdle: { backgroundColor: t.alpha.w06 },
  });
