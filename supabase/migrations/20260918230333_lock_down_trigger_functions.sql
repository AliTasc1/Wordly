-- Tetikleyici işlevleri API'den çağrılamasın.
--
-- handle_new_user() yalnızca auth.users'a satır eklendiğinde tetikleyici
-- olarak çalışmalı. public şemasında durduğu için PostgREST onu
-- /rest/v1/rpc/handle_new_user adresinde yayımlıyordu ve SECURITY DEFINER
-- olduğu için kendi sahibinin yetkileriyle çalışıyordu. Doğrudan çağrıldığında
-- `new` boş olacağı için hata verirdi, yani bugün somut bir zarar yok — ama
-- API yüzeyinde durmasının hiçbir gerekçesi de yok. Yetki kaldırılıyor.
--
-- Bu açığı güvenlik denetleyicisi (get_advisors) yakaladı; şema uygulandıktan
-- sonra denetleyiciyi çalıştırmak alışkanlık hâline gelmeli.
--
-- keep_furthest_position() SECURITY INVOKER (varsayılan) olduğu için aynı
-- riski taşımıyor; yine de tutarlılık için onun da yetkisi kaldırılıyor.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.keep_furthest_position() from public, anon, authenticated;
