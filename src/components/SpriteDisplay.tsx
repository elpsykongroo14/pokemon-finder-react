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
  //true: the browser waits to download the image until it is near the screen.
  //right for the things below the fold or in hidden tabs, wrong for
  //the hero sprite, which should start downloading immediately
  lazy?: boolean;
}

export function SpriteDisplay({
  sprites,
  name,
  shiny,
  mode = "artwork",
  animate = false,
  size = 180,
  lazy = false,
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
        <SpriteImage
          key={sprite.url}
          sprite={sprite}
          alt={alt}
          box={size}
          lazy={lazy}
        />
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
  lazy,
}: {
  sprite: ResolvedSprite;
  alt: string;
  box: number;
  lazy: boolean;
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
      loading={lazy ? "lazy" : undefined}
      onLoad={handleLoad}
      style={width ? { width } : undefined}
    />
  );
}
