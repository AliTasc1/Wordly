-- Hesabı kullanıcının kendisi silebilsin.
--
-- App Store 5.1.1(v): hesap açtıran her uygulama, hesabı **uygulamanın
-- içinden** silmeyi de sunmak zorunda. Sunmayan uygulama reddediliyor.
-- Google Play'in de eşdeğer şartı var. Yani bu bir incelik değil, yayın
-- şartı.
--
-- Bağımsız olarak doğru olan da bu: veriyi vermeyi kolaylaştırıp geri almayı
-- e-posta yazmaya bağlamak, rızayı tek yönlü bir kapı hâline getirir.
--
-- ------------------------------------------------------------ neden işlev
-- auth.users'tan satır silmek normalde yalnızca servis anahtarının yapabildiği
-- bir iş; istemcideki yayımlanabilir anahtar bunu yapamaz. İki yol vardı:
--
--   1. Servis anahtarıyla çalışan bir Edge Function
--   2. auth.uid() üzerinden kendi satırını silen SECURITY DEFINER bir işlev
--
-- İkincisi seçildi. Edge Function, uygulamanın hiç ihtiyaç duymadığı bir
-- dağıtım yüzeyi ve içinde servis anahtarı taşıyan ikinci bir çalışma ortamı
-- getirirdi. Buradaki işlev parametre almıyor: silinecek kullanıcıyı
-- çağıranın kendi oturumundan okuyor, dolayısıyla "başkasının kimliğini ver"
-- diyebileceği bir yer yok.
--
-- ------------------------------------------------------- neden tek satır
-- Beş tablonun tamamı auth.users(id) üzerine `on delete cascade` ile bağlı
-- (profiles, positions, daily_xp, saved_words, mistakes). Tek satırın silinmesi
-- hepsini götürüyor; tablo tablo silme kodu yazmak, ileride eklenecek bir
-- tabloyu unutmaya davet olurdu. Cascade'i şema garanti ediyor.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
-- search_path sabitleniyor: SECURITY DEFINER bir işlevde arama yolu
-- çağırana bırakılırsa, çağıran kendi şemasına sahte bir `users` tablosu
-- koyup işlevi kandırabilir.
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  -- Oturumsuz çağrı: anon rolünden yetki zaten alındı, ama işlevin kendisi de
  -- kimliksiz çalışmayı reddetmeli. Yetki tablosu ileride yanlışlıkla
  -- gevşetilirse ikinci savunma burada duruyor.
  if me is null then
    raise exception 'Oturum yok.' using errcode = '28000';
  end if;

  delete from auth.users where id = me;
end;
$$;

-- anon'un bu işlevi görmesi için bir sebep yok: silinecek bir hesabı yok.
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
