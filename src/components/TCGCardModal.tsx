import { Modal } from "./Modal";
import { getCardMetaRows } from "../lib/tcg";
import type { TCGCard } from "../lib/type";

interface TCGCardModalProps {
  card: TCGCard;
  onClose: () => void;
}

export function TCGCardModal({ card, onClose }: TCGCardModalProps) {
  const metaRows = getCardMetaRows(card);
  const imageSrc = card.images?.large || card.images?.small || "";

  return (
    <Modal onClose={onClose}>
      <div className="card-modal-body">
        <div className="card-modal-img-wrap">
          <img src={imageSrc} alt={card.name} />
        </div>
        <div className="card-modal-info">
          <h2 className="card-modal-name">{card.name}</h2>
          <div className="card-modal-meta">
            {metaRows.map((row) => (
              <div className="meta-row" key={row.label}>
                <span className="meta-label">{row.label}</span>
                <span className="meta-value">{row.value}</span>
              </div>
            ))}
          </div>
          {card.flavorText && (
            <p className="card-modal-flavor">{card.flavorText}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
