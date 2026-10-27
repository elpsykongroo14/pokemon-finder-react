import type { FetchFailureKind } from "./fetchErrors";
import type { StatOutcome } from "./statComparison";

//every sentence the user reads when something goes wrong lives here
//components pick a massage by kind,
//they never write their own, so rewording the voice is a one file change
//
//the switch has no default on purpose: if someone adds a third
//FetchFailureKind, TypeScript refuses to compile this function until a
//message exists for it. the compiler is a reminder

export const LOADING_LABEL = "Searching the tall grass…";
export const RETRY_LABEL = "Retry";
export const MENU_PROMPT = "What will you do?";

//compare page: the empty state invites, the self compare error says what to do
export const EMPTY_COMPARE =
  "Search for a Pokémon first, then hit Compare to bring it here.";
export const SELF_COMPARE = "Choose a different Pokémon to compare.";

//the words a screen reader says after a compared state value, so the result
//never depends on color alone. Record<StatOutcome, ...? makes the compiler
//demand a word for every outcome, the same safety net failureMessage has
export const STAT_OUCOME_TEXT: Record<StatOutcome, string> = {
  win: "higher",
  lose: "lower",
  tie: "tied",
};

//empty states are invitations: say what is missing AND how to fill it
export const EMPTY_FAVORITES =
  "No favorites yet. Tap ♥ on any Pokémon to keep it here.";

//the home greeting: two lines, the secon typed after the first (the
//newline is kept by the message box's CSS). the name is shouted
export function encounterMessage(name: string): string {
  return `A wild ${name.toUpperCase()} appeared!\n${MENU_PROMPT}`;
}

export function failureMessage(kind: FetchFailureKind, query: string): string {
  switch (kind) {
    case "not-found":
      return `No Pokémon named "${query}" was found. Check the spelling or try its Pokédex number.`;
    case "unreachable":
      return "Couldn't reach the Pokédex. Check your connection and try again.";
  }
}
