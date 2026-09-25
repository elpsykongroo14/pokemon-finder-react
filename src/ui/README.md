<!-- src/ui/README.md -->

# src/ui/

Generic, reusable UI primitives — Button, Panel, Tabs, StatMeter,
and so on (see the R3 primitives table in
docs/UI-REHAUL-ROADMAP.md).

Rules for anything that lives in this folder:

- No Pokémon-specific logic or copy. A primitive doesn't know what
  a "type" or a "stat" is — it knows what a button or a panel is.
  Feature components (in src/components/) compose primitives; they
  don't live inside them.
- Same co-location convention as everywhere else: `Button.tsx`,
  `Button.css`, `Button.test.tsx`, side by side.
- Every primitive's CSS lives in the `features` layer, same as
  everything in src/components/ and src/pages/ — primitives aren't
  a separate layer of their own, despite the name similarity to the
  `primitives` _token_ layer in styles/layers.css. Don't confuse
  the two: "primitives" here means UI building blocks; "primitives"
  in layers.css means the tier-1 raw token values.
- No raw hex colors — Stylelint's color-no-hex rule is scoped to
  this folder along with src/components and src/pages.
