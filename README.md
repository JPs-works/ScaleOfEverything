# The Scale of Everything

An interactive journey from the Planck length to the edge of the observable universe:
sixty orders of magnitude, every object drawn at true relative size, one honest comparison at a time.

Built as a self-guided science-communication piece in the spirit of neal.fun's *Size of Life*
and the classic star-size-comparison videos: zoom out and the last object shrinks beside the
next until it is a dot; zoom in and it swells to fill the view.

## Features

- **Journey** — one continuous world. Scroll, drag, arrow keys or the rail move a camera along
  a log-scale ladder of 80 objects. The previous object stays visible at true scale (or is
  pinned with "far below one pixel" when it is not), and a ratio callout explains the jump.
- **Comparison voice** — every neighbouring pair gets a headline ("Jupiter is 11 times wider than
  Earth"), a how-many-fit line, and a familiar-object analogy ("If Earth were the size of a golf
  ball, Jupiter would be about the size of a house cat") generated from a verified library.
- **Compare** — pick any two objects; they are drawn side by side at a shared scale, with copies
  of the smaller tiled across the larger when the ratio allows.
- **Rail** — a scrubbable overview of the whole ladder, shaded by scale band, with a map-style scale bar.
- **Facts** — two verified facts and a size source per object; theoretical sizes are flagged.
- Shareable URLs (`#/journey/earth`, `#/compare/human/sun`), keyboard and touch support,
  reduced-motion support, screen-reader announcements, and an error boundary.

## Run

```sh
npm install
npm run dev        # http://localhost:5173/apps/scale-of-everything/
npm test           # unit tests for formatting, layout and comparison text
npm run build      # typecheck + production build into dist/
```

The app is served under `/apps/scale-of-everything/` (see `vite.config.ts`) so it can be embedded
on jakeparr.dev; it also runs standalone at that path in dev.

## Project layout

```
src/
  App.tsx                 state, input (wheel/keys/drag), URL sync, mode switching
  components/             Stage (world → screen), Rail, StoryPanel, TopBar, overlays
  hooks/useJourney.ts     continuous position with tween / spring / snap motion
  lib/layout.ts           one-world layout and camera math (log-space interpolation)
  lib/analogy.ts          headline, "how many fit" and familiar-object analogies
  lib/format.ts           units a science communicator would use
  lib/bands.ts            scale bands → backdrop tint and rail shading
  data/items.ts           the ladder: sizes in metres, facts, sources
  data/familiar.ts        everyday objects for analogies
  illustrations/art/      one flat SVG component per object (auto-registered)
```

## Data

Each object records the dimension people actually picture (height for a person or tower,
diameter for a planet or cell, width for a hair) and the source of that number. Values are
typical, rounded for reading, and were fact-checked against the ladder so that every
"N of these fit across that" claim is arithmetically true. Items marked *theoretical* are
limits or theoretical lengths rather than measured sizes (electron upper bound, Planck length,
the Oort Cloud's estimated extent, the disputed Hercules–Corona Borealis Great Wall).

## Illustrations

Every illustration lives in `src/illustrations/art/<id>.tsx` and exports `art: Illustration`
with an honest `aspect`. The artwork must span the full viewBox along the measured axis so the
on-screen size is exact; glows may spill slightly. In development, `#/art` shows a gallery and
`#/art/<id>` shows one object at 520, 160, 48 and 14 px with its bounding box outlined.
