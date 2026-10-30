import "./TCGCardGridItem.css";
import type { TCGCard } from "../lib/type";
import { getRarityTier } from "../lib/tcg";

interface TCGCardGridItemProps {
  card: TCGCard;
  onSelect: (card: TCGCard) => void;
}

export function TCGCardGridItem({ card, onSelect }: TCGCardGridItemProps) {
  return (
    <button
      type="button"
      className="tcg-card"
      data-rarity={getRarityTier(card.rarity)}
      onClick={() => onSelect(card)}
    >
      <span className="tcg-card-img-wrap">
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
