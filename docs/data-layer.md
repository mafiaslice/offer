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
- `GET` / `PATCH /api/me`

When Supabase is configured, persistence is Postgres (not `localStorage`). The demo adapter still uses `localStorage` only for join-state so the UI works in CI.

## Local with Supabase

1. Create a Supabase project.
2. Run the SQL in `supabase/migrations/20260910000001_init_offer_schema.sql` (SQL editor or `supabase db push`).
3. Auth → Providers → **Email** on. Enable email OTP / magic links. Confirm email can be off for local testing.
4. Auth → URL configuration:
   - Site URL: `http://localhost:3000`
   - Redirect: `http://localhost:3000/auth/callback`
5. Copy Project URL and anon/publishable key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6. Restart `npm run dev`. Sign in at `/auth` with email. Click the magic link or enter the 6-digit code.
7. Optional demo rows: after you have a profile, run `scripts/seed-demo-gigs.sql`. This is **opt-in** and is not required for build.

Do not commit `.env.local`. `SUPABASE_SERVICE_ROLE_KEY` is unused by the app (anon + RLS).

Phone SMS needs Twilio on the project. Keep `NEXT_PUBLIC_SUPABASE_SMS_AUTH` unset until that is configured; the phone UI stays visible and gated.

## Technical choices (not product answers)

- Host is `gigs.host_user_id` → `profiles.id`. No `hosts` table.
- v1 `POST /api/gigs` inserts `status = open` so the gig is discoverable. Draft/publish confirmation is still open.
- Application statuses in the database: `pending`, `accepted`, `declined`, `withdrawn`.
- Cover photos are not uploaded in this slice; UI keeps the gradient `cover_tone`.
- No payment provider. Paid gigs store incentive text only.
