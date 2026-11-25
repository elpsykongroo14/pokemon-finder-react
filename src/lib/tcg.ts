//pure DOM free TCG helpers. same rules as sprites.ts and evolution.ts:
//data in, data out, never touches the network or the document,
//thats what makes this file trivially portable from the vanilla app and trivially unit testable without jsdom

import type { TCGCard } from "./type";
import { OTHER_CARDS_LABEL, TIER_LABELS } from "./copy";

export type SortMode = "newest" | "oldest" | "rarity";

//the four visual tiers a card can earn. "common" is the baseline: no effect.
export type RarityTier = "common" | "rare" | "holo" | "ultra";

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
  "Double Rare": 4, //the modern "ex" cards: tier holo
  "Rare BREAK": 4, //tier holo
  "Rare Holo": 3,
  Rare: 2,
  Promo: 2, //tier rare
  Uncommon: 1,
  Common: 0,
};

export function getRarityRank(rarity?: string): number {
  return RARITY_RANK[rarity ?? ""] ?? 0;
}

export function getRarityTier(rarity?: string): RarityTier {
  const rank = getRarityRank(rarity);
  if (rank >= 6) return "ultra";
  if (rank >= 3) return "holo";
  if (rank >= 2) return "rare";
  return "common";
}

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
    sorted.sort((a, b) => getRarityRank(b.rarity) - getRarityRank(a.rarity));
  }
  return sorted;
}

export interface CardMetaRow {
  label: string;
  value: string;
}

//builds the label/value pairs for the detail modal, dropping any field the API didnt return
//pure data in, pure data out, the component decides how to render it (JSX now, instead of han built inner HTML)
//B&W-7: the spec's list (7.4). the set is in the subtitle above it
export function getCardMetaRows(card: TCGCard): CardMetaRow[] {
  const rows: { label: string; value: string | undefined | null }[] = [
    { label: "Series", value: card.set?.series },
    { label: "Released", value: formatReleaseDate(card.set?.releaseDate) },
    { label: "Rarity", value: card.rarity },
    { label: "Artist", value: card.artist },
    { label: "HP", value: card.hp ? `${card.hp} HP` : null },
    { label: "Stage", value: getCardStage(card) },
  ];

  return rows.filter(
    (row): row is CardMetaRow =>
      typeof row.value === "string" && row.value.length > 0,
  );
}

//---- B&W-7 (spec 7.4): the facts each view shows about a card ----

//"240/191" for a plain number with a known set size, the code as printed
//otherwise ("SWSH037"), null when the card has no number at all
export function formatCardNumber(card: TCGCard): string | null {
  const number = card.number;
  if (!number) return null;
  const total = card.set?.printedTotal;
  if (/^\d+$/.test(number) && typeof total === "number") {
    return `${number}/${total}`;
  }
  return number;
}

//the evolution stage is one of the card's subtypes, next to tags like "ex"
const STAGES = ["Basic", "Stage 1", "Stage 2", "BREAK"] as const;
export type CardStage = (typeof STAGES)[number];

export function getCardStage(card: TCGCard): CardStage | null {
  return STAGES.find((stage) => card.subtypes?.includes(stage)) ?? null;
}

//month names written out here instead of Intl.DateTimeFormat: the same
//text in every browser and every test, whatever the machine's language
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

//the API writes "2024/11/08"; people write "8 Nov 2024"
export function formatReleaseDate(raw: string | undefined): string | null {
  const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(raw ?? "");
  if (!match) return null;
  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1];
  if (!monthName) return null;
  return `${Number(day)} ${monthName} ${year}`;
}

//the year a card came out, for year spans and sentences
function releaseYear(card: TCGCard): number | null {
  const match = /^(\d{4})\//.exec(card.set?.releaseDate ?? "");
  return match ? Number(match[1]) : null;
}

