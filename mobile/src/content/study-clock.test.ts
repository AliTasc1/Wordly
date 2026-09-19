import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IDLE_MS, shouldCount } from './study-clock';

const NOW = 1_700_000_000_000;

function opts(over: Partial<Parameters<typeof shouldCount>[0]> = {}) {
  return { focused: true, appActive: true, now: NOW, activityAt: NOW, ...over };
}

test('odakta ve önde, az önce hareket varsa sayıyor', () => {
  assert.equal(shouldCount(opts()), true);
});

test('uygulama arka plandayken saymıyor', () => {
  // Telefon cebe girdiğinde saat işlemeye devam etseydi, akşam "bugün
  // 4 saat çalıştın" yazardı.
  assert.equal(shouldCount(opts({ appActive: false })), false);
});

test('ekran odakta değilken saymıyor', () => {
  assert.equal(shouldCount(opts({ focused: false })), false);
});

test('hareketsizlik sınırına kadar sayıyor, sonra kesiyor', () => {
  assert.equal(shouldCount(opts({ activityAt: NOW - IDLE_MS })), true);
  assert.equal(shouldCount(opts({ activityAt: NOW - IDLE_MS - 1 })), false);
});

test('uygulamayı açık unutan kişiye süre yazılmıyor', () => {
  const birSaat = 60 * 60 * 1000;
  assert.equal(shouldCount(opts({ activityAt: NOW - birSaat })), false);
});

test('hareketsizlik tek başına yetmiyor — önde de olmalı', () => {
  assert.equal(shouldCount(opts({ appActive: false, activityAt: NOW })), false);
});
