//this one only needs to know which type its rendering,
//everything else (the color) it can look up itself
import "./TypeBadge.css";
import { multiplierSpoken, multiplierText } from "../lib/copy";

export type TypeBadgeSize = "sm" | "md" | "lg";

interface TypeBadgeProps {
  typeName: string;
  //sm: team cards and autocomplete rows, md: everywhere else,
  //lg: the name plate on the Pokémon page
  size?: TypeBadgeSize;
  //type matchups (B&W-4): how much damage this type deals to the Pokémon.
  //left out, the chip is just a type
  multiplier?: number;
}

export function TypeBadge({
  typeName,
  size = "md",
  multiplier,
}: TypeBadgeProps) {
  return (
    <span className="type-badge" data-type={typeName} data-size={size}>
      {typeName}
      {multiplier !== undefined && (
        <>
          {/* two copies of one fact: the glyph for eyes ("×½"), the words
              for screen readers ("half damage"). the comma makes a screen
              reader pause: "ground, half damage" */}
          <span className="type-badge__multiplier" aria-hidden="true">
            {multiplierText(multiplier)}
          </span>
          <span className="visually-hidden">{`, ${multiplierSpoken(multiplier)}`}</span>
        </>
      )}
    </span>
  );
}