//"Surging Sparks, 240/191": the line under a card's name
export function getCardSubtitle(card: TCGCard): string {
  return [card.set?.name, formatCardNumber(card)]
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

//---- the grid as a timeline ----

export interface YearSpan {
  first: number;
  last: number;
}

export interface CardGroup {
  //a stable key for React: the series name, or the tier
  key: string;
  label: string;
  years: YearSpan | null;
  cards: TCGCard[];
}

function yearSpanOf(cards: TCGCard[]): YearSpan | null {
  const years = cards
    .map(releaseYear)
    .filter((year): year is number => year !== null);
  if (years.length === 0) return null;
  return { first: Math.min(...years), last: Math.max(...years) };
}

const TIER_ORDER: RarityTier[] = ["ultra", "holo", "rare", "common"];

//a date sort groups by series, a rarity sort by tier (spec 7.4). the cards
//come in already sorted, and grouping never reorders them: the first card
//of each group decides where the group goes. a Map remembers the order
//its keys were added in, which is exactly "the order the groups appear"
export function groupCards(cards: TCGCard[], sortMode: SortMode): CardGroup[] {
  if (sortMode === "rarity") {
    return TIER_ORDER.map((tier) => {
      const inTier = cards.filter(
        (card) => getRarityTier(card.rarity) === tier,
      );
      return {
        key: tier,
        label: TIER_LABELS[tier],
        years: yearSpanOf(inTier),
        cards: inTier,
      };
    }).filter((group) => group.cards.length > 0);
  }

  const bySeries = new Map<string, TCGCard[]>();
  for (const card of cards) {
    const series = card.set?.series || OTHER_CARDS_LABEL;
    const group = bySeries.get(series);
    if (group) group.push(card);
    else bySeries.set(series, [card]);
  }

  return [...bySeries].map(([series, inSeries]) => ({
    key: series,
    label: series,
    years: yearSpanOf(inSeries),
    cards: inSeries,
  }));
}

//the toolbar's legend: how many cards in each tier
export function countTiers(cards: TCGCard[]): Record<RarityTier, number> {
  const counts: Record<RarityTier, number> = {
    ultra: 0,
    holo: 0,
    rare: 0,
    common: 0,
  };
  for (const card of cards) counts[getRarityTier(card.rarity)] += 1;
  return counts;
}

//the hero's hand (spec 7.4): the three rarest cards, the newer one first
//when two are equally rare. rarest first: the hand puts it in the middle
export function pickHand(cards: TCGCard[]): TCGCard[] {
  return [...cards]
    .sort(
      (a, b) =>
        getRarityRank(b.rarity) - getRarityRank(a.rarity) ||
        (b.set?.releaseDate ?? "").localeCompare(a.set?.releaseDate ?? ""),
    )
    .slice(0, 3);
}

//the facts behind the hero's lead sentence and the Pokémon page's teaser.
//the words are built in copy.ts; this only finds the facts
export interface CardsSummary {
  count: number;
  firstYear: number | null;
  lastYear: number | null;
  firstSeries: string | null;
  lastSeries: string | null;
  firstSet: string | null;
  lastSet: string | null;
}

export function summarizeCards(cards: TCGCard[]): CardsSummary {
  //oldest to newest, by the date the API gives (cards without one last)
  const dated = cards
    .filter((card) => releaseYear(card) !== null)
    .sort((a, b) =>
      (a.set?.releaseDate ?? "").localeCompare(b.set?.releaseDate ?? ""),
    );
  const oldest = dated[0];
  const newest = dated[dated.length - 1];
  const span = yearSpanOf(cards);

  return {
    count: cards.length,
    firstYear: span?.first ?? null,
    lastYear: span?.last ?? null,
    firstSeries: oldest?.set?.series ?? null,
    lastSeries: newest?.set?.series ?? null,
    firstSet: oldest?.set?.name ?? null,
    lastSet: newest?.set?.name ?? null,
  };
}

//the dialog's Previous / Next and arrow keys (D53): the card before or
//after this one in the order the page shows, or null at either end.
//found by id: the list is re-sorted (a new array of the same objects)
//whenever the sort changes, so identity is not something to rely on
export function stepCard(
  cards: TCGCard[],
  current: TCGCard,
  delta: 1 | -1,
): TCGCard | null {
  const index = cards.findIndex((card) => card.id === current.id);
  if (index === -1) return null;
  return cards[index + delta] ?? null;
}

//a written name for a button that only shows a card's picture (a binder
//pocket, a card in the hero's hand): what a grid tile says in its text
export function describeCard(card: TCGCard): string {
  return [card.name, card.set?.name, card.rarity]
    .filter((part): part is string => Boolean(part))
    .join(", ");
}
