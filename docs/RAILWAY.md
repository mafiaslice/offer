# Offer on Railway

Offer runs as one Railway web service plus Railway Postgres. There is no Supabase project. Auth is email and password stored in Postgres. Sessions are httpOnly cookies signed with `AUTH_SECRET`.

## Services

1. **Postgres** — Railway Postgres plugin. Copy its `DATABASE_URL` onto the web service.
2. **Web** — this repo. Railpack builds it (`railway.json`). The service listens on `0.0.0.0` and `PORT`.

`railway.json` runs `npm run db:migrate` before each deploy and checks `GET /api/healthz`.

## Environment variables

Set these on the web service. Do not commit real values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Railway Postgres connection string. Without it the app stays on the demo adapter. |
| `AUTH_SECRET` | Yes, when `DATABASE_URL` is set | HMAC secret for session cookies. `openssl rand -base64 32`. `/api/healthz` returns 503 if this is missing while the database is configured. |
| `CHECK_IN_SECRET` | No | HMAC secret for QR check-in tokens. A fixed demo fallback is used when unset. Set a unique value in production. |
| `AUTH_COOKIE_SECURE` | No | `true` or `false`. Defaults to `true` when `NODE_ENV=production`. Railway HTTPS should leave this unset. Set `false` only for local `next start` over HTTP. |
| `SEED_HOST_EMAIL` | No | Email for the starter-gig host created by `npm run seed:demo` when no profile exists. Defaults to `seed-host@offer.local`. |
| `SEED_HOST_PASSWORD` | No | Password for that seed host. If unset, the script generates one and prints it once. |
| `PORT` | Set by Railway | `npm start` binds `next start` to this port. |

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are unused. Remove them from the service.

## Commands

```bash
npm install
npm run db:migrate    # pre-deploy: apply db/migrations
npm run build         # next build
npm run start         # next start --hostname 0.0.0.0 --port $PORT
npm run seed:demo     # optional starter gigs (not part of pre-deploy)
```

Local Postgres:

```bash
createdb offer
export DATABASE_URL=postgresql://localhost:5432/offer
export AUTH_SECRET=$(openssl rand -base64 32)
npm run db:migrate
npm run seed:demo
npm run dev
```

Health check: `GET /api/healthz` returns `{ "ok": true, "database": "ok" }` when Postgres answers and `AUTH_SECRET` is set. It returns 503 when the database is configured but unreachable, or when the secret is missing.

## What changed from Supabase

- Tables live in `db/migrations/0001_offer_schema.sql` and are queried with Drizzle (`lib/db/schema.ts`, `lib/data/postgres-adapter.ts`).
- Accounts are `users` (email + bcrypt password hash) and `sessions`. Profiles still hang off the user id.
- Sign-up, sign-in, and sign-out are `/api/auth/sign-up`, `/api/auth/sign-in`, and `/api/auth/sign-out`.
- Ownership that used to be Row Level Security is enforced in the Postgres adapter (open gigs are public; hosts manage their gigs; applicants manage their own applications; thread and check-in reads are limited to the people on that gig).

## Not ported

- Supabase email OTP and magic links. Sign-in is email + password. There is no outbound email provider.
- Phone SMS login. The phone step stays on the auth screen and explains that SMS is not configured.
- Supabase Row Level Security policies and the `auth.users` trigger. The sign-up transaction inserts the profile. The database role used by `DATABASE_URL` can read and write these tables; the app must keep doing the ownership checks.
- `supabase/migrations` SQL. The ported schema is `db/migrations`. Do not run the old files against Railway.

The demo adapter still serves in-repo fixtures when `DATABASE_URL` is unset, so `npm run build` works without a database.
