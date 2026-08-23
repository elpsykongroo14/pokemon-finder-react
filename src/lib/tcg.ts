//pure DOM free TCG helpers. same rules as sprites.ts and evolution.ts:
//data in, data out, never touches the network or the document,
//thats what makes this file trivially portable from the vanilla app and trivially unit testable without jsdom

import type { TCGCard } from "./type";

export type SortMode = "newest" | "oldest" | "rarity";

//fisher yates shuffle, unchanged from tcglibrary.ts copies before
//mutating so callers never have their input array altered under them
export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

//rarity ranking map
//converting rarity from strings to numbers and ranking them up from highest number to lowest
const RARITY_RANK: Record<string, number> = {
  "Secret Rare": 9,
  "Special Illustration Rare": 8,
  "Illustration Rare": 7,
  "Ultra Rare": 7,
  "Hyper Rare": 7,
  "Rare Rainbow": 6,
  "Rare Secret": 6,
  "Rare Ultra": 5,
  "Rare Holo VMAX": 5,
  "Rare Holo VSTAR": 5,
  "Rare Holo V": 4,
  "Rare Holo GX": 4,
  "Rare Holo EX": 4,
  "Rare Holo": 3,
  Rare: 2,
  Uncommon: 1,
  Common: 0,
};

//returns a new sorted array, never mutates `cards`. This mirrors the derived state lesson from Compare Mode
//sorting is something we CALCULATE from state on demand, never something we store as its own piece of state.
//two sources of truth (raw cards + sorted cards) is exactly the class of bug that caused the stale-highlight fix
export function sortTCGCards(cards: TCGCard[], sortMode: SortMode): TCGCard[] {
  const sorted = [...cards];

  if (sortMode === "newest") {
    sorted.sort((a, b) =>
      (b.set?.releaseDate ?? "").localeCompare(a.set?.releaseDate ?? ""),
    );
  } else if (sortMode === "oldest") {
    sorted.sort((a, b) =>
      (a.set?.releaseDate ?? "").localeCompare(b.set?.releaseDate ?? ""),
    );
  } else {
    sorted.sort(
      (a, b) =>
        (RARITY_RANK[b.rarity ?? ""] ?? 0) - (RARITY_RANK[a.rarity ?? ""] ?? 0),
    );
  }
  return sorted;
}

export interface CardMetaRow {
  label: string;
  value: string;
}

//builds the label/value pairs for the detail modal, dropping any field the API didnt return
//pure data in, pure data out, the component decides how to render it (JSX now, instead of han built inner HTML)
export function getCardMetaRows(card: TCGCard): CardMetaRow[] {
  const rows: { label: string; value: string | undefined | null }[] = [
    { label: "Set", value: card.set?.name },
    { label: "Released", value: card.set?.releaseDate?.replace(/\//g, " · ") },
    { label: "Rarity", value: card.rarity },
    { label: "Artist", value: card.artist },
    { label: "HP", value: card.hp ? `${card.hp} HP` : null },
    { label: "Type", value: card.supertypes?.join(", ") },
  ];

  return rows.filter(
    (row): row is CardMetaRow =>
      typeof row.value === "string" && row.value.length > 0,
  );
}
