import type { TCGCard } from "../lib/type";

interface TCGCardGridItemProps {
  card: TCGCard;
  onSelect: (card: TCGCard) => void;
}

export function TCGCardGridItem({ card, onSelect }: TCGCardGridItemProps) {
  return (
    <div className="tcg-card" onClick={() => onSelect(card)}>
      <div className="tcg-card-img-wrap">
        <img src={card.images?.small || ""} alt={card.name} loading="lazy" />
      </div>
      <div className="tcg-card-info">
        <div className="tcg-card-set">{card.set?.name || "Unknow set"}</div>
        <div className="tcg-card-rarity">{card.rarity || "unknow"}</div>
      </div>
    </div>
  );
}
