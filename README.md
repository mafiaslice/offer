# Offer

**Offer** is a volunteer-first platform for finding trusted hands for events, projects, community work, and paid gigs.

Hosts create **Gigs** with **Roles** and available **Slots**. Volunteers and participants discover gigs, apply or join, and show up with clear instructions.

## Priority

1. Volunteer gigs
2. Paid gigs

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · ESLint

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

Auth, payments, database, messaging backends, QR check-in, and identity verification are **not** implemented.

## Layout

```
app/           App Router pages and tokens (globals.css)
components/    App shell, nav, placeholder gig card
lib/           Nav config
types/         Domain models (User, Host, Gig, …)
docs/          Product source of truth, UI tokens, open decisions
public/        Static assets
.env.example   Future env placeholders (no secrets)
```

## Docs

- [`docs/offer-source-of-truth.md`](docs/offer-source-of-truth.md) — product vocabulary and scope
- [`docs/ui-reference.md`](docs/ui-reference.md) — visual direction and tokens
- [`docs/open-decisions.md`](docs/open-decisions.md) — unresolved product questions

## Status

Workspace scaffolded. Core product features (auth, payments, database, messaging, QR check-in) are not wired yet. Pixel-level UI waits on design reference boards.
