# Data layer

The current app uses a small display repository in `lib/gig-data.ts` so the UI can be built and tested without choosing a production database prematurely.

`GET /api/gigs` is the first API boundary. It supports:

- `q` — search title, host, location, and category
- `category` — Events, Community, Hospitality, or Projects
- `kind` — Volunteer, Paid gig, or all

The response includes `meta.source: "demo-adapter"` intentionally. It is not persistent storage and must be replaced with the selected database adapter before launch. No production database provider, credentials, or migrations are assumed by this repository.
