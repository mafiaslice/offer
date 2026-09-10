# Data layer

The app uses an adapter so CI and local `npm run build` work without credentials.

| Condition | `meta.source` | Behavior |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set | `supabase` | Auth cookies + Postgres via RLS |
| Either public env var is missing | `demo-adapter` | In-repo fixtures; writes are not durable |

Reads go through `lib/data`. Writes (create gig, apply, host accept/decline) go through the same adapters and the App Router APIs:

- `GET /api/gigs` — `q`, `category`, `kind`
- `GET /api/gigs/[slug]`
- `POST /api/gigs` — signed-in host (any authenticated user)
- `POST /api/applications`
- `PATCH /api/applications/[id]` — `accepted` \| `declined` \| `withdrawn`
- `GET /api/my-gigs`
- `GET` / `PATCH /api/me` — session profile; GET creates a profiles row if the signed-in user is missing one; PATCH merges fields

When Supabase is configured, persistence is Postgres (not `localStorage`). The demo adapter still uses `localStorage` only for join-state so the UI works in CI. `/post` redirects unsigned users to `/auth?next=/post`. Host accept/decline on My Gigs does the same on 401.

## Local with Supabase

1. Create a Supabase project.
2. Run the SQL in `supabase/migrations/20260910000001_init_offer_schema.sql` (SQL editor or `supabase db push`).
3. Auth → Providers → **Email** on. Enable email OTP / magic links. Confirm email can be off for local testing.
4. Auth → URL configuration:
   - Site URL: `http://localhost:3000`
   - Redirect: `http://localhost:3000/auth/callback`
5. Copy Project URL and anon/publishable key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6. Restart `npm run dev`. Sign in at `/auth` with email. Click the magic link or enter the 6-digit code.
7. Optional demo rows (after a profile exists):

```bash
npm run seed:demo
```

`npm run seed:demo` reads `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` only. Do not commit that key. Without it:

```bash
psql "$DATABASE_URL" -f scripts/seed-demo-gigs.sql
```

This is **opt-in** and is not required for build. When Supabase env is set and the database has no open gigs, Discover shows an empty state with a Post CTA — it does not fall back to the demo catalog.

Do not commit `.env.local`. The app uses anon + RLS. `SUPABASE_SERVICE_ROLE_KEY` is unused by the Next.js app (optional for the seed script only).

Phone SMS needs Twilio on the project. Keep `NEXT_PUBLIC_SUPABASE_SMS_AUTH` unset until that is configured; the phone UI stays visible and gated.

## Technical choices (not product answers)

- Host is `gigs.host_user_id` → `profiles.id`. No `hosts` table.
- v1 `POST /api/gigs` inserts `status = open` so the gig is discoverable. Draft/publish confirmation is still open.
- Application statuses in the database: `pending`, `accepted`, `declined`, `withdrawn`.
- Cover photos are not uploaded in this slice; UI keeps the gradient `cover_tone`.
- No payment provider. Paid gigs store incentive text only.
