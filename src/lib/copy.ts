import type { FetchFailureKind } from "./fetchErrors";
import type { StatOutcome } from "./statComparison";
import type { AnimationMode } from "./preferences";

//every sentence the user reads when something goes wrong lives here
//components pick a massage by kind,
//they never write their own, so rewording the voice is a one file change
//
//the switch has no default on purpose: if someone adds a third
//FetchFailureKind, TypeScript refuses to compile this function until a
//message exists for it. the compiler is a reminder

export const LOADING_LABEL = "Searching the tall grass…";
export const CARDS_LOADING_LABEL = "Flipping through the binder…";
export const BINDER_PAGES_LABEL = "Binder pages";

export const SORT_CARDS_LABEL = "Sort cards";
export const CARD_ZOOM_LABEL = "Zoom card";

//the dialog's accessible name: a screen reader says "Charizard card details, dialog"
export function cardDialogLabel(name: string): string {
  return `${name} card details`;
}

export const RETRY_LABEL = "Retry";
export const MENU_PROMPT = "What will you do?";

//compare page: the empty state invites, the self compare error says what to do
export const EMPTY_COMPARE =
  "Search for a Pokémon first, then hit Compare to bring it here.";
export const SELF_COMPARE = "Choose a different Pokémon to compare.";

//compare page: a heading for the page itself (visually hidden, so the headings
//below it nest correctly) and a name for the second search landmark, so a
//screen reader can tell it apart from the header search
export const COMPARE_HEADING = "Compare Pokémon";
export const OPPONENT_SEARCH_LABEL = "Choose an opponent";

//the words a screen reader says after a compared state value, so the result
//never depends on color alone. Record<StatOutcome, ...? makes the compiler
//demand a word for every outcome, the same safety net failureMessage has
export const STAT_OUTCOME_TEXT: Record<StatOutcome, string> = {
  win: "higher",
  lose: "lower",
  tie: "tied",
};

//pokemon page. controls are grouped by WHAT they act on: the sprite (on the
//Stage), our collection (keep it), or another page (go somewhere)
export const SPRITE_OPTIONS_LABEL = "Sprite options";
export const ACTIONS_COLLECT_LABEL = "Collect";
export const ACTIONS_EXPLORE_LABEL = "Explore";

export const LIBRARY_VIEW_LABEL = "Library view";

//team button: when the party is full, say so AND say what to do about it.
//the sentence is followed by a link whose text is TEAM_FULL_LINK
export const TEAM_FULL_HINT =
  "Your party is full. To add this Pokémon, remove another one on the";
export const TEAM_FULL_LINK = "Team page";
export const TEAM_FULL_ATTEMPT = "Couldn't add: your party is full.";
export const TEAM_COMPLETE = "Team complete! Your party is ready.";

//party screen announcements
export const PARTY_LABEL = "Your party";
export function removedFromTeamMessage(name: string): string {
  return `${name} removed from your team.`;
}

//empty states are invitations: say what is missing AND how to fill it
export const EMPTY_FAVORITES =
  "No favorites yet. Tap ♥ on any Pokémon to keep it here.";

//party screen: an empty slot must still say something to a screen reader,
//and the remove button must say WHICH pokemon it removes
export const LEAD_LABEL = "Lead";
//page headers: a name, and one sentence saying what the page is FOR
export const COMPARE_SUBTITLE =
  "Two Pokémon side by side: see who wins each stat.";
export const TEAM_HEADING = "Your Team";
export const TEAM_SUBTITLE =
  "Build a party of up to six. It stays saved in this browser.";
export const LIBRARY_HEADING = "TCG Library";
export const LIBRARY_SUBTITLE =
  "Trading cards for any Pokémon, as a grid, a table or a binder.";
export const NOT_FOUND_HEADING = "Page not found";
export const NOT_FOUND_SUBTITLE = "This path doesn't lead anywhere in the app.";
export const NOT_FOUND_LINK = "Run back to search";
//the 404 as a wild encounter: the message box line, and what the picture shows
export const NOT_FOUND_ENCOUNTER =
  "A wild 404 appeared! This route isn't on any map.";
export const NOT_FOUND_SCENE_LABEL =
  'A wooden route sign reading "404" in tall grass, with an exclamation mark popping up from the grass beside it.';

//footer. a fan project should say plainly what it is and is not, and who
//made the things it shows (roadmap section 8.6)
export const FOOTER_DISCLAIMER =
  "Unofficial fan project, not affiliated with or endorsed by Nintendo, Game Freak, Creatures or The Pokémon Company.";
export const FOOTER_MADE_BY = "Made by";

export function emptySlotLabel(slotNumber: number): string {
  return `Empty slot ${slotNumber}`;
}
export function removeFromTeamLabel(name: string): string {
  return `Remove ${name} from team`;
}

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

//settings dialog. the dialog's accessible name and its visible heading are
//the same word on purpose: what a screen reader announces matches what a
//sighted person reads
export const SETTINGS_LABEL = "Settings";
export const SETTINGS_NOTE = "Saved in this browser, on this device.";
export const ANIMATIONS_LABEL = "Animations";
export const SPRITES_LABEL = "Sprites";
export const SPRITES_HINT =
  "Pixel sprites move when animations are on. Artwork is always still.";

//the hint under Animations explains the choice AND what it means right now.
//"auto" is the interesting case: same choice, two possible outcomes, so the
//hint reads the resolved answer instead of guessing
export function animationsHint(
  mode: AnimationMode,
  animationsEnabled: boolean,
): string {
  if (mode === "on")
    return "Always on, even if your device asks for less motion.";
  if (mode === "off") return "Off everywhere in the app.";
  return animationsEnabled
    ? "Following your device: motion is on."
    : "Following your device: it asks for less motion, so motion is off.";
}
