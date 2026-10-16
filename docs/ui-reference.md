# UI reference

Offer uses the Aeris glass style on Offer’s purple and lavender brand. The weather-app layout from that spec is not used. Rune icons stay the glyph set.

## Direction

- Surfaces: deep purple-black `#181427`, `#201938`, `#211A35`, with white text
- Frosted cards: 12–24px blur, 1px `#E7E2EB` at low opacity, shadow `rgba(53,36,86,0.15) 0 20px 25px -5px`
- Featured cards (gig cards, volunteer card, Star of the month) use a hairline gradient shell: `linear-gradient(135deg, #5646BC 0%, #8870DD 55%, #D98AB5 100%)`
- Radii: 16px and 24px, pills at 9999px
- Mobile first, bottom nav on phones. From the `lg` breakpoint, a sidebar and a multi-column gig grid
- Motion: 150ms, `cubic-bezier(0.4, 0, 0.2, 1)`, and `prefers-reduced-motion` collapses it

**Do not use forest-green.** Do not ship the spec’s muted `#81798B` or white-on-`#8E52FF` for small text. Those pairs miss WCAG AA on these surfaces.

## Tokens

Centralized in [`app/globals.css`](../app/globals.css) as CSS variables and Tailwind v4 `@theme` colors.

| Token | Hex | CSS variable | Tailwind | Use |
| --- | --- | --- | --- | --- |
| Purple | `#8E52FF` | `--offer-purple` | `purple` | Brand mark, glows, large accents |
| Purple fill | `#6B2FE0` | `--offer-purple-fill` | `purple-fill` | Buttons and chips with white text |
| Purple ink | `#C4A6FF` | `--offer-purple-ink` | `purple-ink` | Small purple text and links |
| Page | `#181427` | `--offer-ink` | `ink` | Page background |
| Surface | `#201938` | `--offer-surface` | `surface` | Raised panels |
| Raised | `#211A35` | `--offer-raised` | `raised` | Inset card faces |
| Muted | `#B7AEC4` | `--offer-purple-gray` | `purple-gray` | Secondary text. Lifted from `#81798B` so it clears AA on glass |
| Lavender | `#F3F4F9` | `--offer-lavender` | `lavender` | Brand mix only, not the page canvas |
| Error pink | `#FF4DA3` | `--offer-error` | `error` | |
| Success green | `#6CD23E` | `--offer-success` | `success` | Status only, not a brand fill |
| Turquoise | `#49D7B8` | `--offer-turquoise` | `turquoise` | |
| Yellow | `#F5CC00` | `--offer-yellow` | `yellow` | |

Success green (`#6CD23E`) is a status color only. It is not brand fill and is not forest-green.

## Type

- UI: Inter, via `next/font` on the root layout
- Display headings: weight 400, tracking `-0.025em`, up to 60px
- Body: 12–14px. Labels: 14px

## Shell

- Dark glass canvas. Mobile header plus bottom nav. Desktop (`lg`) sidebar with the same destinations
- Discover gig grid: one column, two from `md`, three from `xl`

Placeholder gig imagery is a gradient block, not stock photography.
