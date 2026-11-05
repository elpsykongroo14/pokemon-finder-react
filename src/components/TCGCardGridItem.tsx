import "./TCGCardGridItem.css";
import { useRef } from "react";
import type { TCGCard } from "../lib/type";
import { getRarityTier } from "../lib/tcg";
import { useHoloPointer } from "../hooks/useHoloPointer";

interface TCGCardGridItemProps {
  card: TCGCard;
  onSelect: (card: TCGCard) => void;
}

export function TCGCardGridItem({ card, onSelect }: TCGCardGridItemProps) {
  const tier = getRarityTier(card.rarity);
  //common cards have no effect, so their handlers do nothing at all
  const cardRef = useRef<HTMLButtonElement>(null);
  const holoHandlers = useHoloPointer(cardRef, tier !== "common");

  return (
    <button
      ref={cardRef}
      {...holoHandlers}
      type="button"
      className="tcg-card"
      data-rarity={tier}
      onClick={() => onSelect(card)}
    >
      <span className="tcg-card-img-wrap holo-shine">
        <img src={card.images?.small} alt="" loading="lazy" />
      </span>
      <span className="tcg-card-info">
        <span className="tcg-card-name">{card.name}</span>
        <span className="tcg-card-set">{card.set?.name || "Unknown set"}</span>
        <span className="tcg-card-rarity">{card.rarity || "unknown"}</span>
      </span>
    </button>
  );
}
