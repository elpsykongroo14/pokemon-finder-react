import "./TierMark.css";
import { Icon } from "./Icon";
import { getRarityTier, type RarityTier } from "../lib/tcg";

interface TierMarkProps {
  //the card's rarity as the API spells it; the mark shows it as it is
  rarity: string | undefined;
}

//the rarity tier mark (spec 7.4): a slanted chip in one of four strengths,
//the same on a tile, a table row, the dialog and the sheet. the TEXT is
//the card's real rarity ("Special Illustration Rare"); the TIER only
//decides how strong it looks, so no rarity is ever renamed. the two shiny
//tiers add a small star, hidden from screen readers: the words already
//say it
export function TierMark({ rarity }: TierMarkProps) {
  const tier = getRarityTier(rarity);
  const shiny = tier === "holo" || tier === "ultra";

  return (
    <span className="tier-mark" data-rarity={tier}>
      {shiny && <Icon name="sparkle" size={11} />}
      <span>{rarity || "unknown"}</span>
    </span>
  );
}

//the legend's small square: the same four looks, no words (the legend
//writes the tier's name beside it)
export function TierSwatch({ tier }: { tier: RarityTier }) {
  return <span className="tier-swatch" data-rarity={tier} aria-hidden="true" />;
}
