import { getSpriteUrl } from "../lib/sprites";
import type { PokemonSprites } from "../lib/sprites";

interface SpriteDisplayProps {
  sprites: PokemonSprites;
  name: string;
  shiny: boolean;
}

export function SpriteDisplay({ sprites, name, shiny }: SpriteDisplayProps) {
  const spriteUrl = getSpriteUrl(sprites, { shiny });

  if (!spriteUrl) {
    return <div className="sprite-placeholder">No image available</div>;
  }

  return (
    <img
      className="sprite-display"
      src={spriteUrl}
      alt={`${name}${shiny ? "(shiny)" : ""}`}
    />
  );
}
