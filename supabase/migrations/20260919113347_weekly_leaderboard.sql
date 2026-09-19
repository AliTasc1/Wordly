-- Haftalık lider tablosu.
--
-- Sosyal ekranların en ucuzu ve en dürüstü: zaten eşitlediğimiz daily_xp
-- üzerine kuruluyor, yeni kullanıcı içeriği getirmiyor. Akış, kulüp ve
-- yorumlar ayrı bir iş — moderasyon, şikâyet ve engelleme gerektiriyor ve
-- onlar planlanmadan açılmamalı.

-- ------------------------------------------------------------- katılım
-- Lider tablosuna girmek **isteğe bağlı ve varsayılan olarak kapalı**.
--
-- Tersi, hesap açan herkesin adını ve çalışma temposunu diğer bütün
-- kullanıcılara göstermek olurdu. Kimse bunu istemeden vermiş olmamalı;
-- görünür olmak bir seçim.
alter table public.profiles
  add column if not exists leaderboard_opt_in boolean not null default false;

-- Görünen ad, katılınca zorunlu hâle geliyor. Uzunluk sınırı moderasyonun
-- yerine geçmez ama sınırsız metnin tabloyu bozmasını engeller.
alter table public.profiles
  add column if not exists display_name_set_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_display_name_length;
alter table public.profiles
  add constraint profiles_display_name_length
  check (display_name is null or char_length(display_name) between 2 and 24);

-- Katılan herkesin bir adı olmalı: adsız bir satır tabloda "—" olarak
-- görünür ve kimse kendini bulamaz.
alter table public.profiles
  drop constraint if exists profiles_opt_in_needs_name;
alter table public.profiles
  add constraint profiles_opt_in_needs_name
  check (not leaderboard_opt_in or display_name is not null);

-- ------------------------------------------------------------- sıralama
-- Haftanın başı pazartesi (date_trunc'un varsayılanı) — Türkiye'de hafta
-- pazartesi başlıyor.
--
-- SECURITY DEFINER, çünkü tablo tanımı gereği **başkalarının** satırlarını
-- gösteriyor ve profiles üzerindeki RLS buna izin vermez. Sızıntı riski
-- fonksiyonun kendisiyle sınırlı: yalnızca katılmayı seçmiş kullanıcıların
-- adı ve haftalık XP'si dönüyor, başka hiçbir alan yok.
create or replace function public.weekly_leaderboard(limit_count integer default 50)
returns table (user_id uuid, display_name text, xp bigint, place bigint)
language sql
security definer
set search_path = ''
stable
as $$
  select
    w.user_id,
    p.display_name,
    w.xp,
    rank() over (order by w.xp desc, p.display_name asc) as place
  from (
    select d.user_id, sum(d.xp)::bigint as xp
    from public.daily_xp d
    where d.day >= date_trunc('week', current_date)::date
    group by d.user_id
  ) w
  join public.profiles p on p.id = w.user_id
  where p.leaderboard_opt_in
  order by w.xp desc, p.display_name asc
  limit greatest(least(limit_count, 200), 1);
$$;

-- Kendi sıran, ilk 50'nin dışında kalsan bile.
--
-- Bunu istemcide hesaplamak bütün tabloyu indirmek demekti; katılmayan
-- birine de "sıran yok" diyebilmek gerekiyor.
create or replace function public.my_leaderboard_place()
returns table (xp bigint, place bigint, total bigint)
language sql
security definer
set search_path = ''
stable
as $$
  with board as (
    select
      w.user_id,
      w.xp,
      rank() over (order by w.xp desc, p.display_name asc) as place
    from (
      select d.user_id, sum(d.xp)::bigint as xp
      from public.daily_xp d
      where d.day >= date_trunc('week', current_date)::date
      group by d.user_id
    ) w
    join public.profiles p on p.id = w.user_id
    where p.leaderboard_opt_in
  )
  select b.xp, b.place, (select count(*) from board)::bigint
  from board b
  where b.user_id = (select auth.uid());
$$;

-- ---------------------------------------------------------------- yetki
-- Oturum açmamış ziyaretçi tabloyu göremiyor: giriş yapmadan başkalarının
-- adlarını toplayabilen bir uç nokta, lider tablosu değil veri kaynağıdır.
revoke execute on function public.weekly_leaderboard(integer) from public, anon;
revoke execute on function public.my_leaderboard_place() from public, anon;
grant execute on function public.weekly_leaderboard(integer) to authenticated;
grant execute on function public.my_leaderboard_place() to authenticated;

-- Haftalık toplama her istekte bütün tabloyu taramasın.
create index if not exists daily_xp_day on public.daily_xp (day);
