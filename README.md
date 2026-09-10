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
```

Dev server: [http://localhost:3000](http://localhost:3000) — `/` redirects to `/discover`.

## Routes (placeholders)

| Path | Purpose |
| --- | --- |
| `/discover` | Find gigs (volunteer-first) |
| `/my-gigs` | Gigs you host or joined |
| `/post` | Create a Gig |
| `/messages` | Conversations |
| `/profile` | Your profile |

Payments, messaging backends, QR check-in, and identity verification are **not** implemented. Auth and Postgres use Supabase when env vars are set; otherwise the demo adapter keeps `npm run build` working.

## Local with Supabase

Without credentials the app uses the demo adapter (`meta.source: "demo-adapter"`).

1. Create a Supabase project and run `supabase/migrations/20260910000001_init_offer_schema.sql`.
2. Enable Email auth. Add `http://localhost:3000/auth/callback` as a redirect URL.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. `npm run dev` and sign in at `/auth` with email OTP or the magic link.

Optional demo rows: `scripts/seed-demo-gigs.sql` (opt-in; not required for build). Phone SMS stays gated until Twilio is configured. Full steps: [`docs/data-layer.md`](docs/data-layer.md).

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

## Status

Auth + Postgres are wired to Supabase when env vars are present. Payments, messaging, QR check-in, and identity verification are not. Pixel-level UI waits on design reference boards.
