import "./TCGCardBinder.css";
import { useEffect, useRef, useState } from "react";
import type { TCGCard } from "../lib/type";
import type { libraryStatus } from "../lib/tcgLibraryReducer";
import { getPageCount, paginate } from "../lib/pagination";
import { BINDER_PAGE_SIZE, getBinderSpread } from "../lib/binder";
import { describeCard } from "../lib/tcg";
import { STACKED_QUERY } from "../lib/breakpoints";
import {
  BINDER_PAGES_LABEL,
  CARDS_LOADING_LABEL,
  binderPagesText,
  endOfBinderText,
} from "../lib/copy";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useHoloPointer } from "../hooks/useHoloPointer";
import { Button } from "../ui/Button";
import { Icon } from "./Icon";
import { LibraryNotice } from "./LibraryNotice";
import { HoloCard } from "./HoloCard";
import { TCGCardSkeleton } from "./TCGCardSkeleton";

type TurnDirection = "next" | "previous";

interface TCGCardBinderProps {
  cards: TCGCard[];
  status: libraryStatus;
  error: string | null;
  emptyMessage: string;
  //the page the url asks for, we clamp it to a page that exists
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (card: TCGCard) => void;
  //asks for the cards again after a failure (B&W-8)
  onRetry?: () => void;
}

//the binder (spec 7.4, D54, D55): a black binder with two sleeve pages and
//a spine of three rings on a wide screen, one page on a phone. a page past
//the last card says "That's all 25 cards." instead of showing empty pockets
export function TCGCardBinder({
  cards,
  status,
  error,
  emptyMessage,
  page,
  onPageChange,
  onSelect,
  onRetry,
}: TCGCardBinderProps) {
  //D55: phones show one page at a time. this is a question about the
  //screen, which only the browser can answer, so it comes from a media
  //query; CSS alone could hide the right page but could not make Next
  //step one page instead of two
  const onePage = useMediaQuery(STACKED_QUERY);

  //which way the last turn went, and the page it led to. the page-turn
  //motion plays only on THAT spread: a page change that came another way
  //(Back, a new search) finds a different page here and plays nothing
  const [turn, setTurn] = useState<{
    direction: TurnDirection;
    to: number;
  } | null>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  //the spread is worked out on every render from 'cards' + the url's page,
  //nothing about pages is stored in this component
  const pageCount = getPageCount(cards.length, BINDER_PAGE_SIZE);
  const spread = getBinderSpread(page, pageCount, onePage ? 1 : 2);
  const turnShown =
    turn !== null && turn.to === spread.pages[0] ? turn.direction : undefined;
  const atEnd =
    (turnShown === "next" && spread.next === null) ||
    (turnShown === "previous" && spread.previous === null);

  //B&W-8: a turn that reaches either end disables the button that was
  //just pressed, and a disabled button lets keyboard focus fall to the top
  //of the page. the way back is still there, so focus goes to it.
  //only when focus really was lost, so a mouse user's focus is left alone
  useEffect(() => {
    if (!atEnd) return;
    const lost =
      document.activeElement === document.body ||
      document.activeElement ===
        (turnShown === "next" ? nextRef : previousRef).current;
    if (lost) (turnShown === "next" ? previousRef : nextRef).current?.focus();
  }, [atEnd, turnShown]);

  if (status === "loading") {
    return (
      <div
        className="binder__loading"
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
        onRetry={onRetry}
      />
    );
  }

  function goTo(target: number | null, direction: TurnDirection) {
    if (target === null) return;
    setTurn({ direction, to: target });
    onPageChange(target);
  }

  return (
    <div className="binder-view">
      <div
        className="binder"
        data-turn={turnShown}
        data-pages={spread.pages.length}
      >
        {spread.pages.map((pageNumber, i) => (
          <BinderPage
            //a new page number = a new element, so its page-turn plays
            //from the start (the same trick as the encounter's key)
            key={pageNumber}
            side={i === 0 ? "left" : "right"}
            cards={
              pageNumber <= pageCount
                ? paginate(cards, pageNumber, BINDER_PAGE_SIZE).items
                : null
            }
            total={cards.length}
            onSelect={onSelect}
          />
        ))}
        {spread.pages.length === 2 && (
          <span className="binder__spine" aria-hidden="true">
            <span className="binder__ring" />
            <span className="binder__ring" />
            <span className="binder__ring" />
          </span>
        )}
      </div>

      <nav className="binder__nav" aria-label={BINDER_PAGES_LABEL}>
        <Button
          ref={previousRef}
          variant="line"
          disabled={spread.previous === null}
          onClick={() => goTo(spread.previous, "previous")}
        >
          <Icon name="chevron-left" size={16} />
          Previous
        </Button>
        <p className="binder__status" aria-live="polite">
          {binderPagesText(spread.pages, pageCount)}
        </p>
        <Button
          ref={nextRef}
          variant="line"
          disabled={spread.next === null}
          onClick={() => goTo(spread.next, "next")}
        >
          Next
          <Icon name="chevron-right" size={16} />
        </Button>
      </nav>
    </div>
  );
}

interface BinderPageProps {
  side: "left" | "right";
  //the page's cards, or null for the page past the last card
  cards: TCGCard[] | null;
  total: number;
  onSelect: (card: TCGCard) => void;
}

function BinderPage({ side, cards, total, onSelect }: BinderPageProps) {
  if (cards === null) {
    return (
      <div className="binder__page binder__page--end" data-side={side}>
        <p className="binder__end">{endOfBinderText(total)}</p>
      </div>
    );
  }

  //blank sleeves keep a short last page the same size as a full one
  const emptyPockets = BINDER_PAGE_SIZE - cards.length;

  return (
    <ul className="binder__page" data-side={side}>
      {cards.map((card) => (
        <li key={card.id} className="binder__pocket">
          <BinderPocket card={card} onSelect={onSelect} />
        </li>
      ))}
      {Array.from({ length: emptyPockets }, (_, i) => (
        <li
          key={`empty-${i}`}
          className="binder__pocket binder__pocket--empty"
          aria-hidden="true"
        />
      ))}
    </ul>
  );
}

function BinderPocket({
  card,
  onSelect,
}: {
  card: TCGCard;
  onSelect: (card: TCGCard) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const holoHandlers = useHoloPointer(ref, true);

  return (
    <button
      ref={ref}
      {...holoHandlers}
      type="button"
      className="binder__card holo-target"
      //the pocket shows only the picture, so its name is written out
      aria-label={describeCard(card)}
      onClick={() => onSelect(card)}
    >
      <HoloCard card={card} />
    </button>
  );
}
