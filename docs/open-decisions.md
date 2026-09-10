# Open product decisions

Do not invent answers in code. When a feature needs one of these, add a short note here and keep the implementation as a typed placeholder.

## Identity and accounts

- **Decided:** Host is a **capability on User**. Anyone signed in can post a Gig. There is no separate Host account type.
- **Decided:** v1 auth is **Supabase email magic link / OTP**, with session cookies for SSR. Phone SMS is optional and gated until Twilio is configured on the project.
- What appears on **Profile** beyond a display name (and optional bio / intent collected at signup).
- Whether identity verification exists, and when it is required. Not in this scaffold.

## Gigs, roles, and slots

- Can one Gig mix volunteer and paid **Roles**, or is `kind` only on the Gig?
- Do **Slots** belong to a Role, to a Gig, or either? Schema allows an optional `role_id` on a slot.
- Location model (place name vs address vs area vs remote). v1 stores a place label and in-person/remote.
- Time zones, recurring gigs, and multi-day gigs.
- Gig lifecycle (draft, open, filled, completed, cancelled) — values exist in the schema. **v1 create publishes as `open`** so the gig is discoverable; confirmation-before-publish is still open.
- Capacity: overbooking, waitlists, Host-only edits after publish.

## Applying and matching

- **Decided (v1 storage):** application statuses are `pending`, `accepted`, `declined`, `withdrawn`. Applicants manage their own rows; hosts accept/decline on their gigs.
- Whether Volunteers apply, are invited, or both. v1 is apply-only.
- What **Participant** means relative to Volunteer on a paid vs volunteer gig.
- Whether matching can happen without any payment step on paid gigs (product forbids mandatory payment *before* matching as a default; paid-gig settlement is still unspecified).

## Paid gigs

- How payment is agreed, captured, and released (no provider in this repo).
- Whether Offer ever holds funds (escrow-first is explicitly out).
- Host payout vs Volunteer/Participant payout, taxes, and disputes.

## Communication

- **Decided (v1):** one 1:1 Host↔applicant thread per `(gig_id, host_user_id, participant_user_id)`. Group chat / Host↔all participants is still open.
- **Decided (v1):** threads are created when someone opens a conversation from Messages, My Gigs, or after applying. Apply and accept do not auto-insert a thread.
- **Decided (v1):** messaging is allowed while an application exists and is not withdrawn (including pending).
- What is copied out-of-app (email vs SMS). No SMS. Email is auth-only in this slice.
- Message edit/delete, attachments, read receipts beyond a last-read timestamp, and moderation reporting.
- Online/presence is demo-only; live presence is unset.

## Showing up

- **Decided (v1):** attendance is one `CheckIn` row per `(gig, user)` with `checked_in_at` and optional `checked_out_at`. Slot on the row is optional.
- **Decided (v1):** the QR is a signed token URL `/check-in/[token]` tied to a **Gig** (optional Slot can be encoded in the token). It identifies the gig; it is not a capability token. Check-in still requires a signed-in **Host** (on behalf of an accepted participant) or an **accepted** participant checking themselves in.
- **Decided (v1):** Hosts show the QR on My Gigs and on gig detail for gigs they host. Scanning with a phone camera opens the check-in page.
- Re-check-in after checkout updates the same row (new `checked_in_at`, clears `checked_out_at`).
- **Not v1:** per-application tokens, geofence, photo proof, no-show penalties, offline scan queues, or feeding attendance into ratings / “trusted hands”.
- Whether a Slot is required, whether checkout is mandatory, and whether the Host must be physically present.

## Trust

- Rating scale, who can rate whom, and whether ratings are public.
- What “trusted hands” means operationally (repeat Hosts, attendance, something else).
- **Not v1:** Profile does not show a numeric trust score. Applicant rows may still say “New to Offer” as copy, not a ratings schema.

## Discover

- Ranking, filters, geography, and whether volunteer gigs are visually/algorithmically first.
- **Decided (v1 empty):** when Supabase env is set and there are no open gigs, Discover shows a live empty state with a Post CTA. Demo fixtures are only used when Supabase env is missing.
- What a Host sees vs a Volunteer/Participant beyond that empty state.
- Ranking still does not use geography or volunteer-first algorithms — volunteer cards are listed first in the Discover layout only.

## Gig detail

- **Decided (v1):** gig detail is `title`, host, place, time, `summary` (used as about/body), roles, slots/spots, and apply/join. There is no separate `body` column; adapters map `gigs.summary` to both summary and about.
- **Decided (v1 signed-out apply):** with Supabase configured, the join/apply CTA routes to `/auth?next=/gigs/[slug]`. The demo adapter still lets you apply without a session.
- **Decided (v1 missing data):** unknown slugs and adapter failures render an empty state on the gig page. They do not use the Next.js error overlay as the primary UI.
- Whether a missing description should block apply (v1 still allows “General support”).

## Post

- Minimum fields to create a Gig. v1 requires name, summary, place, date, and start time.
- **Decided:** Post is not a separate Host-only account. It requires being signed in when Supabase is configured.
- **Decided (v1 walkthrough):** unsigned visitors see an in-page sign-in gate on `/post` (not a raw crash). After a successful create, the app goes to My Gigs.

## Profile

- What appears on **Profile** beyond a display name (and optional bio / intent collected at signup).
- **Decided (v1):** Profile always shows a display name (session name, demo name, or “Guest”). It does not invent a trust score or require identity verification.

## Platform shape

- Notifications.
- Moderation and safety reporting.
- Internationalization and default locale.

## Visual

- Pixel-level UI waits on reference boards ([`ui-reference.md`](./ui-reference.md)).
- Icon set, display type, photography style, and desktop nav treatment are unset.

## Data

- **Decided:** Supabase is the production auth + Postgres provider. See [`data-layer.md`](./data-layer.md).
