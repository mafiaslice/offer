# Offer

**Offer** is a volunteer-first platform for finding trusted hands for events, projects, community work, and paid gigs.

Hosts create **Gigs** with **Roles** and available **Slots**. Volunteers and participants discover gigs, apply or join, and show up with clear instructions.

## Priority

1. Volunteer gigs
2. Paid gigs

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · ESLint · Supabase (auth + Postgres, optional for local/CI)

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm run seed:demo
```

Dev server: [http://localhost:3000](http://localhost:3000) — `/` redirects to `/discover`.

## Routes

| Path | Purpose |
| --- | --- |
| `/discover` | Find gigs (volunteer-first) |
| `/my-gigs` | Gigs you host or joined |
| `/post` | Create a Gig |
| `/messages` | Conversations |
| `/profile` | Your profile |
| `/check-in/[token]` | Gig attendance (QR landing) |

Payments, SMS, and identity verification are **not** implemented. In-app Host↔applicant threads and v1 QR check-in/out are. Auth and Postgres use Supabase when env vars are set; otherwise the demo adapter keeps `npm run build` working. `/post` shows an in-page sign-in gate when Supabase is configured and you are signed out. `/check-in/[token]` still requires a session in that case.

## Local with Supabase

Without credentials the app uses the demo adapter (`meta.source: "demo-adapter"`) and Discover shows in-repo fixtures. When Supabase env is set, Discover reads Postgres only — an empty database shows a **No gigs yet** state with a Post CTA, not the demo catalog.

1. Create a Supabase project and run the SQL in `supabase/migrations/` (schema, message threads, and check-ins).
2. Enable Email auth. Add `http://localhost:3000/auth/callback` as a redirect URL.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. `npm run dev` and sign in at `/auth` with email OTP or the magic link.
5. Optional demo rows after you have a profile:

```bash
npm run seed:demo
```

That reads `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` (never commit it). Without the key:

```bash
psql "$DATABASE_URL" -f scripts/seed-demo-gigs.sql
```

Phone SMS stays gated until Twilio is configured. Full steps: [`docs/data-layer.md`](docs/data-layer.md).

## Layout

```
app/           App Router pages, auth callback, and APIs
components/    App shell, Discover, Post, My Gigs, auth
lib/           Data adapters and Supabase clients
supabase/      Postgres migrations (RLS)
scripts/       Opt-in demo seed
types/         Domain models (User, Host, Gig, …)
docs/          Product source of truth, UI tokens, open decisions
public/        Static assets
.env.example   Env placeholders (no secrets)
```

## Docs

- [`docs/offer-source-of-truth.md`](docs/offer-source-of-truth.md) — product vocabulary and scope
- [`docs/ui-reference.md`](docs/ui-reference.md) — visual direction and tokens
- [`docs/open-decisions.md`](docs/open-decisions.md) — unresolved product questions
- [`docs/data-layer.md`](docs/data-layer.md) — Supabase setup and adapter behavior
- [`docs/e2e-walkthrough.md`](docs/e2e-walkthrough.md) — local click path to verify Discover → detail → apply → My Gigs → Messages → Post → Profile

## Status

Auth + Postgres are wired to Supabase when env vars are present. In-app Host↔applicant messaging and v1 QR check-in/out are live when env is set. Payments and identity verification are not. Pixel-level UI waits on design reference boards.
