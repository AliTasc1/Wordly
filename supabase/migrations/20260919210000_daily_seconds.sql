-- Gün başına çalışma süresi.
--
-- Kurulumda sorulan "günde ne kadar çalışacaksın?" hedefi artık gerçek
-- ölçülen süreyle karşılaştırılıyor. Süre, XP gibi cihazlar arasında
-- toplanmalı: telefonda on dakika, tablette beş dakika çalışan kişinin
-- günlük hedefi on beş dakikada dolmalı.
--
-- --------------------------------------------------------------- neden sütun
-- Ayrı bir tablo açılmadı. `daily_xp` zaten (kullanıcı, gün, cihaz)
-- anahtarlı ve saymak istediğimiz şey tam olarak aynı üçlüye ait. İkinci bir
-- tablo, aynı anahtarı ikinci kez tanımlamak, ikinci bir RLS kümesi yazmak
-- ve eşitlemede ikinci bir gidiş dönüş demekti — hepsi aynı satıra yazılacak
-- bir sayı için.
--
-- Tablonun adı artık içeriğinden dar kalıyor ama yeniden adlandırmak,
-- çalışan bir eşitlemeyi kimsenin okumadığı bir isim uğruna bozmak olurdu.
--
-- --------------------------------------------------------------- geriye dönük
-- `default 0` sayesinde mevcut satırlar bozulmuyor ve eski sürümdeki bir
-- cihaz bu sütunu hiç yazmadan çalışmaya devam ediyor: gönderdiği satırda
-- saniye alanı yoksa 0 yazılıyor, XP'si yine işliyor. Eski ve yeni sürüm bir
-- süre yan yana çalışacak; zorunlu bir alan eklemek eski cihazların
-- eşitlemesini kırardı.
alter table public.daily_xp
  add column if not exists seconds integer not null default 0;

alter table public.daily_xp
  drop constraint if exists daily_xp_seconds_nonneg;
alter table public.daily_xp
  add constraint daily_xp_seconds_nonneg check (seconds >= 0);
