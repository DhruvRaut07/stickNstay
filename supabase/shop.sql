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

-- One product per sticker in public/stickers (generated from manifest.csv).
-- Genre -> category: self-love = aesthetic; study + desi = campus-life; motivation + gym + champion = vibes-quotes; gen-z = doodles-fun.
insert into public.products (slug, name, description, category_slug, art_bg, art_text, art_tilt, image_url, sort) values
  ('dream-big-start-small', 'Dream Big Start Small', 'Your dream is huge. Your first step doesn''t have to be. Put this where you''ll see it every morning and just begin.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/01-motivation/dream-big-start-small.webp', 4),
  ('good-day-to-begin', 'Good Day To Begin', 'Plot twist: today is the day. Stick it on the fridge and stop waiting for a "better" Monday.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/01-motivation/good-day-to-begin.webp', 11),
  ('keep-going', 'Keep Going', 'Some days, two words are all you need. Keep this where your bad days will find it.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/01-motivation/keep-going.webp', 18),
  ('one-step-at-a-time', 'One Step At A Time', 'Overwhelmed by the to-do list? Breathe, pick one thing, do it. This one lives best on your whiteboard.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/01-motivation/one-step-at-a-time.webp', 25),
  ('progress-over-perfection', 'Progress Over Perfection', 'Stop polishing, start submitting. For everyone who has redone the same slide ten times.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/01-motivation/progress-over-perfection.webp', 32),
  ('small-steps-big-moves', 'Small Steps Big Moves', 'Nobody sees the tiny steps, everyone sees the result. Stick it by your planner and keep stacking wins.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/01-motivation/small-steps-big-moves.webp', 39),
  ('start-before-ready', 'Start Before Ready', 'Spoiler: you will never feel ready. Do the thing anyway. Your future self is already thankful.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/01-motivation/start-before-ready.webp', 46),
  ('you-got-this', 'You Got This', 'Free pep talk, no battery needed. Stick it on a friend''s locker before their viva and watch them smile.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/01-motivation/you-got-this.webp', 53),
  ('built-not-given', 'Built Not Given', 'Nobody''s gifting you that glow-up. You earn it, rep by rep. Perfect for the gym locker.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/02-gym-and-grit/built-not-given.webp', 5),
  ('discipline-over-mood', 'Discipline Over Mood', 'Motivation is moody, discipline shows up anyway. Stick it where your gym bag lives and lace up.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/02-gym-and-grit/discipline-over-mood.webp', 12),
  ('earn-it', 'Earn It', 'Two words, zero excuses. Slap it above your desk and go earn that result.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/02-gym-and-grit/earn-it.webp', 19),
  ('no-days-off', 'No Days Off', 'For the friend who has never skipped leg day. Stick it on your locker and let the guilt do the rest.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/02-gym-and-grit/no-days-off.webp', 26),
  ('one-more-rep', 'One More Rep', 'The set only starts when it gets hard. Gift it to your gym buddy and keep each other honest.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/02-gym-and-grit/one-more-rep.webp', 33),
  ('show-up-daily', 'Show Up Daily', 'Big results come from boring consistency. Put it on the fridge and show up, even on the lazy days.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/02-gym-and-grit/show-up-daily.webp', 40),
  ('stay-hungry', 'Stay Hungry', 'Comfortable is where dreams go to nap. Keep this on your wall and keep chasing that placement.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/02-gym-and-grit/stay-hungry.webp', 47),
  ('sweat-now-shine-later', 'Sweat Now Shine Later', 'Today it hurts, tomorrow you glow. A gym locker classic that earns every look it gets.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/02-gym-and-grit/sweat-now-shine-later.webp', 54),
  ('champion-mindset', 'Champion Mindset', 'Winners decide before the scoreboard does. Make your corner feel like a trophy room.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/03-champion-mindset/champion-mindset.webp', 6),
  ('get-back-up', 'Get Back Up', 'Bad grade, lost match, rejection mail? Cry if you must, then stand up. Stick this where you''ll see it.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/03-champion-mindset/get-back-up.webp', 13),
  ('never-fold', 'Never Fold', 'Weak hand? Play it anyway. For debaters, gamers and anyone who hates losing.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/03-champion-mindset/never-fold.webp', 20),
  ('own-the-arena', 'Own The Arena', 'Walk into every room like you booked it. Stick it up before your next presentation.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/03-champion-mindset/own-the-arena.webp', 27),
  ('play-to-win', 'Play To Win', 'You''re not here to participate. Hackathon, case comp or the college league, bring this along.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/03-champion-mindset/play-to-win.webp', 34),
  ('rise-and-grind', 'Rise And Grind', 'The 5 am people will love this one. Put it inside your cupboard door and start the day swinging.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/03-champion-mindset/rise-and-grind.webp', 41),
  ('round-two', 'Round Two', 'Lost round one? Great, now you know their moves. For every comeback story in the making.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/03-champion-mindset/round-two.webp', 48),
  ('winners-are-made', 'Winners Are Made', 'Talent gets you in the room, practice wins it. Perfect for the study table or the team locker.', 'vibes-quotes', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/03-champion-mindset/winners-are-made.webp', 55),
  ('a-plus-energy', 'A Plus Energy', 'Manifest the grade before the results drop. Your study table deserves this good-luck charm.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/04-study-mode/a-plus-energy.webp', 2),
  ('coffee-notes-repeat', 'Coffee Notes Repeat', 'The exam-season routine, no explanation needed. Made for the hostel fridge next to the kettle.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/04-study-mode/coffee-notes-repeat.webp', 9),
  ('deadline-handled', 'Deadline Handled', 'Submitted at 11:59 pm and still breathing? Stick it up. You earned a tiny victory lap.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/04-study-mode/deadline-handled.webp', 16),
  ('exam-season-survivor', 'Exam Season Survivor', 'You pulled the all-nighters and lived to tell the tale. Wear the badge, or gift it to someone who did.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/04-study-mode/exam-season-survivor.webp', 23),
  ('focus-mode-on', 'Focus Mode On', 'Phone away, headphones in, world muted. A tiny do-not-disturb sign for your desk or room door.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/04-study-mode/focus-mode-on.webp', 30),
  ('future-topper-loading', 'Future Topper Loading', 'Progress bar at 12% but moving. The most hopeful sticker for anyone catching up before finals.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/04-study-mode/future-topper-loading.webp', 37),
  ('one-more-chapter', 'One More Chapter', 'Said at 1 am, regretted at 8. Stick it in your study corner for a relatable laugh.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/04-study-mode/one-more-chapter.webp', 44),
  ('revise-repeat-relax', 'Revise Repeat Relax', 'The only study plan that works. Pin it to the whiteboard next to your timetable.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/04-study-mode/revise-repeat-relax.webp', 51),
  ('be-kind-to-your-mind', 'Be Kind To Your Mind', 'Your brain''s been running all day. Be gentle with it. A soft nudge for the mirror or bedside wall.', 'aesthetic', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/05-self-love-and-good-vibes/be-kind-to-your-mind.webp', 1),
  ('bloom-at-your-pace', 'Bloom At Your Pace', 'Everyone''s timeline is different, even when the placement list says otherwise. A comfort sticker for the comparison blues.', 'aesthetic', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/05-self-love-and-good-vibes/bloom-at-your-pace.webp', 8),
  ('choose-joy', 'Choose Joy', 'Happiness is partly a decision. Stick it on the fridge and make it before your first coffee.', 'aesthetic', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/05-self-love-and-good-vibes/choose-joy.webp', 15),
  ('glow-from-within', 'Glow From Within', 'Confidence that doesn''t need a like. Looks beautiful on a mirror or tucked into a friend''s birthday gift.', 'aesthetic', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/05-self-love-and-good-vibes/glow-from-within.webp', 22),
  ('healing-not-hurrying', 'Healing Not Hurrying', 'Take as long as you need. Nobody''s timing you. A gentle little sticker for the quiet corner of your room.', 'aesthetic', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/05-self-love-and-good-vibes/healing-not-hurrying.webp', 29),
  ('protect-your-peace', 'Protect Your Peace', '"No" is a full sentence. Stick it on your door, or send it to the group chat you''ve muted.', 'aesthetic', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/05-self-love-and-good-vibes/protect-your-peace.webp', 36),
  ('soft-life-era', 'Soft Life Era', 'Slow mornings, warm chai, zero hustle guilt. Welcome to your cosiest era, starting at the fridge.', 'aesthetic', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/05-self-love-and-good-vibes/soft-life-era.webp', 43),
  ('you-are-enough', 'You Are Enough', 'Read it twice, you need it today. The best thing to stick on a friend''s mirror on a rough day.', 'aesthetic', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/05-self-love-and-good-vibes/you-are-enough.webp', 50),
  ('chronically-online', 'Chronically Online', 'If you''ve ever replied to a text with a meme, this one is you. Stick it by your laptop and own it.', 'doodles-fun', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/06-gen-z-and-funny/chronically-online.webp', 7),
  ('nap-champion', 'Nap Champion', 'Gold medal in sleeping through the 8 am lecture. Your roommate will want one too.', 'doodles-fun', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/06-gen-z-and-funny/nap-champion.webp', 14),
  ('no-thoughts-just-vibes', 'No Thoughts Just Vibes', 'Assignments? Placements? Dinner? Brain is off, vibes are on. Stick it up and refuse to think.', 'doodles-fun', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/06-gen-z-and-funny/no-thoughts-just-vibes.webp', 21),
  ('overthinking-brb', 'Overthinking Brb', 'The text we all wish we could send mid-spiral. Perfect for the fridge and the friend who replays chats at 2 am.', 'doodles-fun', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/06-gen-z-and-funny/overthinking-brb.webp', 28),
  ('plot-twist-tired', 'Plot Twist Tired', 'Nobody saw it coming: you''re exhausted again. A funny one for the sleep-deprived hostel whiteboard.', 'doodles-fun', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/06-gen-z-and-funny/plot-twist-tired.webp', 35),
  ('professional-overthinker', 'Professional Overthinker', 'Years of experience, zero degrees needed. A cheeky title for the friend who drafts every reply three times.', 'doodles-fun', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/06-gen-z-and-funny/professional-overthinker.webp', 42),
  ('snacks-first', 'Snacks First', 'Priorities, sorted. Stick it on the fridge where the midnight snacks live, or gift it to your foodie friend.', 'doodles-fun', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/06-gen-z-and-funny/snacks-first.webp', 49),
  ('touch-grass', 'Touch Grass', 'The internet''s favourite advice, now on your wall. A friendly hint if you haven''t been outside all week.', 'doodles-fun', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/06-gen-z-and-funny/touch-grass.webp', 56),
  ('bas-ho-jayega', 'Bas Ho Jayega', 'The calm of every parent and senior, in one line. Stick it up before your next submission panic.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/07-desi-hinglish/bas-ho-jayega.webp', 3),
  ('chai-over-everything', 'Chai Over Everything', 'Because chai fixes everything: exams, breakups, Monday. A must for the hostel pantry fridge.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/07-desi-hinglish/chai-over-everything.webp', 10),
  ('hostel-mode-on', 'Hostel Mode On', 'Slippers on, door open, chaos welcome. Stick it on your door and let everyone know whose room this is.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/07-desi-hinglish/hostel-mode-on.webp', 17),
  ('jugaad-level-expert', 'Jugaad Level Expert', 'Fixed it with a safety pin and sheer confidence? This one''s for you, genius of the study table.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/07-desi-hinglish/jugaad-level-expert.webp', 24),
  ('kal-se-pakka', 'Kal Se Pakka', '"From tomorrow, for sure." The most honest promise about gym, studies and sleep. See you tomorrow, again.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/07-desi-hinglish/kal-se-pakka.webp', 31),
  ('maggi-at-midnight', 'Maggi At Midnight', 'Two-minute noodles, two-hour gossip. Made for the hostel kettle shelf and late-night study groups.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/07-desi-hinglish/maggi-at-midnight.webp', 38),
  ('sab-badhiya', 'Sab Badhiya', 'Everything is great, even when it isn''t. An easy smile for the fridge, door or any boring grey locker.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/07-desi-hinglish/sab-badhiya.webp', 45),
  ('thoda-aur-chill', 'Thoda Aur Chill', 'Take a deep breath, a little more chill. A gentle hint for friends who panic before every presentation.', 'campus-life', 'var(--sns-cream)', 'var(--sns-ink)', '0deg', '/stickers/07-desi-hinglish/thoda-aur-chill.webp', 52)
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  category_slug = excluded.category_slug, image_url = excluded.image_url, sort = excluded.sort, active = true;
