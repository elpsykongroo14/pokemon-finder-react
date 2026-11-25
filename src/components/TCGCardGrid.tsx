import "./TCGCardGrid.css";
import { useId } from "react";
import type { TCGCard } from "../lib/type";
import type { libraryStatus } from "../lib/tcgLibraryReducer";
import { groupCards, type CardGroup, type SortMode } from "../lib/tcg";
import { TCGCardGridItem } from "./TCGCardGridItem";
import { TCGCardSkeleton } from "./TCGCardSkeleton";
import { LibraryNotice } from "./LibraryNotice";
import { CARDS_LOADING_LABEL, cardCountText, yearSpanText } from "../lib/copy";

const SKELETON_COUNT = 16;

interface TCGCardGridprops {
  cards: TCGCard[];
  status: libraryStatus;
  error: string | null;
  emptyMessage: string;
  onSelect: (card: TCGCard) => void;
  //how the cards are sorted decides how they are grouped (spec 7.4)
  sortMode?: SortMode;
  //the view or the sort just changed: the tiles rise in (spec 6.2)
  entering?: boolean;
  //asks for the cards again after a failure (B&W-8)
  onRetry?: () => void;
}

//the grid as a timeline (spec 7.4): one group per series (or per tier,
//sorted by rarity), each a two-column row with a sticky heading on the
//left and the cards on the right. the groups are worked out on every
//render from the cards and the sort; nothing about them is stored
export function TCGCardGrid({
  cards,
  status,
  error,
  emptyMessage,
  onSelect,
  sortMode = "newest",
  entering = false,
  onRetry,
}: TCGCardGridprops) {
  if (status === "loading") {
    return (
      <div
        className="card-grid card-grid--loading"
        role="status"
        aria-label={CARDS_LOADING_LABEL}
      >
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
        onRetry={onRetry}
      />
    );
  }

  const groups = groupCards(cards, sortMode);
  //each tile's place across the whole view, for the tile-in stagger
  const firstIndex = groups.map((_, g) =>
    groups.slice(0, g).reduce((sum, group) => sum + group.cards.length, 0),
  );

  return (
    <div className="card-timeline" data-entering={entering || undefined}>
      {groups.map((group, g) => (
        <CardGroupSection
          key={group.key}
          group={group}
          firstIndex={firstIndex[g] ?? 0}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

interface CardGroupSectionProps {
  group: CardGroup;
  firstIndex: number;
  onSelect: (card: TCGCard) => void;
}

//one era (or tier): a region named by its heading, so a screen reader can
//jump from era to era the way the eye does
function CardGroupSection({
  group,
  firstIndex,
  onSelect,
}: CardGroupSectionProps) {
  const headingId = useId();

  return (
    <section className="card-group" aria-labelledby={headingId}>
      <div className="card-group__head">
        <h3 id={headingId} className="card-group__title">
          {group.label}
        </h3>
        {group.years && (
          <p className="card-group__years">{yearSpanText(group.years)}</p>
        )}
        <p className="card-group__count">{cardCountText(group.cards.length)}</p>
      </div>
      <ul className="card-grid">
        {group.cards.map((card, i) => (
          <li key={card.id}>
            <TCGCardGridItem
              card={card}
              onSelect={onSelect}
              index={firstIndex + i}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
