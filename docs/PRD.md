# StickNstay: Product Requirements Document (PRD)

Status: Draft v1. Decisions below come from the founder conversation and are the source of truth.

## 1. Product
Fridge magnet with a sticker layer, sold on the IBS Mumbai campus.

| Variant | Price | Notes |
|---|---|---|
| Basic | Rs 30 | Ready-made design (placeholders for now) |
| Custom | Rs 40 | Customer uploads own image |

- Size: 5 x 7 inches (both variants).
- Payment: Cash on Delivery only. No payment gateway.

## 2. Who can buy
- Only verified batchmates. Seniors are excluded.
- Verification: the BSP number (unique ID issued by the college) must exist in an allowlist table loaded by the admin.
- Outside orders are allowed, but only from a verified student.

## 3. Customer flow
1. **Landing page** (Apple-style): hero, the two variants with prices, how it works, order button.
2. **Order form:**
   - Name (required)
   - Mobile, 10-digit Indian number (required)
   - BSP number (required, checked against the allowlist)
   - Email (optional, for a confirmation mail)
   - Variant: Basic or Custom
   - Quantity (1 to 5)
   - Image upload (required only for Custom: JPG/PNG/WEBP, max 10 MB)
   - Note / delivery spot (optional)
3. **Submit** then the **Thank You page** showing the order code, total and "Pay cash on delivery".
4. **Emails:** the admin gets a mail for every new order. The customer gets one if they gave an email.

## 4. Business rules
- BSP must be in the allowlist, otherwise: "BSP number not found. Contact us."
- **Limit: 5 magnets per BSP per day** (IST calendar day, counted across Basic and Custom). Exceeding it is rejected with a clear message.
- Total = quantity x price. Prices are stored in the database, never trusted from the browser.
- Order code format: `SNS-XXXXXX` (random, unguessable).
- Status lifecycle: `new` > `confirmed` > `delivered` or `cancelled`.

## 5. Admin dashboard (`/admin`)
- Login with Supabase Auth (email + password). Admins only.
- Orders table: filter by status, search by name, BSP or code. Update status.
- View and download a custom image (private storage, short-lived signed URL).
- Stats: orders today, total revenue (delivered), counts by variant.
- BSP allowlist: bulk import via CSV, add or remove a BSP.
- Export orders to CSV.

## 6. Security (every page, not only admin)
- Supabase **Row Level Security** on all tables. The public client can never read orders or the allowlist.
- All writes go through a server-side route (Next.js Route Handler) using the service key, which is never sent to the browser.
- Server-side validation with Zod on every input. The client-side checks are only for convenience.
- The BSP check happens on the server. The allowlist is never exposed, and a not-found response does not reveal other BSPs.
- Rate limiting on the order endpoint (per IP and per BSP) to stop brute-forcing BSP numbers.
- Private storage bucket for uploads. Verify the file type by magic bytes, not just the extension. Rename files on upload.
- Security headers (CSP, HSTS, X-Frame-Options), HTTPS only, secrets in env vars only.
- Admin routes protected by middleware plus a server-side session check.
- Error messages are friendly to users and detailed only in server logs.

## 7. Data model (Supabase / Postgres)
- `bsp_allowlist(bsp text pk, active bool default true)`
- `orders(id uuid pk, code text unique, bsp text, name text, mobile text, email text null, variant text check in ('basic','custom'), qty int check 1..5, unit_price int, total int, image_path text null, note text null, status text default 'new', created_at timestamptz)`
- `settings(key pk, value)` holds prices and the daily limit, so they can change without code.
- Daily limit check: sum(qty) of orders for the BSP since IST midnight, excluding cancelled, plus the new qty, must be at most 5.
- The admin is a Supabase Auth user flagged in an `admins` table.

## 8. Design direction (Apple-inspired)
- Lots of white space, large SF-style type (Inter / system font stack), tight tracking.
- Soft shadows, rounded 20-28px cards, subtle glass blur on the nav.
- Smooth spring animations and scroll reveals (Motion), with `prefers-reduced-motion` respected.
- A product mockup of the magnet on a fridge (placeholder art for now).
- Mobile first (most students will order from a phone), light and dark mode.
- Accessible: WCAG AA contrast, keyboard navigation, labelled inputs.

## 9. Tech stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Storage)
- Zod for validation, Resend for email
- Deploy on Vercel

## 10. Pages
`/` landing, `/order` form, `/thank-you/[code]`, `/admin/login`, `/admin` (orders), `/admin/allowlist`

## 11. Build phases
1. Scaffold, design system, landing page
2. Supabase schema, RLS, allowlist
3. Order form, server validation, daily limit, upload
4. Thank You page and emails
5. Admin login, dashboard, CSV import and export
6. Security review, mobile polish, deploy

## 12. Out of scope (v1)
Online payment, delivery tracking, user accounts for customers, real product photos.

## 13. Open items
- [ ] BSP list from founder (CSV, one BSP per row).
- [ ] Admin email address(es) for notifications.
- [ ] Interpretation check: "5 per day" is treated as 5 magnets per BSP per day.
- [ ] Real basic designs to replace the placeholders.
- [ ] Domain name.
