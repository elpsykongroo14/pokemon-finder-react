import "./TCGCardGrid.css";
import type { TCGCard } from "../lib/type";
import type { libraryStatus } from "../lib/tcgLibraryReducer";
import { TCGCardGridItem } from "./TCGCardGridItem";
import { TCGCardSkeleton } from "./TCGCardSkeleton";
import { LibraryNotice } from "./LibraryNotice";
import { CARDS_LOADING_LABEL } from "../lib/copy";

const SKELETON_COUNT = 16;

interface TCGCardGridprops {
  cards: TCGCard[];
  status: libraryStatus;
  error: string | null;
  emptyMessage: string;
  onSelect: (card: TCGCard) => void;
}

export function TCGCardGrid({
  cards,
  status,
  error,
  emptyMessage,
  onSelect,
}: TCGCardGridprops) {
  if (status === "loading") {
    return (
      <div className="card-grid" role="status" aria-label={CARDS_LOADING_LABEL}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <TCGCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (status === "error" || status === "empty") {
    return (
      <LibraryNotice
        status={status}
        error={error}
        emptyMessage={emptyMessage}
      />
    );
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <TCGCardGridItem key={card.id} card={card} onSelect={onSelect} />
      ))}
    </div>
  );
}
