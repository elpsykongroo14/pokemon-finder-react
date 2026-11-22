import { useState } from "react";

//which member JUST joined the party, or null. the header pip of that member
//plays the party pop (spec 6.2), and only that one: the members loaded with
//the page did not "arrive", so nothing may pop on load (D42)
//
//how: remember the party size from the previous render. when it grows, the
//newest member (always added at the end) is the arrival; when it shrinks,
//nobody is. this is React's "adjusting state when a prop changes" pattern:
//calling setState DURING render, guarded by a comparison, makes React redo
//this render straight away with the new values, before anything is painted.
//an effect would paint one frame with the old answer first, and a ref read
//during render would break the rule that render must be pure
export function usePartyArrival(
  team: readonly { name: string }[],
): string | null {
  const [prevSize, setPrevSize] = useState(team.length);
  const [arrival, setArrival] = useState<string | null>(null);

  if (team.length !== prevSize) {
    setPrevSize(team.length);
    setArrival(team.length > prevSize ? (team.at(-1)?.name ?? null) : null);
  }

  return arrival;
}
