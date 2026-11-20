import "./TCGCardTable.css";
import { useState } from "react";
import type { TCGCard } from "../lib/type";
import type { libraryStatus } from "../lib/tcgLibraryReducer";
import { getRarityTier } from "../lib/tcg";
import {
  getAriaSort,
  nextTableSort,
  sortTableRows,
  type TableColumn,
  type TableSort,
} from "../lib/tcgTable";
import { Skeleton } from "../ui/Skeleton";
import { CARDS_LOADING_LABEL } from "../lib/copy";

const SKELETON_ROWS = 8;

//the column list drives the header row; the labels are the words people read
const COLUMN_LABELS: { column: TableColumn; label: string }[] = [
  { column: "name", label: "Name" },
  { column: "set", label: "Set" },
  { column: "rarity", label: "Rarity" },
  { column: "released", label: "Released" },
];

interface TCGCardTableProps {
  cards: TCGCard[];
  status: libraryStatus;
  error: string | null;
  emptyMessage: string;
  //names the table for a screen reader (the page passes its panel title)
  caption: string;
  onSelect: (card: TCGCard) => void;
}

function sortArrow(sort: TableSort, column: TableColumn): string {
  const ariaSort = getAriaSort(sort, column);
  if (ariaSort === "ascending") return "▲";
  if (ariaSort === "descending") return "▼";
  return "";
}

export function TCGCardTable({
  cards,
  status,
  error,
  emptyMessage,
  caption,
  onSelect,
}: TCGCardTableProps) {
  //the only state here: which column is sorted. the rows themselves are
  //never stored, they are worked out from `cards` + `sort` on every render
  const [sort, setSort] = useState<TableSort>(null);

  if (status === "loading") {
    return (
      <div
        className="tcg-table-loading"
        role="status"
        aria-label={CARDS_LOADING_LABEL}
      >
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <Skeleton key={i} width="100%" height={36} decorative />
        ))}
      </div>
    );
  }
  if (status === "error") {
    return <p className="library-empty">{error}</p>;
  }
  if (status === "empty") {
    return <p className="library-empty">{emptyMessage}</p>;
  }

  const rows = sortTableRows(cards, sort);

  return (
    <div className="tcg-table-wrap">
      <table className="tcg-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {COLUMN_LABELS.map(({ column, label }) => (
              <th
                key={column}
                scope="col"
                aria-sort={getAriaSort(sort, column)}
              >
                <button
                  type="button"
                  className="tcg-table__sort"
                  onClick={() =>
                    setSort((current) => nextTableSort(current, column))
                  }
                >
                  {label}
                  <span className="tcg-table__arrow" aria-hidden="true">
                    {sortArrow(sort, column)}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((card) => (
            <tr key={card.id} data-rarity={getRarityTier(card.rarity)}>
              <th scope="row">
                <button
                  type="button"
                  className="tcg-table__open"
                  onClick={() => onSelect(card)}
                >
                  {card.name}
                </button>
              </th>
              <td>{card.set?.name || "Unknown set"}</td>
              <td className="tcg-table__rarity">{card.rarity || "unknown"}</td>
              <td>{card.set?.releaseDate || "Unknown"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
