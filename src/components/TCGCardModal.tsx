import "./TCGCardModal.css";
import { useRef, useState } from "react";
import { Dialog } from "../ui/Dialog";
import { CardChip } from "./CardChip";
import { useHoloPointer } from "../hooks/useHoloPointer";
import { getCardMetaRows, getRarityTier } from "../lib/tcg";
import { CARD_ZOOM_LABEL, cardDialogLabel } from "../lib/copy";
import type { TCGCard } from "../lib/type";

interface TCGCardModalProps {
  card: TCGCard;
  onClose: () => void;
}

//the set and the rarity are shown as chips, so the rows list skips them
const SHOWN_AS_CHIPS = new Set(["Set", "Rarity"]);

export function TCGCardModal({ card, onClose }: TCGCardModalProps) {
  const tier = getRarityTier(card.rarity);
  const metaRows = getCardMetaRows(card).filter(
    (row) => !SHOWN_AS_CHIPS.has(row.label),
  );
  const imageSrc = card.images?.large || card.images?.small || "";

  //zoom is a tiny piece of UI state: it changes what react draws (the layout)
  const [zoomed, setZoomed] = useState(false);

  //the tilt is NOT state: same hook as the grid card, writing CSS variables
  const stageRef = useRef<HTMLButtonElement>(null);
  const holoHandlers = useHoloPointer(stageRef, tier !== "common");

  return (
    <Dialog aria-label={cardDialogLabel(card.name)} onClose={onClose}>
      <div className="card-modal-body" data-zoomed={zoomed}>
        <button
          ref={stageRef}
          {...holoHandlers}
          type="button"
          className="card-modal-stage"
          data-rarity={tier}
          aria-label={CARD_ZOOM_LABEL}
          aria-pressed={zoomed}
          onClick={() => setZoomed((current) => !current)}
        >
          <span className="card-modal-art holo-shine">
            <img src={imageSrc} alt={card.name} />
          </span>
        </button>
      </div>
      <div className="card-modal-info">
        <h2 className="card-modal-name">{card.name}</h2>
        <div className="card-modal-chips">
          {card.set?.name && <CardChip>{card.set.name}</CardChip>}
          {card.rarity && <CardChip tier={tier}>{card.rarity}</CardChip>}
        </div>
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
    </Dialog>
  );
}
