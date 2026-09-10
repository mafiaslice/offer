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

- Message threads: Host↔applicant, Host↔all participants, or something else.
- What is in-app vs email/SMS. No messaging backend in this scaffold.

## Showing up

- Check-in method (QR and related flows are not implemented).
- Who can check whom in, and whether a Slot is required on `CheckIn`.

## Trust

- Rating scale, who can rate whom, and whether ratings are public.
- What “trusted hands” means operationally (repeat Hosts, attendance, something else).

## Discover

- Ranking, filters, geography, and whether volunteer gigs are visually/algorithmically first.
- **Decided (v1 empty):** when Supabase env is set and there are no open gigs, Discover shows a live empty state with a Post CTA. Demo fixtures are only used when Supabase env is missing.
- What a Host sees vs a Volunteer/Participant beyond that empty state.

## Post

- Minimum fields to create a Gig. v1 requires name, summary, place, date, and start time.
- **Decided:** Post is not a separate Host-only account. It requires being signed in when Supabase is configured.

## Platform shape

- Notifications.
- Moderation and safety reporting.
- Internationalization and default locale.

## Visual

- Pixel-level UI waits on reference boards ([`ui-reference.md`](./ui-reference.md)).
- Icon set, display type, photography style, and desktop nav treatment are unset.

## Data

- **Decided:** Supabase is the production auth + Postgres provider. See [`data-layer.md`](./data-layer.md).
