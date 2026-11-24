import "./TCGCardModal.css";
import { useEffect, useRef } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { BrandMark } from "./BrandMark";
import { HoloCard } from "./HoloCard";
import { Icon } from "./Icon";
import { TierMark } from "./TierMark";
import { useHoloPointer } from "../hooks/useHoloPointer";
import { getCardMetaRows, getCardSubtitle, stepCard } from "../lib/tcg";
import {
  CARD_KEYS_HINT,
  NEXT_CARD,
  PREVIOUS_CARD,
  cardDialogLabel,
  cardPositionText,
} from "../lib/copy";
import type { TCGCard } from "../lib/type";

interface TCGCardModalProps {
  card: TCGCard;
  //the cards in the order the page shows them, for Previous / Next and
  //"Card 7 of 25". left out: this card alone
  cards?: TCGCard[];
  //show another card in this same dialog (D53)
  onSelect?: (card: TCGCard) => void;
  onClose: () => void;
}

//rows the phone sheet leaves out (spec 8: Released, Artist, HP only)
const SHEET_HIDES = new Set(["Series", "Rarity", "Stage"]);

//the card dialog (spec 7.4, D53): the card on the left, flipping in on
//open and on every Previous / Next; its facts on the right. on a phone the
//same dialog is a black bottom sheet (CSS only: the content is the same)
export function TCGCardModal({
  card,
  cards = [card],
  onSelect,
  onClose,
}: TCGCardModalProps) {
  const previous = stepCard(cards, card, -1);
  const next = stepCard(cards, card, 1);
  const position = cards.findIndex((c) => c.id === card.id) + 1;

  //the tilt is NOT state: the same hook as the grid card, writing CSS
  //variables onto the face
  const faceRef = useRef<HTMLDivElement>(null);
  const holoHandlers = useHoloPointer(faceRef, true);

  //B&W-8: a step that reaches either end disables the button that was
  //just pressed, and focus would fall out of the dialog. move it to the
  //way back instead, only when focus really was lost
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const active = document.activeElement;
    if (
      next === null &&
      (active === document.body || active === nextRef.current)
    ) {
      previousRef.current?.focus();
    } else if (
      previous === null &&
      (active === document.body || active === previousRef.current)
    ) {
      nextRef.current?.focus();
    }
  }, [card.id, next, previous]);

  //← and → anywhere in the dialog, like Esc (which Dialog already owns).
  //the newest previous/next are read through the effect's dependencies,
  //so the listener is replaced whenever the card changes
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target =
        event.key === "ArrowLeft"
          ? previous
          : event.key === "ArrowRight"
            ? next
            : null;
      if (target && onSelect) {
        event.preventDefault();
        onSelect(target);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previous, next, onSelect]);

  return (
    <Dialog
      aria-label={cardDialogLabel(card.name)}
      onClose={onClose}
      variant="stage"
    >
      <div className="card-dialog on-dark">
        <div className="card-dialog__card">
          {/* key: a new card is a new flipper, so the flip plays again */}
          <div key={card.id} className="card-dialog__flipper">
            <div
              ref={faceRef}
              {...holoHandlers}
              className="card-dialog__face holo-target"
            >
              <HoloCard card={card} size="large" eager alt={card.name} />
            </div>
            {/* the card's back, seen for an instant as it flips */}
            <span className="card-dialog__back" aria-hidden="true">
              <BrandMark size={120} />
            </span>
          </div>
        </div>

        <div className="card-dialog__info">
          {cards.length > 1 && (
            <p className="card-dialog__position">
              {cardPositionText(position, cards.length)}
            </p>
          )}
          <h2 className="card-dialog__name">{card.name}</h2>
          {getCardSubtitle(card) && (
            <p className="card-dialog__sub">{getCardSubtitle(card)}</p>
          )}
          {card.rarity && <TierMark rarity={card.rarity} />}

          <dl className="card-dialog__facts">
            {getCardMetaRows(card).map((row) => (
              <div
                key={row.label}
                className="card-dialog__fact"
                data-sheet={SHEET_HIDES.has(row.label) ? "hide" : undefined}
              >
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>

          {card.flavorText && (
            <p className="card-dialog__flavor">{card.flavorText}</p>
          )}

          {cards.length > 1 && (
            <div className="card-dialog__nav">
              <Button
                ref={previousRef}
                variant="ghost"
                disabled={previous === null}
                onClick={() => previous && onSelect?.(previous)}
              >
                <Icon name="chevron-left" size={18} />
                {PREVIOUS_CARD}
              </Button>
              <Button
                ref={nextRef}
                variant="light"
                disabled={next === null}
                onClick={() => next && onSelect?.(next)}
              >
                {NEXT_CARD}
                <Icon name="chevron-right" size={18} />
              </Button>
            </div>
          )}

          <p className="card-dialog__keys">
            {CARD_KEYS_HINT.before} <kbd>←</kbd> <kbd>→</kbd>{" "}
            {CARD_KEYS_HINT.between} <kbd>Esc</kbd> {CARD_KEYS_HINT.after}
          </p>
        </div>
      </div>
    </Dialog>
  );
}
