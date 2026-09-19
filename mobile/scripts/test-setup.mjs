import { register } from 'node:module';

// Testleri koşarken uzantısız içe aktarmaları çözen kanca. `npm test`
// bu dosyayı `--import` ile yüklüyor.
register('./test-resolve-hook.mjs', import.meta.url);
