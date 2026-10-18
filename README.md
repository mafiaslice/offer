# Offer

**Offer** is a volunteer-first platform for finding trusted hands for events, projects, community work, and paid gigs.

Hosts create **Gigs** with **Roles** and available **Slots**. Volunteers and participants discover gigs, apply or join, and show up with clear instructions.

## Priority

1. Volunteer gigs
2. Paid gigs

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · ESLint · Postgres (Drizzle) · email/password sessions

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:migrate
npm run seed:demo
```

Dev server: [http://localhost:3000](http://localhost:3000) — `/` is the landing page. The app opens at `/discover`.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Landing page |
| `/discover` | Find gigs (volunteer-first) |
| `/my-gigs` | Gigs you host or joined |
| `/post` | Create a Gig |
| `/messages` | Conversations |
| `/profile` | Your profile |
| `/check-in/[token]` | Gig attendance (QR landing) |

Payments, SMS, and identity verification are **not** implemented. In-app Host↔applicant threads and v1 QR check-in/out are. Auth and Postgres use `DATABASE_URL` when it is set; otherwise the demo adapter keeps `npm run build` working. `/post` shows an in-page sign-in gate when the database is configured and you are signed out. `/check-in/[token]` still requires a session in that case.

## Local with Postgres

Without `DATABASE_URL` the app uses the demo adapter (`meta.source: "demo-adapter"`) and Discover shows in-repo fixtures. When `DATABASE_URL` is set, Discover reads Postgres only — an empty database shows **Be the first to post a volunteer gig.** with a Post a Gig button, not the demo catalog.

1. Create a Postgres database (local or Railway).
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and `AUTH_SECRET`.
3. `npm run db:migrate`
4. `npm run dev` and create an account at `/auth` with email and password.
5. Optional starter gigs:

```bash
npm run seed:demo
```

Phone SMS stays gated. There is no external SMS provider. Railway deploy steps: [`docs/RAILWAY.md`](docs/RAILWAY.md). Data behavior: [`docs/data-layer.md`](docs/data-layer.md).

## Layout

```
app/           App Router pages, auth APIs, and health check
components/    App shell, Discover, Post, My Gigs, auth
lib/           Data adapters, Drizzle client, session auth
db/migrations  Postgres schema (no RLS)
scripts/       Migrate and opt-in demo seed
types/         Domain models (User, Host, Gig, …)
docs/          Product source of truth, UI tokens, open decisions
public/        Static assets
.env.example   Env placeholders (no secrets)
```

## Docs

- [`docs/offer-source-of-truth.md`](docs/offer-source-of-truth.md) — product vocabulary and scope
- [`docs/ui-reference.md`](docs/ui-reference.md) — visual direction and tokens
- [`docs/open-decisions.md`](docs/open-decisions.md) — unresolved product questions
- [`docs/data-layer.md`](docs/data-layer.md) — Postgres setup and adapter behavior
- [`docs/RAILWAY.md`](docs/RAILWAY.md) — Railway env vars, migrate, and health check
- [`docs/e2e-walkthrough.md`](docs/e2e-walkthrough.md) — local click path to verify Discover → detail → apply → My Gigs → Messages → Post → Profile
- [`docs/icons.md`](docs/icons.md) — Rune icon source and mapping

## Status

Auth + Postgres are wired when `DATABASE_URL` is present. In-app Host↔applicant messaging and v1 QR check-in/out are live when env is set. Payments and identity verification are not. Pixel-level UI waits on design reference boards.
