import "./SpriteDisplay.css";
import { useState, type CSSProperties, type SyntheticEvent } from "react";
import { resolveSprite, integerScale } from "../lib/sprites";
import type {
  PokemonSprites,
  ResolvedSprite,
  SpriteMode,
} from "../lib/sprites";

interface SpriteDisplayProps {
  sprites: PokemonSprites;
  name: string;
  shiny: boolean;
  //defaults keep every existing caller looking exactly as before:
  //artwork, no animation. only the stage opts in to pixel + animated.
  mode?: SpriteMode;
  animate?: boolean;
  size?: number;
}

export function SpriteDisplay({
  sprites,
  name,
  shiny,
  mode = "artwork",
  animate = false,
  size = 180,
}: SpriteDisplayProps) {
  const sprite = resolveSprite(sprites, { shiny, mode, animate });
  const alt = `${name}${shiny ? "(shiny)" : ""}`;

  return (
    <div
      className="sprite-stage"
      style={{ "--sprite-size": `${size}px` } as CSSProperties}
    >
      {sprite ? (
        //key={url}: a new url mounts a fresh SpriteImage, so its
        //measured width resets by itself instead of via an effect
        <SpriteImage key={sprite.url} sprite={sprite} alt={alt} box={size} />
      ) : (
        <div className="sprite-placeholder">No image available</div>
      )}
    </div>
  );
}

function SpriteImage({
  sprite,
  alt,
  box,
}: {
  sprite: ResolvedSprite;
  alt: string;
  box: number;
}) {
  const [width, setWidth] = useState<number | undefined>(undefined);

  function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    if (sprite.kind === "artwork") return;
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const scale = integerScale(
      { width: naturalWidth, height: naturalHeight },
      box,
    );
    setWidth(naturalWidth * scale);
  }

  return (
    <img
      className="sprite-display"
      data-kind={sprite.kind}
      src={sprite.url}
      alt={alt}
      decoding="async"
      onLoad={handleLoad}
      style={width ? { width } : undefined}
    />
  );
}
