//the rules of the Table view's column sorting. pure, like tcg.ts and libraryView.ts:
//data in, data out, no React, no DOM. the component that draws the table
//only asks these functions what to do.

import type { TCGCard } from "./type";
import { getRarityRank } from "./tcg";

//the list is the single source; the type is derived from it
export const TABLE_COLUMN = ["name", "set", "rarity", "released"] as const;
export type TableColumn = (typeof TABLE_COLUMN)[number];

export type SortDirection = "asc" | "desc";

//null means "no column sorting": rows stay in the order the page's own
//sort dropdown gave them. that is a real state, so it gets a real value
export type TableSort = {
  column: TableColumn;
  direction: SortDirection;
} | null;

//the three words the aria-sort attribute understands
export type AriaSortValue = "ascending" | "descending" | "none";

//what one click on a column header does, a small state machine:
//  other column / nothing -> that column, ascending
//  same column, ascending  -> descending
//  same column, descending -> back to no sorting
export function nextTableSort(
  current: TableSort,
  column: TableColumn,
): TableSort {
  if (current === null || current.column !== column) {
    return { column, direction: "asc" };
  }
  if (current.direction === "asc") {
    return { column, direction: "desc" };
  }
  return null;
}

//only the sorted column announces a direction; every other column says "none"
export function getAriaSort(
  sort: TableSort,
  column: TableColumn,
): AriaSortValue {
  if (sort === null || sort.column !== column) return "none";
  return sort.direction === "asc" ? "ascending" : "descending";
}

//the only value a colum sorts by, ot null when the card doesnt have it
//rarity sorts by RANK (the same table the grid's sort uses), never alphabetically
function getSortValue(
  card: TCGCard,
  column: TableColumn,
): string | number | null {
  switch (column) {
    case "name":
      return card.name;
    case "set":
      return card.set?.name ?? null;
    case "rarity":
      return card.rarity === undefined ? null : getRarityRank(card.rarity);
    case "released":
      return card.set?.releaseDate ?? null;
  }
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

//returns a new array an never touches 'cards'. array.prototype.sort is
//stable, so rows that tie keep the order they arrived in
export function sortTableRows(cards: TCGCard[], sort: TableSort): TCGCard[] {
  const rows = [...cards];
  if (sort === null) return rows;

  const factor = sort.direction === "asc" ? 1 : -1;

  rows.sort((a, b) => {
    const left = getSortValue(a, sort.column);
    const right = getSortValue(b, sort.column);

    //a missing value goes last in both directions. this check runs before
    //the direction is applied, or "descending" would float blanks to the top
    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;

    return compareValues(left, right) * factor;
  });

  return rows;
}
