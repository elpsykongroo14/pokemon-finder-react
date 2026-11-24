import { getRarityTier } from "../lib/tcg";
import type { TCGCard } from "../lib/type";

interface HoloCardProps {
  card: TCGCard;
  //"large" for the dialog; everything else shows the small scan
  size?: "small" | "large";
  //the dialog's one card is wanted now; a grid of 50 is not
  eager?: boolean;
  //the picture's text alternative: empty (the default) where the button
  //around it is named, the card's name where the picture IS the content
  alt?: string;
}

//a trading card, drawn (spec 7.4): the picture, a glare and a foil band
//that styles/holo.css lays over it. this is NOT interactive on its own:
//the tile, pocket, hand slot or dialog around it is the button, carries
//the class "holo-target", and receives useHoloPointer's CSS variables.
//the variables inherit down to this face, which reads them to tilt.
//the picture's alt is empty because the button around it is named
export function HoloCard({
  card,
  size = "small",
  eager = false,
  alt = "",
}: HoloCardProps) {
  const src =
    size === "large"
      ? card.images?.large || card.images?.small
      : card.images?.small;

  return (
    <span className="holo-card" data-rarity={getRarityTier(card.rarity)}>
      {src && (
        <img
          className="holo-card__image"
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      )}
    </span>
  );
}
