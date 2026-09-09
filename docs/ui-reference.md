# UI reference

Visual **matching** waits for design reference boards. This repo only establishes tokens, type, and a structural app shell. Do not treat placeholder screens as pixel-perfect product UI.

## Direction (until boards exist)

- Palette: purple / black / lavender / white
- Rounded cards
- Image-led gig cards
- Soft gradients
- Mobile-first
- Rounded sans-serif for UI; display type sparingly
- Bottom navigation (mobile): Discover, My Gigs, Messages, Profile, Post

**Do not use forest-green.**

## Tokens

Centralized in [`app/globals.css`](../app/globals.css) as CSS variables and Tailwind v4 `@theme` colors.

| Token | Hex | CSS variable | Tailwind |
| --- | --- | --- | --- |
| Purple | `#8E52FF` | `--offer-purple` | `purple` |
| Lavender canvas | `#F3F4F9` | `--offer-lavender` | `lavender` |
| Secondary purple-gray | `#7F7089` | `--offer-purple-gray` | `purple-gray` |
| Subtle border gray | `#DADADA` | `--offer-border` | `border` |
| Black | `#000000` | `--offer-black` | `black` |
| White | `#FFFFFF` | `--offer-white` | `white` |
| Error pink | `#FF4DA3` | `--offer-error` | `error` |
| Success green | `#6CD23E` | `--offer-success` | `success` |
| Turquoise | `#49D7B8` | `--offer-turquoise` | `turquoise` |
| Yellow | `#F5CC00` | `--offer-yellow` | `yellow` |

Success green (`#6CD23E`) is a status color only. It is not brand fill and is not forest-green.

## Type

- UI: Plus Jakarta Sans (rounded sans), via `next/font`
- Display: same family, heavier weight, used rarely (page titles)
- Do not introduce a second display face until reference boards specify one

## Shell

- Lavender page canvas, white rounded cards, purple for primary actions and the current nav item
- Mobile: bottom nav
- Larger viewports: the same destinations in a side nav (structural, not a designed desktop mock)

## Waiting on reference boards

Document here when boards land (file names, links, or dates). Until then:

- No pixel-perfect reconstruction from memory
- No extra brand colors
- Placeholder gig imagery is a gradient block, not stock photography pretending to be product photography
