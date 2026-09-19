import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clock,
  MAX_COMBO,
  MODE_RULES,
  onMissed,
  onSolved,
  onTick,
  quitRound,
  rewardFor,
  startRound,
  summaryTitle,
  timePct,
  type ArenaMode,
} from './arena-game';

/**
 * Arena tur kurallarının sınavı.
 *
 * Arena bugüne kadar oyun değildi: "00:24" sabit bir metindi, süre hiç
 * işlemiyordu ve "3 hata hakkın var" diyen mod hatayı saymıyordu. Bu testler
 * kuralların gerçekten uygulandığını sabitliyor.
 */

function play(mode: ArenaMode, moves: ('ok' | 'miss' | 'tick')[]) {
  let state = startRound(mode);
  for (const move of moves) {
    if (move === 'ok') state = onSolved(state);
    else if (move === 'miss') state = onMissed(state);
    else state = onTick(state);
  }
  return state;
}

// ------------------------------------------------------------------ başlangıç

test('süre atağı altmış saniyeyle başlar', () => {
  const state = startRound('time');
  assert.equal(state.secondsLeft, 60);
  assert.equal(state.livesLeft, null);
});

test('hayatta kalma üç hakla başlar, süresi yok', () => {
  const state = startRound('survival');
  assert.equal(state.livesLeft, 3);
  assert.equal(state.secondsLeft, null);
});

test('solo modda ne süre ne hak sınırı var', () => {
  const state = startRound('solo');
  assert.equal(state.secondsLeft, null);
  assert.equal(state.livesLeft, null);
});

test('tur sıfır skorla başlar', () => {
  // Başlıkta ömür boyu XP gösteriliyordu ve bu turun skoruymuş gibi
  // duruyordu: ilk kelimeden önce binlerce puanla başlamış görünüyordun.
  const state = startRound('time');
  assert.equal(state.xp, 0);
  assert.equal(state.found, 0);
  assert.equal(state.combo, 1);
});

// ---------------------------------------------------------------------- süre

test('her saniye sayaçtan düşer', () => {
  assert.equal(play('time', ['tick', 'tick', 'tick']).secondsLeft, 57);
});

test('süre bitince tur biter', () => {
  const state = play('time', Array(60).fill('tick'));
  assert.equal(state.secondsLeft, 0);
  assert.equal(state.over, true);
  assert.equal(state.reason, 'time');
});

test('sayaç eksiye düşmez', () => {
  const state = play('time', Array(70).fill('tick'));
  assert.equal(state.secondsLeft, 0);
});

test('süresiz modda sayaç işlemez', () => {
  const state = play('solo', Array(100).fill('tick'));
  assert.equal(state.secondsLeft, null);
  assert.equal(state.over, false);
});

test('tur bittikten sonra hamleler sayılmaz', () => {
  const ended = play('time', Array(60).fill('tick'));
  const after = onSolved(onMissed(ended));
  assert.equal(after.found, 0);
  assert.equal(after.missed, 0);
});

// ---------------------------------------------------------------------- hak

test('her hata bir hak götürür', () => {
  assert.equal(play('survival', ['miss']).livesLeft, 2);
});

test('haklar bitince tur biter', () => {
  const state = play('survival', ['miss', 'miss', 'miss']);
  assert.equal(state.livesLeft, 0);
  assert.equal(state.over, true);
  assert.equal(state.reason, 'lives');
});

test('üçüncü hatadan önce tur sürer', () => {
  assert.equal(play('survival', ['miss', 'miss']).over, false);
});

test('sınırsız modda hata turu bitirmez', () => {
  const state = play('solo', ['miss', 'miss', 'miss', 'miss', 'miss']);
  assert.equal(state.over, false);
  assert.equal(state.missed, 5);
});

// -------------------------------------------------------------------- kombo

test('her doğru komboyu büyütür', () => {
  assert.equal(play('solo', ['ok', 'ok']).combo, 3);
});

test('kombo üst sınırda durur', () => {
  const state = play('solo', Array(20).fill('ok'));
  assert.equal(state.combo, MAX_COMBO);
});

test('hata komboyu sıfırlar', () => {
  assert.equal(play('solo', ['ok', 'ok', 'miss']).combo, 1);
});

test('kombo XP çarpanı olarak işliyor', () => {
  // İlk kelime kombo 1 ile, ikincisi kombo 2 ile ödüllendirilir.
  const first = startRound('solo');
  const second = onSolved(first);
  assert.equal(rewardFor(second), rewardFor(first) * 2);
});

test('süre atağı iki kat XP veriyor', () => {
  assert.equal(rewardFor(startRound('time')), rewardFor(startRound('solo')) * 2);
  assert.equal(MODE_RULES.time.multiplier, 2);
});

test('XP tur boyunca birikir', () => {
  const state = play('solo', ['ok', 'ok', 'ok']);
  // 50×1 + 50×2 + 50×3
  assert.equal(state.xp, 300);
});

// -------------------------------------------------------------------- seri

test('en uzun seri hatadan sonra da korunur', () => {
  const state = play('solo', ['ok', 'ok', 'ok', 'miss', 'ok']);
  assert.equal(state.bestStreak, 3);
  assert.equal(state.streak, 1);
});

// ------------------------------------------------------------------- bırakma

test('erken bitirmek turu kapatır', () => {
  const state = quitRound(play('solo', ['ok']));
  assert.equal(state.over, true);
  assert.equal(state.reason, 'quit');
});

test('biten tur tekrar bırakılamaz', () => {
  const ended = play('time', Array(60).fill('tick'));
  assert.equal(quitRound(ended).reason, 'time');
});

// -------------------------------------------------------------------- sunum

test('sayaç iki haneli yazılır', () => {
  assert.equal(clock(7), '00:07');
  assert.equal(clock(60), '01:00');
  assert.equal(clock(95), '01:35');
});

test('eksi saniye sıfır gösterilir', () => {
  assert.equal(clock(-5), '00:00');
});

test('süre oranı bire yakın başlar, sıfırda biter', () => {
  assert.equal(timePct(startRound('time')), 1);
  assert.equal(timePct(play('time', Array(60).fill('tick'))), 0);
  assert.equal(timePct(play('time', Array(30).fill('tick'))), 0.5);
});

test('süresiz modda süre oranı sıfır', () => {
  assert.equal(timePct(startRound('solo')), 0);
});

test('boş tur kutlanmıyor', () => {
  // "Harika!" demek, öğrenciye yapmadığı bir şey için iltifat etmektir.
  const state = play('time', Array(60).fill('tick'));
  assert.equal(summaryTitle(state), 'Bu tur boş geçti');
});

test('tur sonu sebebi doğru yazılıyor', () => {
  assert.equal(
    summaryTitle(play('time', ['ok', ...Array(60).fill('tick')])),
    'Süre doldu',
  );
  assert.equal(
    summaryTitle(play('survival', ['ok', 'miss', 'miss', 'miss'])),
    'Hakların bitti',
  );
  assert.equal(summaryTitle(quitRound(play('solo', ['ok']))), 'Tur bitti');
});
