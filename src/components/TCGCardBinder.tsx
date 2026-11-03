import "./TCGCardBinder.css";
import type { TCGCard } from "../lib/type";
import type { libraryStatus } from "../lib/tcgLibraryReducer";
import { paginate } from "../lib/pagination";
import { BINDER_PAGES_LABEL, CARDS_LOADING_LABEL } from "../lib/copy";
import { Button } from "../ui/Button";
import { LibraryNotice } from "./LibraryNotice";
import { TCGCardGridItem } from "./TCGCardGridItem";
import { TCGCardSkeleton } from "./TCGCardSkeleton";

//a 3x3 page, like a real binder sleeve
const BINDER_PAGE_SIZE = 9;

interface TCGCardBinderProps {
  cards: TCGCard[];
  status: libraryStatus;
  error: string | null;
  emptyMessage: string;
  //the page the url asks for, we clamp it to a page that exists
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (card: TCGCard) => void;
}

export function TCGCardBinder({
  cards,
  status,
  error,
  emptyMessage,
  page,
  onPageChange,
  onSelect,
}: TCGCardBinderProps) {
  if (status === "loading") {
    return (
      <div
        className="binder__page"
        role="status"
        aria-label={CARDS_LOADING_LABEL}
      >
        {Array.from({ length: BINDER_PAGE_SIZE }, (_, i) => (
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

  //the page is worked out on every render from 'cards' + the url's page,
  //nothing about pages is stored in this component
  const spread = paginate(cards, page, BINDER_PAGE_SIZE);
  const emptySlots = BINDER_PAGE_SIZE - spread.items.length;

  return (
    <div className="binder">
      <div className="binder__page">
        {spread.items.map((card) => (
          <TCGCardGridItem key={card.id} card={card} onSelect={onSelect} />
        ))}
        {/* blank sleeves keep a short last page the same size as a full one */}
        {Array.from({ length: emptySlots }, (_, i) => (
          <div key={`empty-${i}`} className="binder__slot" aria-hidden="true" />
        ))}
      </div>

      <nav className="binder__nav" aria-label={BINDER_PAGES_LABEL}>
        <Button
          variant="secondary"
          disabled={spread.page <= 1}
          onClick={() => onPageChange(spread.page - 1)}
        >
          Previous
        </Button>
        <p className="binder__status" aria-live="polite">
          Page {spread.page} of {spread.pageCount}
        </p>
        <Button
          variant="secondary"
          disabled={spread.page >= spread.pageCount}
          onClick={() => onPageChange(spread.page + 1)}
        >
          Next
        </Button>
      </nav>
    </div>
  );
}
