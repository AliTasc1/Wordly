import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

/**
 * Kelime telaffuzu haritasının doğruluğu.
 *
 * `clips.ts` doğrudan içe aktarılamıyor: içi `require('….mp3')` dolu ve bunu
 * yalnızca Metro çözüyor, Node değil. Bu yüzden dosya metin olarak okunup
 * anahtarları çıkarılıyor. Dolaylı bir yol ama koruduğu şey gerçek.
 *
 * Korunan şey şu: kart kimliği ile ses dosyası arasındaki bağ, `build-audio.py`
 * içindeki `slug()` kuralına dayanıyor. O kural değişirse ya da bir dosya
 * eksilirse uygulama çökmez — kelime sessizce cihaz sesine düşer ve kimse fark
 * etmez. Sessiz bozulmaları yakalayacak bir şey olması gerekiyordu.
 */

const CLIPS = readFileSync(new URL('./clips.ts', import.meta.url), 'utf8');

/** `clips.ts` içindeki WORDS haritasının anahtarları. */
function wordKeys(): Set<string> {
  const block = /export const WORDS: Record<string, number> = \{([\s\S]*?)\n\};/.exec(
    CLIPS,
  );
  assert.ok(block, 'WORDS haritası clips.ts içinde bulunamadı');

  const keys = new Set<string>();
  for (const line of block[1].split('\n')) {
    const key = /^\s*'([^']+)':/.exec(line);
    if (key) keys.add(key[1]);
  }
  return keys;
}

function cardIds(level: string): string[] {
  const path = new URL(`../../assets/content/${level}.json`, import.meta.url);
  return (JSON.parse(readFileSync(path, 'utf8')) as { id: string }[]).map((c) => c.id);
}

/**
 * Gömülü seviyeler. `build-audio.py --word-levels` varsayılanıyla aynı
 * olmalı; ayrıştıklarında bu test düşer ve hangisinin doğru olduğuna karar
 * vermeye zorlar.
 */
const GOMULU = ['a1', 'a2'];
const DISARIDA = ['b1', 'b2', 'c1', 'c2'];

test('gömülü seviyelerdeki her kartın telaffuzu var', () => {
  const keys = wordKeys();
  for (const level of GOMULU) {
    const eksik = cardIds(level).filter((id) => !keys.has(`${level}/${id}`));
    assert.deepEqual(
      eksik,
      [],
      `${level.toUpperCase()} içinde ${eksik.length} kartın telaffuzu haritada yok`,
    );
  }
});

test('haritada karşılığı olmayan anahtar yok', () => {
  // Ters yön: silinen bir kartın sesi haritada kalırsa paket boşuna büyür.
  const gecerli = new Set(GOMULU.flatMap((lv) => cardIds(lv).map((id) => `${lv}/${id}`)));
  const fazla = [...wordKeys()].filter((k) => !gecerli.has(k));
  assert.deepEqual(fazla, [], `${fazla.length} anahtarın karşılığı olan kart yok`);
});

test('gömülmeyen seviyeler haritada yok', () => {
  // Paket boyutu kararı burada duruyor. Biri farkında olmadan --word-levels
  // all ile dizini yeniden üretirse indirme 37 MB'den 82 MB'ye çıkar ve
  // bunu fark etmenin başka bir yolu yok.
  const keys = [...wordKeys()];
  for (const level of DISARIDA) {
    const sizan = keys.filter((k) => k.startsWith(`${level}/`));
    assert.equal(
      sizan.length,
      0,
      `${level.toUpperCase()} gömülmemeli ama haritada ${sizan.length} kaydı var`,
    );
  }
});

test('anahtar sayısı iki seviyenin kart sayısına eşit', () => {
  const beklenen = GOMULU.reduce((n, lv) => n + cardIds(lv).length, 0);
  assert.equal(wordKeys().size, beklenen);
  assert.equal(beklenen, 2335);
});
