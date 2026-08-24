import type { TCGCard } from "../lib/type";
import type { libraryStatus } from "../lib/tcgLibraryReducer";
import { TCGCardGridItem } from "./TCGCardGridItem";

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
    return <p className="library-loading">Loading cards...</p>;
  }
  if (status === "error") {
    return <p className="library-empty">{error}</p>;
  }
  if (status === "empty") {
    return <p className="library-empty">{emptyMessage}</p>;
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <TCGCardGridItem key={card.id} card={card} onSelect={onSelect} />
      ))}
    </div>
  );
}
