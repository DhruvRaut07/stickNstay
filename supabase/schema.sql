-- StickNstay schema. Run once in the Supabase SQL editor.
-- Security model: RLS is ON for every table with NO policies, so anon/authenticated
-- keys can read nothing. All access goes through the server using the service-role key.

create table public.settings (key text primary key, value int not null);
insert into public.settings values ('price_basic', 30), ('price_custom', 40), ('daily_limit', 5);

create table public.bsp_allowlist (
  bsp text primary key check (bsp = upper(bsp)),
  active boolean not null default true
);

create table public.admins (email text primary key check (email = lower(email)));
insert into public.admins values ('dhruvraut5@gmail.com');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  bsp text not null,
  name text not null,
  mobile text not null,
  email text,
  variant text not null check (variant in ('basic', 'custom')),
  qty int not null check (qty between 1 and 50),
  unit_price int not null,
  total int not null,
  image_path text,
  note text,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  check (variant <> 'custom' or image_path is not null)
);
create index orders_bsp_created on public.orders (bsp, created_at);

alter table public.settings enable row level security;
alter table public.bsp_allowlist enable row level security;
alter table public.admins enable row level security;
alter table public.orders enable row level security;
revoke all on public.settings, public.bsp_allowlist, public.admins, public.orders
  from anon, authenticated;

-- Atomic order placement: allowlist check + daily limit (IST day) + insert in one
-- transaction. The advisory lock serialises concurrent orders for the same BSP so the
-- limit cannot be beaten by parallel requests.
create or replace function public.place_order(
  p_bsp text, p_name text, p_mobile text, p_email text,
  p_variant text, p_qty int, p_note text, p_image_path text
) returns table (o_code text, o_total int, o_error text, o_remaining int)
language plpgsql security definer set search_path = public as $$
declare
  v_limit int;
  v_price int;
  v_used int;
  v_code text;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if not exists (select 1 from bsp_allowlist where bsp = p_bsp and active) then
    return query select null::text, null::int, 'BSP_NOT_FOUND'::text, null::int;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_bsp));

  select value into v_limit from settings where key = 'daily_limit';
  select coalesce(sum(qty), 0) into v_used from orders
   where bsp = p_bsp and status <> 'cancelled'
     and (created_at at time zone 'Asia/Kolkata')::date = v_today;

  if v_used + p_qty > v_limit then
    return query select null::text, null::int, 'LIMIT_REACHED'::text, greatest(v_limit - v_used, 0);
    return;
  end if;

  select value into v_price from settings where key = 'price_' || p_variant;
  if v_price is null then
    return query select null::text, null::int, 'BAD_VARIANT'::text, null::int;
    return;
  end if;

  loop
    v_code := 'SNS-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    begin
      insert into orders (code, bsp, name, mobile, email, variant, qty, unit_price, total, image_path, note)
      values (v_code, p_bsp, p_name, p_mobile, p_email, p_variant, p_qty,
              v_price, v_price * p_qty, p_image_path, p_note);
      exit;
    exception when unique_violation then
      null; -- code collision: loop and draw a new one
    end;
  end loop;

  return query select v_code, v_price * p_qty, null::text, greatest(v_limit - v_used - p_qty, 0);
end $$;

revoke all on function public.place_order(text, text, text, text, text, int, text, text)
  from public, anon, authenticated;
grant execute on function public.place_order(text, text, text, text, text, int, text, text)
  to service_role;

-- Private bucket for customer images (served only via short-lived signed URLs).
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;
