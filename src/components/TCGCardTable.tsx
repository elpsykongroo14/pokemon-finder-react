import "./TCGCardTable.css";
import { useState } from "react";
import type { TCGCard } from "../lib/type";
import type { libraryStatus } from "../lib/tcgLibraryReducer";
import { formatCardNumber, formatReleaseDate, getRarityTier } from "../lib/tcg";
import {
  getAriaSort,
  nextTableSort,
  sortTableRows,
  type TableColumn,
  type TableSort,
} from "../lib/tcgTable";
import { Skeleton } from "../ui/Skeleton";
import { TierMark } from "./TierMark";
import { LibraryNotice } from "./LibraryNotice";
import {
  CARDS_LOADING_LABEL,
  NOT_LISTED,
  TABLE_ARTIST_HEADER,
  TABLE_CARD_HEADER,
  TABLE_NUMBER_HEADER,
  TABLE_PICTURE_HEADER,
  TABLE_RARITY_HEADER,
  TABLE_RELEASED_HEADER,
} from "../lib/copy";

const SKELETON_ROWS = 8;

//the header row, left to right (spec 7.4). three columns sort (the same
//ascending / descending / off cycle as before); the others are plain.
//"hidden" headers still name their column for a screen reader
type HeaderCell =
  | { kind: "sort"; column: TableColumn; label: string; className?: string }
  | { kind: "plain"; label: string; className?: string; hidden?: boolean };

const HEADERS: HeaderCell[] = [
  { kind: "plain", label: TABLE_PICTURE_HEADER, hidden: true },
  { kind: "sort", column: "name", label: TABLE_CARD_HEADER },
  { kind: "plain", label: TABLE_NUMBER_HEADER },
  {
    kind: "sort",
    column: "released",
    label: TABLE_RELEASED_HEADER,
    className: "tcg-table__wide",
  },
  { kind: "sort", column: "rarity", label: TABLE_RARITY_HEADER },
  {
    kind: "plain",
    label: TABLE_ARTIST_HEADER,
    className: "tcg-table__wide",
  },
];

interface TCGCardTableProps {
  cards: TCGCard[];
  status: libraryStatus;
  error: string | null;
  emptyMessage: string;
  //names the table for a screen reader (the page passes its panel title)
  caption: string;
  onSelect: (card: TCGCard) => void;
  //the view or the sort just changed: the rows rise in (spec 6.2)
  entering?: boolean;
  //asks for the cards again after a failure (B&W-8)
  onRetry?: () => void;
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
  entering = false,
  onRetry,
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
          <Skeleton key={i} width="100%" height={60} decorative />
        ))}
      </div>
    );
  }
  //B&W-8: the same battle-dialog notice as the grid and the binder
  if (status === "error" || status === "empty") {
    return (
      <LibraryNotice
        status={status}
        error={error}
        emptyMessage={emptyMessage}
        onRetry={onRetry}
      />
    );
  }

  const rows = sortTableRows(cards, sort);

  return (
    <div className="tcg-table-wrap" data-entering={entering || undefined}>
      <table className="tcg-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {HEADERS.map((header) =>
              header.kind === "sort" ? (
                <th
                  key={header.label}
                  scope="col"
                  className={header.className}
                  aria-sort={getAriaSort(sort, header.column)}
                >
                  <button
                    type="button"
                    className="tcg-table__sort"
                    onClick={() =>
                      setSort((current) =>
                        nextTableSort(current, header.column),
                      )
                    }
                  >
                    {header.label}
                    <span className="tcg-table__arrow" aria-hidden="true">
                      {sortArrow(sort, header.column)}
                    </span>
                  </button>
                </th>
              ) : (
                <th key={header.label} scope="col" className={header.className}>
                  {header.hidden ? (
                    <span className="visually-hidden">{header.label}</span>
                  ) : (
                    header.label
                  )}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((card) => (
            <tr key={card.id} data-rarity={getRarityTier(card.rarity)}>
              <td className="tcg-table__thumb">
                {card.images?.small && (
                  //the name in the next cell says which card this is
                  <img src={card.images.small} alt="" loading="lazy" />
                )}
              </td>
              <th scope="row" className="tcg-table__card">
                <button
                  type="button"
                  className="tcg-table__open"
                  onClick={() => onSelect(card)}
                >
                  {card.name}
                </button>
                <span className="tcg-table__set">
                  {card.set?.name || "Unknown set"}
                </span>
              </th>
              <td className="tcg-table__number">
                {formatCardNumber(card) ?? (
                  <span className="tcg-table__muted">{NOT_LISTED}</span>
                )}
              </td>
              <td className="tcg-table__wide">
                {formatReleaseDate(card.set?.releaseDate) ?? "Unknown"}
              </td>
              <td>
                <TierMark rarity={card.rarity} />
              </td>
              <td className="tcg-table__wide">
                {card.artist || (
                  <span className="tcg-table__muted">{NOT_LISTED}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
