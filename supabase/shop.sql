-- StickNstay shop. Run once in the Supabase SQL editor, after schema.sql and auth.sql.
-- Same security model as the other files: RLS on, no policies, service-role access only.

create table if not exists public.categories (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,60}$'),
  name text not null,
  sort int not null default 0
);

create table if not exists public.products (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,60}$'),
  name text not null,
  description text not null,
  category_slug text not null references public.categories (slug),
  -- Placeholder art until real photos exist (CSS colours + tilt). Set image_url later.
  art_bg text not null,
  art_text text not null,
  art_tilt text not null default '0deg',
  image_url text,
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists products_category on public.products (category_slug, sort);

-- One row per design in an order. Name and price are copied so old orders never change.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  qty int not null check (qty between 1 and 5),
  unit_price int not null
);
create index if not exists order_items_order on public.order_items (order_id);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.order_items enable row level security;
revoke all on public.categories, public.products, public.order_items from anon, authenticated;

-- Atomic multi-item checkout. Same rules as place_order: allowlist check, daily limit
-- across ALL of the student's orders today (IST), advisory lock against parallel requests.
-- p_items is a JSON array like [{"slug":"golden-hour","qty":2}].
create or replace function public.place_cart_order(
  p_bsp text, p_name text, p_mobile text, p_email text, p_note text, p_items jsonb
) returns table (o_code text, o_total int, o_error text, o_remaining int)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_limit int;
  v_price int;
  v_used int;
  v_qty int;
  v_found int;
  v_wanted int;
  v_distinct int;
  v_order_id uuid;
  v_code text;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if not exists (select 1 from bsp_allowlist where bsp = p_bsp and active) then
    return query select null::text, null::int, 'BSP_NOT_FOUND'::text, null::int;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_bsp));

  select value into v_limit from settings where key = 'daily_limit';
  select value into v_price from settings where key = 'price_basic';
  if v_limit is null or v_price is null then
    raise exception 'settings daily_limit and price_basic must exist';
  end if;

  select coalesce(sum(c.qty), 0), count(*), count(distinct c.slug)
    into v_qty, v_wanted, v_distinct
    from jsonb_to_recordset(p_items) as c(slug text, qty int);
  if v_wanted = 0 or exists (
    select 1 from jsonb_to_recordset(p_items) as c(slug text, qty int) where c.qty < 1
  ) then
    return query select null::text, null::int, 'EMPTY_CART'::text, null::int;
    return;
  end if;

  select count(*) into v_found
    from jsonb_to_recordset(p_items) as c(slug text, qty int)
    join products p on p.slug = c.slug and p.active;
  if v_found <> v_wanted or v_distinct <> v_wanted then
    return query select null::text, null::int, 'BAD_PRODUCT'::text, null::int;
    return;
  end if;

  select coalesce(sum(qty), 0) into v_used from orders
   where bsp = p_bsp and status <> 'cancelled'
     and (created_at at time zone 'Asia/Kolkata')::date = v_today;

  if v_used + v_qty > v_limit then
    return query select null::text, null::int, 'LIMIT_REACHED'::text, greatest(v_limit - v_used, 0);
    return;
  end if;

  loop
    v_code := 'SNS-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    begin
      insert into orders (code, bsp, name, mobile, email, variant, qty, unit_price, total, note)
      values (v_code, p_bsp, p_name, p_mobile, p_email, 'basic', v_qty, v_price, v_price * v_qty, p_note)
      returning id into v_order_id;
      exit;
    exception when unique_violation then
      null; -- code collision: loop and draw a new one
    end;
  end loop;

  insert into order_items (order_id, product_slug, product_name, qty, unit_price)
  select v_order_id, c.slug, p.name, c.qty, v_price
  from jsonb_to_recordset(p_items) as c(slug text, qty int)
  join products p on p.slug = c.slug;

  return query select v_code, v_price * v_qty, null::text, greatest(v_limit - v_used - v_qty, 0);
end $$;

revoke all on function public.place_cart_order(text, text, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.place_cart_order(text, text, text, text, text, jsonb)
  to service_role;

-- Categories for a campus magnet shop.
insert into public.categories (slug, name, sort) values
  ('aesthetic', 'Aesthetic', 1),
  ('campus-life', 'Campus Life', 2),
  ('vibes-quotes', 'Vibes & Quotes', 3),
  ('doodles-fun', 'Doodles & Fun', 4)
on conflict (slug) do nothing;

-- The eight starter designs. Colours match the brand variables used on the site.
insert into public.products (slug, name, description, category_slug, art_bg, art_text, art_tilt, sort) values
  ('golden-hour', 'Golden Hour', 'Warm, glowy and a little dreamy. The magnet version of 6 pm light on the terrace. 5×7 inch.', 'aesthetic', 'var(--sns-sunshine-deep)', 'var(--sns-ink)', '-3deg', 1),
  ('cream-soda', 'Cream Soda', 'Soft cream tones with a fizzy pop of colour. Looks calm on a hostel wall or locker. 5×7 inch.', 'aesthetic', 'var(--sns-cream)', 'var(--sns-ink)', '3deg', 2),
  ('soft-launch', 'Soft Launch', 'Clean, minimal and quietly confident. For people who like their decor understated. 5×7 inch.', 'aesthetic', 'var(--sns-white)', 'var(--sns-ink)', '2deg', 3),
  ('midnight-study', 'Midnight Study', 'Dark ink with a glowing yellow title, made for the 2 am exam-week grind. 5×7 inch.', 'campus-life', 'var(--sns-ink)', 'var(--sns-sunshine)', '-2deg', 4),
  ('sticky-notes', 'Sticky Notes', 'Bright note-yellow, like a reminder you actually want to read. Great for the study desk. 5×7 inch.', 'campus-life', 'var(--sns-sunshine)', 'var(--sns-ink)', '-3deg', 5),
  ('main-character', 'Main Character', 'Bold red for the days you walk in like the lead of your own story. 5×7 inch.', 'vibes-quotes', 'var(--sns-red-deep)', 'var(--sns-cream)', '2deg', 6),
  ('magnet-love', 'Magnet Love', 'A loud little love note in magnet red. Stick it, gift it, repeat. 5×7 inch.', 'vibes-quotes', 'var(--sns-magnet-red)', 'var(--sns-white)', '3deg', 7),
  ('paper-doodle', 'Paper Doodle', 'Notebook-paper feel with a hand-drawn spirit. Playful and a bit messy, on purpose. 5×7 inch.', 'doodles-fun', 'var(--sns-paper)', 'var(--sns-ink)', '-2deg', 8)
on conflict (slug) do nothing;
