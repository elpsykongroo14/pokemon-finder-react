//the desktop-to-stacked switch (spec 4.4). CSS cannot read a JS value, or
//var() inside @media, so the same 1000 px is written as a literal in the
//CSS files that switch at it (decision D15). keep the two in step.
//components that must render DIFFERENT markup on phones (the Pokémon page
//tabs, D57) read this through useMediaQuery
export const STACKED_QUERY = "(max-width: 1000px)";
