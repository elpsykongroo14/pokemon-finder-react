import "./CardChip.css";
import type { ReactNode } from "react";
import type { RarityTier } from "../lib/tcg";

interface CardChipProps {
  //a rarity chip passes its tier; a plain chip (the set name) passes nothing
  tier?: RarityTier;
  children: ReactNode;
}

//a small label for one fact about a card. the tier only decides the border
//and the dot (through --tier-color); the TEXT stays the normal text color,
//so it is readable on both the dark and light theme
export function CardChip({ tier, children }: CardChipProps) {
  return (
    <span className="card-chip" data-rarity={tier}>
      {children}
    </span>
  );
}
