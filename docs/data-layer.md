# Data layer

The app uses an adapter so CI and local `npm run build` work without credentials.

| Condition | `meta.source` | Behavior |
| --- | --- | --- |
| `DATABASE_URL` is set | `postgres` | Email/password session cookies + Postgres. Ownership is checked in server code. |
| `DATABASE_URL` is missing | `demo-adapter` | In-repo fixtures; writes are not durable |

Reads go through `lib/data`. Writes (create gig, apply, host accept/decline, messages, check-in/out) go through the same adapters and the App Router APIs:

- `GET /api/gigs` — `q`, `category`, `kind`
- `GET /api/gigs/[slug]`
- `POST /api/gigs` — signed-in host (any authenticated user)
- `POST /api/applications`
- `PATCH /api/applications/[id]` — `accepted` \| `declined` \| `withdrawn`
- `GET /api/my-gigs`
- `GET` / `PATCH /api/me` — session profile; GET creates a profiles row if the signed-in user is missing one; PATCH merges fields
- `POST /api/auth/sign-up` — `{ email, password }` creates a user, profile, and session cookie
- `POST /api/auth/sign-in` — `{ email, password }`
- `POST /api/auth/sign-out`
- `GET /api/healthz` — database reachability
- `GET /api/threads` — inbox + people you can start a 1:1 thread with (auth required when Postgres is configured)
- `POST /api/threads` — `{ applicationId }` or `{ gigSlug }`; opens or returns the Host↔applicant thread (does not auto-create on apply/accept)
- `GET /api/threads/[id]/messages` — messages in a thread; marks the viewer’s side read
- `POST /api/threads/[id]/messages` — `{ body }` send a message
- `GET /api/check-ins` — `token` or `gigSlug` (+ optional `slot`); Host sees roster + QR token; participants see their own row
- `POST /api/check-ins` — `{ token \| gigSlug, userId?, slotId? }` check in (self, or Host on behalf of an accepted participant)
- `POST /api/check-ins/checkout` — same body; sets `checked_out_at`

When `DATABASE_URL` is set, persistence is Postgres (not `localStorage`). The demo adapter still uses `localStorage` only for join-state and demo-sent messages so the UI works in CI. Gigs you create and applications you send in the demo adapter are written to `.next/cache` so Discover and My Gigs stay in sync during a local walkthrough (not durable product storage). Check-in writes in the demo adapter stay in server memory for that process. `/post` shows an in-page sign-in gate for unsigned visitors when Postgres is configured. `/check-in/[token]` redirects unsigned users to `/auth?next=…`. Host accept/decline on My Gigs does the same on 401. Messaging APIs return 401 until signed in.

## Local with Postgres

1. Create a database and set `DATABASE_URL` and `AUTH_SECRET` in `.env.local`. See [`RAILWAY.md`](./RAILWAY.md).
2. `npm run db:migrate` applies `db/migrations/0001_offer_schema.sql`.
3. Restart `npm run dev`. Create an account at `/auth` with email and password.
4. Optional starter gigs:

```bash
npm run seed:demo
```

This is **opt-in** and is not required for build. If no profile exists, the script creates a seed host. Seeded rows include roles (with descriptions), slots, and a fuller summary so gig detail feels real. When `DATABASE_URL` is set and the database has no open gigs, Discover shows **Be the first to post a volunteer gig.** with a Post a Gig button — it does not fall back to the demo catalog.

Do not commit `.env.local`. The app connects with `DATABASE_URL` and checks ownership in server code. There is no row level security.

Phone SMS is not available. The phone step stays visible and explains that SMS is not configured.

## Technical choices (not product answers)

- Host is `gigs.host_user_id` → `profiles.id`. No `hosts` table.
- v1 `POST /api/gigs` inserts `status = open` so the gig is discoverable. Draft/publish confirmation is still open.
- Application statuses in the database: `pending`, `accepted`, `declined`, `withdrawn`.
- Cover photos are not uploaded in this slice; UI keeps the gradient `cover_tone`.
- No payment provider. Paid gigs store incentive text only.
- Gig detail maps `gigs.summary` to both the short summary and the about/body. Role descriptions and slot windows come from `gig_roles` / `gig_slots` when present; the UI shows empty copy when they are missing.
- v1 messaging is **one 1:1 thread per** `(gig_id, host_user_id, participant_user_id)`. Participants read/write their thread; hosts also see threads on their gigs. Apply/accept does not insert a thread until someone opens the conversation.
- Unread is a last-inbound badge (not a full count). Online/presence is demo-only.
- v1 check-in is **one row per** `(gig_id, user_id)` with optional `slot_id`. The QR token is HMAC-signed (`CHECK_IN_SECRET`, with a demo fallback) and encodes the gig id. Hosts manage rows on their gigs; participants read/write their own after the host accepts them.
