-- WORDLY — ilerlemenin sunucu tarafı.
--
-- Uygulama "önce cihaz" çalışıyor ve öyle kalıyor: bu tablolar cihazdaki
-- kaydın yerine geçmiyor, üstüne ekleniyor. Öğrenci çevrimdışıyken her şey
-- çalışmaya devam eder; ağ geldiğinde eşitlenir.
--
-- Her tabloda RLS açık ve her politika auth.uid() ile sınırlı. Publishable
-- anahtar uygulamanın içinde taşınıyor — onu koruyan şey gizliliği değil,
-- buradaki politikalar. RLS'siz tek bir tablo, o anahtarı tüm veritabanının
-- anahtarı hâline getirir.

-- ---------------------------------------------------------------- profiles
-- Kullanıcı başına tek satır: onboarding cevapları, seviye, sınav sonucu.
-- Bunlar tercih; çakışmada son yazan kazanıyor ve bu doğru, çünkü öğrenci
-- son nerede değiştirdiyse kastı odur.
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  cefr        text not null default 'B1' check (cefr in ('A1','A2','B1','B2','C1','C2')),
  goals       text[] not null default '{}',
  daily_time  text,
  skills      text[] not null default '{}',
  test_result jsonb,
  arena       jsonb not null default '{"xp":0,"found":0,"streak":0}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- --------------------------------------------------------------- positions
-- Bölüm konumu: kaçıncı karttasın. Bölüm ve seviye başına tek satır.
create table public.positions (
  user_id  uuid not null references auth.users(id) on delete cascade,
  kind     text not null check (kind in ('vocab','grammar','reading','listening','speaking','writing')),
  level    text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  position integer not null default 0 check (position >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, level)
);

-- İlerleme geri sarmaz.
--
-- İki cihaz ayrı ilerlediyse büyük olan kazanmalı. Bu kararı istemciye
-- bırakmıyoruz: istemcide bir hata ya da eski bir sürüm küçük bir değer
-- gönderirse öğrencinin ilerlemesi silinir. Kural burada, veritabanında.
create or replace function public.keep_furthest_position()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.position < old.position then
    new.position := old.position;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger positions_keep_furthest
  before update on public.positions
  for each row execute function public.keep_furthest_position();

-- --------------------------------------------------------------- daily_xp
-- Gün başına kazanılan XP — ama cihaz kırılımıyla.
--
-- Aynı gün iki cihazda çalışılırsa gerçek toplam ikisinin toplamıdır, ama
-- her cihaz yalnızca kendi payını bilir. Tek satır tutulsaydı biri diğerini
-- ezerdi. (kullanıcı, gün, cihaz) üçlüsü sayesinde aynı cihaz kaç kez
-- gönderirse göndersin sonuç değişmiyor: yazma işlemi fikir değiştirmez.
create table public.daily_xp (
  user_id   uuid not null references auth.users(id) on delete cascade,
  day       date not null,
  device_id text not null,
  xp        integer not null default 0 check (xp >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, day, device_id)
);

create index daily_xp_user_day on public.daily_xp (user_id, day desc);

-- ------------------------------------------------------------ saved_words
-- Kelime defteri. Satır varsa kayıtlı, yoksa değil; silme gerçek silmedir.
create table public.saved_words (
  user_id    uuid not null references auth.users(id) on delete cascade,
  card_id    text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

-- --------------------------------------------------------------- mistakes
-- Hata defteri. Soru metni ve doğru cevabı da taşıyor: öğrenci haftalar
-- sonra baktığında "gramer, 3. soru" hiçbir şey anlatmaz.
--
-- `times` çakışmada toplanmıyor, büyüğü alınıyor. Toplamak iki cihazdan
-- gelen aynı yanlışı iki kez sayardı; burada amaç puan değil, hangi sorunun
-- ısrarla yanlış yapıldığını görmek.
create table public.mistakes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,
  kind       text not null check (kind in ('vocab','grammar','reading','listening','speaking','writing')),
  level      text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  content_id text not null,
  q          integer not null,
  text       text not null,
  answer     text not null,
  times      integer not null default 1 check (times >= 1),
  at         date not null default current_date,
  primary key (user_id, key)
);

create index mistakes_user_times on public.mistakes (user_id, times desc);

-- ------------------------------------------------------------------- RLS
-- Beş tablonun beşinde de açık. Politikalar auth.uid() ile sınırlı: bir
-- kullanıcı yalnızca kendi satırını görür ve yazar.
--
-- select ile insert/update/delete ayrı ayrı yazıldı; hepsini tek `for all`
-- politikasına toplamak kısa görünür ama with check'i unutmaya açıktır ve
-- o unutulduğunda kullanıcı başkasının adına satır yazabilir.
alter table public.profiles    enable row level security;
alter table public.positions   enable row level security;
alter table public.daily_xp    enable row level security;
alter table public.saved_words enable row level security;
alter table public.mistakes    enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy positions_select on public.positions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy positions_insert on public.positions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy positions_update on public.positions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy daily_xp_select on public.daily_xp
  for select to authenticated using ((select auth.uid()) = user_id);
create policy daily_xp_insert on public.daily_xp
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy daily_xp_update on public.daily_xp
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy saved_words_select on public.saved_words
  for select to authenticated using ((select auth.uid()) = user_id);
create policy saved_words_insert on public.saved_words
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy saved_words_delete on public.saved_words
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy mistakes_select on public.mistakes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy mistakes_insert on public.mistakes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy mistakes_update on public.mistakes
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy mistakes_delete on public.mistakes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ------------------------------------------------------- yeni kullanıcı
-- Kayıt olan herkese boş bir profil satırı açılıyor. İstemciye bırakılsaydı
-- ilk açılışta ağ koparsa kullanıcı profilsiz kalırdı.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
