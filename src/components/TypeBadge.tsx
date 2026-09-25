//this one only needs to know which type its rendering,
//everything else (the color) it can look up itself
import "./TypeBadge.css";
import type { CSSProperties } from "react";

interface TypeBadgeProps {
  typeName: string;
}

export function TypeBadge({ typeName }: TypeBadgeProps) {
  //the type-to-color map now lives once in src/styles/tokens.css, as
  //--type-fire, --type-water, etc.PokeAPI's type names already match those token suffixes exactly
  //so instead of a JS lookup object we just build the variable's name and hand it to var() as a fallback chain.
  //we set ONE custome property here, the stylesheet decides what to do with it
  //(border color, text color,...) via the .type-badge rule
  const badgeStyle = {
    "--badge-color": `var(--type-${typeName}, var(--color-text-secondary))`,
  } as CSSProperties;
  return (
    <span className="type-badge" style={badgeStyle}>
      {typeName}
    </span>
  );
}
