# stickNstay

Magnet stickers that make any magnetic surface feel like yours: fridge, locker, cupboard, whiteboard.
A student-run brand at IBS Mumbai. Students log in with their BSP number and college email, pick a
ready-made or custom 5×7 inch magnet, and pay cash on delivery.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · Supabase (Postgres + Storage) · Gmail SMTP

## Project structure

```
stickNstay/
├── app/                  Pages and API routes (Next.js App Router)
│   ├── (home)            page.tsx, layout.tsx, globals.css (brand tokens live here)
│   ├── about/ designs/ faq/ contact/     Marketing pages
│   ├── login/            Student login (BSP number + email code)
│   ├── order/            Order form (login required)
│   ├── thank-you/        Order confirmation
│   ├── admin/            Orders dashboard (admin only)
│   └── api/orders/       Order submission endpoint
├── components/           Shared UI (header, footer, splash, toast, ...)
├── lib/                  Business logic: auth, session, rules, mail, rate limit (+ tests)
├── public/               Files served as-is: logos, favicons, the homepage video
├── supabase/             Database SQL (run in the Supabase SQL editor)
├── scripts/              One-off tools (build the student roster from the Excel sheet)
├── brand/                Brand identity: single source of truth
│   ├── logo-kit/         Logos (svg/png/webp), favicons, colors.css, restyle brief
│   ├── elements/         Realistic decorative sticker/magnet images
│   ├── splash/           Splash-screen animation source and demo
│   └── qr/               QR code
├── docs/                 Product requirements (PRD.md)
├── assets/video/         Source videos (git-ignored: large, not deployed)
└── data/                 Private data, e.g. student Excel sheet (git-ignored)
```

`brand/`, `docs/`, `assets/` and `data/` are never imported by the app. Only `public/` is served.

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run dev                    # http://localhost:3000
```

Other commands: `npm run build` · `npm test` (unit tests) · `npm run lint`

## Setup

### 1. Environment variables (`.env.local`, never commit it)

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project URL and public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret server key. Never expose it |
| `SESSION_SECRET` | Random 32+ characters; signs login cookies. Changing it logs everyone out |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_NOTIFY_EMAIL` | Sends login codes and order emails |

Without Gmail configured in development, login codes are printed in the terminal instead.

### 2. Database (Supabase SQL editor, in this order)

1. `supabase/schema.sql`: tables, daily order limit, private image bucket
2. `supabase/auth.sql`: student login additions
3. `supabase/students_seed.sql`: the student roster (generated, see below)

### 3. Student roster

```bash
python scripts/make_students_sql.py data/seating-arrangement-sem1.xlsx
```

Reads the exam seating sheet and writes `supabase/students_seed.sql` (git-ignored, contains names).
Safe to re-run.

## How login works

Student enters BSP number and `@ibsindia.org` email → server checks the BSP is on the roster and the
email matches their name → emails a 6-digit code → signed `httpOnly` cookie for 7 days. The first
mailbox to verify a BSP is bound to it. `/order` and `/api/orders` require the session, and the order's
BSP always comes from the session, never from the form.

## Before going live

- Set `DEMO_ORDERS` to `false` in `lib/site.ts`. While `true`, a backend failure still shows
  "Order placed!" but nothing is saved.
- Set `metadataBase` in `app/layout.tsx` to the real domain (social share image).
- Fill in Instagram / WhatsApp / email and the team list in `lib/site.ts`.

## Brand

Colours, type and logo rules are in `brand/logo-kit/brand/`. The CSS variables are defined once, in
`app/globals.css`. Font: Fredoka. Use the logo SVGs unmodified.
