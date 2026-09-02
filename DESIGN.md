# Design system — "Field Notebook"

The portfolio is an engineer's field notebook rendered as a living document:
warm paper, editorial serif display, and monospace "telemetry." Energy comes
from scale, one electric-indigo signal, and real running product embedded live —
not from dark-mode neon or a grid of identical cards.

## Tokens (`src/index.css`)

**Color**
- Paper ground `--paper #f5f4ef` (variants `--paper-2/-3`, card `--card #fbfaf6`)
- Ink `--ink #0b0b0c` (`--ink-2/-3/-4` for descending emphasis)
- Signal `--indigo #4b3bff` (`--indigo-2` hover, `--indigo-ink` on light,
  `--indigo-wash` fill, `--indigo-line` border)
- Inverted band `--night #0b0b0c` with `--on-night` text, used for the Marcus
  case study and the Contact close only — rhythm, not decoration.
- Data-viz only: `--lime --amber --water` (browser dots, live pulse).

**Type**
- Display: `Instrument Serif` (`--serif`) — oversized, often italic for accents.
- Body/UI: `Geist` (`--sans`).
- Telemetry / data / labels: `Geist Mono` (`--mono`) — used only for real
  measurements, codes, and metadata, never as decoration.

**Motion**: `--ease-out-expo` for reveals; entrance via framer-motion
`useInView` (once), hover via transform/opacity (no layout animation).

## Conventions
- No eyebrow/kicker above headings. `.sec-head` pairs a mono `/ label` inline
  with a large serif `.sec-title`; headings carry their own weight.
- Buttons: `.btn` + `.btn-primary` (indigo) / `.btn-ghost`.
- `.pill` for tech tags; `.browser-frame` for the live iframe product previews.
- Browser surfaces are themed: selection, scrollbar, focus ring, `::marker`.
- Custom cursor (`.cursor-dot`) only on `pointer: fine`.

## Structure (`src/pages/Home.tsx`)
Hero (3D energy core) → About → Flagship live previews → Marcus Studio (dark) →
Skills → Knowledge map → Experience → Wins → Credentials → Contact (dark).
Chat + knowledge-graph modals are lazy-loaded.

The full direction contract lives as an HTML comment in `index.html`.
