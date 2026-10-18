# Local end-to-end walkthrough

Volunteer-first click path for localhost. Payments and identity verification are out of scope. Auth polish is out of scope — only the gates that keep the walkthrough from crashing.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000/discover](http://localhost:3000/discover). `/` is the landing page. The app click path starts at Discover.

### Without DATABASE_URL

The **demo adapter** serves in-repo fixtures (`meta.source: "demo-adapter"`). Discover, gig detail, apply, My Gigs, Messages, Post, and Profile should all render without a session.

### With Postgres

Copy `.env.example` to `.env.local`, set `DATABASE_URL` and `AUTH_SECRET`, run `npm run db:migrate`, then optionally:

```bash
npm run seed:demo
```

Discover reads **Postgres only** when env is set. An empty database shows **Be the first to post a volunteer gig.**, not the demo catalog.

## Click path

1. **Discover** — **Volunteer Gigs** is the default tab and lists volunteer gigs only. **Paid Gigs** lists paid gigs only. Cards show host, place, time, and spots. **View details** opens `/gigs/[slug]`.
2. **Gig detail** — title, host, place, time, about/summary, roles, slots/spots, join/apply CTA. Missing fields show empty copy, not a Next error overlay. A stale slug shows “This gig isn't available”.
3. **Apply / join**
   - Signed in: pick a role, send. Success offers **My gigs** and **Message host**.
   - Signed out (Postgres): CTA is **Sign in to join this gig** and goes to `/auth?next=/gigs/[slug]`. No crash.
4. **Auth** — email and password. Copy on `/auth` matches the `next` path. After sign-in, return to that gig and apply.
5. **My Gigs** — hosted and applied/joined cards. **Message host** on joined gigs. **Message applicant** on the review list for hosted gigs. Hosted cards show the **check-in QR**. Unsigned visitors get a sign-in gate when Postgres is configured.
6. **Messages** — inbox, thread, composer. Empty inbox points at My Gigs. A missing thread is an empty state, not an infinite “Loading…”. Unsigned visitors get a sign-in gate.
7. **Post** — unsigned (Postgres): in-page sign-in gate. Signed in: create a volunteer gig (name, summary, place, date, start, roles, slots). Success lands on **My Gigs**. The gig also appears on Discover when it is `open`.
8. **Profile** — display name at minimum. Edit name/bio when signed in (or in the demo adapter). No fake trust score. Verification is documented as not in this version.

## What this walkthrough does not cover

- Payments, escrow, wallets
- Identity verification
- Phone SMS (gated; no SMS provider)
- Pixel-perfect UI (see `docs/ui-reference.md`)
