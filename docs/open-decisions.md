# Open product decisions

Do not invent answers in code. When a feature needs one of these, add a short note here and keep the implementation as a typed placeholder.

## Identity and accounts

- How a person signs in (if at all in v1), and whether a Host is a separate account type or a capability on a User.
- What appears on **Profile** beyond a display name.
- Whether identity verification exists, and when it is required. Not in this scaffold.

## Gigs, roles, and slots

- Can one Gig mix volunteer and paid **Roles**, or is `kind` only on the Gig?
- Do **Slots** belong to a Role, to a Gig, or either?
- Location model (place name vs address vs area vs remote).
- Time zones, recurring gigs, and multi-day gigs.
- Gig lifecycle (draft, open, filled, completed, cancelled) — values are not finalized.
- Capacity: overbooking, waitlists, Host-only edits after publish.

## Applying and matching

- Application statuses and who can accept/decline.
- Whether Volunteers apply, are invited, or both.
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
- Empty states and what a Host sees vs a Volunteer/Participant.

## Post

- Minimum fields to create a Gig.
- Whether Post is Host-only.

## Platform shape

- Notifications.
- Moderation and safety reporting.
- Internationalization and default locale.

## Visual

- Pixel-level UI waits on reference boards ([`ui-reference.md`](./ui-reference.md)).
- Icon set, display type, photography style, and desktop nav treatment are unset.
