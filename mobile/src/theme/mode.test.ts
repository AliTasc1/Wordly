import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { MODES, parseMode, resolveName } from './mode';

test('kayıtlı seçim geri okunuyor', () => {
  assert.equal(parseMode('light'), 'light');
  assert.equal(parseMode('dark'), 'dark');
  assert.equal(parseMode('system'), 'system');
});

test('bozuk kayıt varsayılana düşüyor', () => {
  // Eski sürümden kalan, elle kurcalanmış ya da hiç yazılmamış değerler.
  for (const raw of [null, undefined, '', 'koyu', 'LIGHT', '{"mode":"dark"}']) {
    assert.equal(parseMode(raw), 'system', `${String(raw)} varsayılana düşmeliydi`);
  }
});

test('sabitlenen tema telefonu dinlemiyor', () => {
  for (const system of ['light', 'dark', 'unspecified', null, undefined] as const) {
    assert.equal(resolveName('light', system), 'light');
    assert.equal(resolveName('dark', system), 'dark');
  }
});

test('sistem seçiliyken telefonun ayarı geçerli', () => {
  assert.equal(resolveName('system', 'light'), 'light');
  assert.equal(resolveName('system', 'dark'), 'dark');
});

test('telefon söylemiyorsa koyuya düşüyor', () => {
  // `useColorScheme()` Android'de `null`, bazı sürümlerde `'unspecified'`
  // döndürüyor; ikisinde de uygulamanın kendi kimliği geçerli.
  assert.equal(resolveName('system', null), 'dark');
  assert.equal(resolveName('system', undefined), 'dark');
  assert.equal(resolveName('system', 'unspecified'), 'dark');
});

test('seçenek listesi üç modun hepsini bir kez taşıyor', () => {
  const modes = MODES.map((m) => m.mode);
  assert.deepEqual([...modes].sort(), ['dark', 'light', 'system']);
  assert.equal(new Set(modes).size, modes.length);
  for (const m of MODES) {
    assert.ok(m.label.length > 0, `${m.mode} etiketsiz`);
    assert.ok(m.note.length > 0, `${m.mode} açıklamasız`);
    assert.ok(m.glyph.length > 0, `${m.mode} simgesiz`);
  }
});
