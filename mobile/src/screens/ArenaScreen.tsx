import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { bad, ok, tap } from '../audio/feel';
import { Screen } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { Glow } from '../components/Glow';
import { BackButton, Press } from '../components/Buttons';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii, shadows } from '../theme/tokens';
import { ARENA } from '../data/play';
import { arenaRound } from '../content/arena';
import {
  clock,
  MODE_RULES,
  onMissed,
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

const WHEEL = 280;
const CENTER = WHEEL / 2;
const ORBIT = 112;
const KEY = 50;

/** 17 · Harf Arenası — the signature game: build a word from the wheel. */
export function ArenaScreen() {
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
  const ready = word.length === puzzle.slots;

  const tapLetter = (index: number) => {
    if (picked.includes(index) || ready) return;
    tap();
    setPicked((p) => [...p, index]);
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
          color: colors.primary,
          opacity: 0.26,
          stop: 0.66,
        },
        {
          rx: 150,
          ry: 130,
          cx: 0.82,
          cy: 0.14,
          color: colors.secondary,
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
            <Txt f="mono" s={11} w={700} c={colors.textDim}>
              {rule.name.toLocaleUpperCase('tr-TR')}
            </Txt>
            {/* Süresiz modda sayaç yerine kalan hak yazıyor; ikisi de yoksa
                satır boş kalıyor. Olmayan bir sayacı "00:24" diye çizmek,
                oyuncuya var olmayan bir baskı hissettirmekti. */}
            {state.secondsLeft != null ? (
              <Txt f="mono" s={11} w={700} c={colors.warningText}>
                {clock(state.secondsLeft)}
              </Txt>
            ) : state.livesLeft != null ? (
              <Txt f="mono" s={11} w={700} c={colors.errorTint}>
                {'♥'.repeat(state.livesLeft)}
              </Txt>
            ) : null}
          </View>
          <ProgressBar
            pct={Math.round(timePct(state) * 100)}
            from={colors.warning}
            to={colors.error}
            track={alpha.w10}
          />
        </View>
        <View style={styles.xp}>
          <Txt f="m" s={20} w={800} c={colors.accent}>
            {state.xp}
          </Txt>
          <Txt f="mono" s={9.5} w={600} c={colors.textGhost}>
            XP
          </Txt>
        </View>
      </View>

      <View style={styles.stats}>
        <ArenaStat label="KOMBO" value={`×${state.combo}`} tint={colors.violetSoft} />
        <ArenaStat label="SERİ" value={String(state.streak)} tint={colors.warningSoft} />
        {/* Eskiden "3/8" yazıyordu: sekiz kelimelik bir hedef hiç yoktu. */}
        <ArenaStat label="KELİME" value={String(state.found)} tint={colors.successSoft} />
      </View>

      <Gradient
        deg={180}
        colors={['rgba(18,26,49,.9)', 'rgba(14,20,38,.9)']}
        style={styles.mission}>
        <Txt f="mono" s={10} w={700} c={colors.textFaint} ls={0.12}>
          GÖREV
        </Txt>
        <Txt f="m" s={16.5} w={700} lh={1.4} style={styles.missionText}>
          Türkçesi verilen
          <Txt f="m" s={16.5} w={700} c={colors.accent}>
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
            <Txt f="m" s={20} w={800} c={word[i] ? colors.text : colors.textGhost}>
              {word[i] ?? ''}
            </Txt>
          </View>
        ))}
      </View>

      <View style={styles.wheel}>
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
                color: colors.primary,
                opacity: 0.34,
                stop: 0.7,
              },
            ]}
          />
          <View style={styles.wheelCoreText}>
            <Txt f="m" s={15} w={800}>
              {word || `${puzzle.slots} HARF`}
            </Txt>
            <Txt f="mono" s={10} w={600} c={colors.blueSoft} style={styles.coreHint}>
              {word
                ? ready
                  ? ARENA.readyHint
                  : `${word.length}/${puzzle.slots} harf`
                : `ipucu: ${puzzle.tr}`}
            </Txt>
          </View>
        </View>

        {order.map((letter, i) => {
          const a = ((-90 + i * 36) * Math.PI) / 180;
          const x = CENTER + ORBIT * Math.cos(a);
          const y = CENTER + ORBIT * Math.sin(a);
          const selected = picked.includes(i);
          const position = { left: x - KEY / 2, top: y - KEY / 2 };

          if (selected) {
            return (
              <Gradient
                key={`${letter}-${i}`}
                colors={gradients.brand}
                style={[styles.key, styles.keyOn, position]}>
                <Txt f="m" s={19} w={800}>
                  {letter}
                </Txt>
              </Gradient>
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
              <Txt f="m" s={19} w={800}>
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
          <Txt f="m" s={17} w={800}>
            {summaryTitle(state)}
          </Txt>
          <View style={styles.summaryRow}>
            <ArenaStat label="XP" value={String(state.xp)} tint={colors.accent} />
            <ArenaStat
              label="KELİME"
              value={String(state.found)}
              tint={colors.successSoft}
            />
            <ArenaStat
              label="EN UZUN SERİ"
              value={String(state.bestStreak)}
              tint={colors.warningSoft}
            />
          </View>
          <Txt s={11.5} lh={1.5} c={colors.textFaint} style={styles.summaryNote}>
            Kazandığın XP günlük toplamına eklendi.
          </Txt>
          <View style={styles.summaryActions}>
            <Press onPress={back} style={[styles.actionBtn, styles.clear]}>
              <Txt f="m" s={13.5} w={700} c={colors.textSubtle}>
                Çık
              </Txt>
            </Press>
            <Press onPress={again} style={styles.submitWrap}>
              <Gradient colors={gradients.brand} style={styles.submit}>
                <Txt f="m" s={14.5} w={800}>
                  Tekrar oyna
                </Txt>
              </Gradient>
            </Press>
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <Press onPress={() => setPicked([])} style={[styles.actionBtn, styles.clear]}>
            <Txt f="m" s={13.5} w={700} c={colors.textSubtle}>
              Temizle
            </Txt>
          </Press>
          <Press
            onPress={() => {
              setRotation((r) => r + 3);
              setPicked([]);
            }}
            accessibilityLabel="Harfleri karıştır"
            style={[styles.actionBtn, styles.shuffle]}>
            <Txt s={16}>🔀</Txt>
          </Press>
          {ready ? (
            <Press onPress={submit} style={styles.submitWrap}>
              <Gradient colors={gradients.brand} style={styles.submit}>
                <Txt f="m" s={14.5} w={800}>
                  {ARENA.submitReady}
                </Txt>
              </Gradient>
            </Press>
          ) : (
            <View style={[styles.submitWrap, styles.submitIdle]}>
              <Txt f="m" s={14.5} w={800} c={colors.textDisabled}>
                {ARENA.submitIdle}
              </Txt>
            </View>
          )}
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
  return (
    <View style={styles.stat}>
      <Txt f="mono" s={9.5} w={600} c={colors.textFaint} ls={0.1}>
        {label}
      </Txt>
      <Txt f="m" s={16} w={800} c={tint}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timer: { flex: 1, gap: 5 },
  timerHead: { flexDirection: 'row', justifyContent: 'space-between' },
  xp: { alignItems: 'flex-end' },
  stats: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  stat: {
    flex: 1,
    backgroundColor: alpha.w04,
    borderWidth: 1,
    borderColor: alpha.w09,
    borderRadius: radii.card,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  mission: {
    borderWidth: 1,
    borderColor: alpha.w10,
    borderRadius: radii.tile,
    padding: 14,
    alignItems: 'center',
  },
  missionText: { marginTop: 5, textAlign: 'center' },
  slots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
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
    backgroundColor: 'rgba(34,211,238,.16)',
    borderColor: 'rgba(34,211,238,.45)',
  },
  slotEmpty: {
    backgroundColor: alpha.w03,
    borderStyle: 'dashed',
    borderColor: alpha.w16,
  },
  wheel: { width: WHEEL, height: WHEEL, alignSelf: 'center' },
  wheelRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: CENTER,
    borderWidth: 1.5,
    borderColor: alpha.w10,
  },
  wheelRingInner: {
    position: 'absolute',
    top: 34,
    left: 34,
    right: 34,
    bottom: 34,
    borderRadius: CENTER,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: alpha.w12,
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
    borderColor: alpha.w30,
    transform: [{ scale: 1.06 }],
    boxShadow: '0px 10px 24px rgba(46,107,255,.5)',
  },
  keyOff: { backgroundColor: alpha.w06, borderColor: alpha.w14 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 'auto' },
  summary: {
    marginTop: 'auto',
    gap: 10,
    padding: 16,
    borderRadius: radii.section,
    borderWidth: 1,
    borderColor: alpha.w12,
    backgroundColor: 'rgba(14,20,38,.96)',
    alignItems: 'center',
  },
  summaryRow: { flexDirection: 'row', gap: 9, alignSelf: 'stretch' },
  summaryNote: { textAlign: 'center' },
  summaryActions: { flexDirection: 'row', gap: 9, alignSelf: 'stretch' },
  actionBtn: {
    height: 50,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: alpha.w12,
    backgroundColor: alpha.w04,
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
    boxShadow: shadows.ctaBrandSmall,
  },
  submitIdle: {
    height: 50,
    borderRadius: radii.input,
    backgroundColor: alpha.w06,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
