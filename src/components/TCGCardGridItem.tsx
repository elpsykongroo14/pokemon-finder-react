import "./TCGCardGridItem.css";
import { useRef, type CSSProperties } from "react";
import type { TCGCard } from "../lib/type";
import { formatCardNumber, getRarityTier } from "../lib/tcg";
import { staggerSlot } from "../lib/stagger";
import { useHoloPointer } from "../hooks/useHoloPointer";
import { HoloCard } from "./HoloCard";
import { TierMark } from "./TierMark";

//tile in (spec 6.2): staggered 35 ms, capped at 14 steps, so a library of
//60 cards never makes the last one wait 60 beats
const TILE_STAGGER_CAP = 14;

interface TCGCardGridItemProps {
  card: TCGCard;
  onSelect: (card: TCGCard) => void;
  //its place in the view, for the tile-in stagger. left out: no delay
  index?: number;
}

//a card in the grid (spec 7.4): a real <button> (the R8 keyboard fix,
//kept), holding the card, then the set and number on one row and the tier
//mark under them.
//
//the scan already shows the card's name, so it is not printed again; it
//is in the button as visually hidden text instead, FIRST, so a screen
//reader hears "Hydreigon ex, Surging Sparks, 240/191, Special Illustration
//Rare" and the button's name still starts with what the card is
export function TCGCardGridItem({
  card,
  onSelect,
  index = 0,
}: TCGCardGridItemProps) {
  const tier = getRarityTier(card.rarity);
  const number = formatCardNumber(card);
  //every card tilts (spec 6.2); the light per tier is CSS's business
  const cardRef = useRef<HTMLButtonElement>(null);
  const holoHandlers = useHoloPointer(cardRef, true);

  return (
    <button
      ref={cardRef}
      {...holoHandlers}
      type="button"
      className="tcg-card holo-target"
      data-rarity={tier}
      style={
        {
          "--tile-index": staggerSlot(index, Infinity, TILE_STAGGER_CAP),
        } as CSSProperties
      }
      onClick={() => onSelect(card)}
    >
      <span className="visually-hidden">{card.name}</span>
      <span className="tcg-card__lift">
        <HoloCard card={card} />
      </span>
      <span className="tcg-card__meta">
        <span className="tcg-card__row">
          <span className="tcg-card__set">
            {card.set?.name || "Unknown set"}
          </span>
          {number && <span className="tcg-card__number">{number}</span>}
        </span>
        <TierMark rarity={card.rarity} />
      </span>
    </button>
  );
}
