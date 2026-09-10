# Offer — source of truth

Offer is a **single platform for finding trusted hands**.

This document is the product vocabulary and scope for the workspace. Code, copy, and routes must follow it. Do not introduce competing product names, roles, or flows.

## Priority

1. **Volunteer gigs**
2. **Paid gigs**

Volunteer is the default framing. Paid gigs are a second path, not the primary story, onboarding, or navigation default.

## Vocabulary

Use **only** these terms:

| Term | Meaning in this workspace |
| --- | --- |
| **Host** | The person or group who creates a gig and defines roles and slots. |
| **Gig** | A dated (or otherwise scheduled) need for trusted hands — volunteer or paid. |
| **Role** | A named part on a gig (what someone would do). |
| **Slot** | An available time/capacity window on a gig (when/how many). |
| **Volunteer** | Someone filling a volunteer gig role/slot. |
| **Participant** | Someone taking part in a gig (including paid gigs). Prefer this over inventing extra role names. |
| **Paid gig** | A gig that includes payment. Secondary to volunteer gigs. |

Typed models live in [`types/`](../types/) (`User`, `Host`, `Gig`, `GigRole`, `GigSlot`, `Application`, `Message`, `CheckIn`, `Rating`). Those types are structural; they are not a product spec. Unresolved behavior belongs in [`open-decisions.md`](./open-decisions.md).

## Do not use

Do not name, model, or ship UI around:

- Requester
- Helper
- Offer as an individual task (the product is Offer; a unit of work is a **Gig**)
- Rello
- Forest-green branding
- Paid-first as the primary experience
- Escrow-first
- Mandatory payment before matching
- CV / recruiter flows
- In-kind payments
- Wallets
- Group offers
- Subscriptions
- Business accounts
- Social networking features

## This scaffold does not include

These stay out of scope (placeholders and types only):

- Identity verification
- Payments, escrow, wallets
- Messaging backends
- QR / check-in implementation
- Live discover ranking

Auth and Postgres are Supabase when env is set; otherwise a demo adapter. See [`data-layer.md`](./data-layer.md) and [`open-decisions.md`](./open-decisions.md).
