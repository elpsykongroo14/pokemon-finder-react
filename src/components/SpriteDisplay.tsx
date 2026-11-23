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
  //true: no dark circle behind the sprite, and it stands on the bottom
  //edge of its box. For places that already have their own backdrop
  plain?: boolean;
  //the largest whole-number zoom a pixel sprite may get (spec 7.1: 3x for
  //the big Black & White sprites, 4x for the small ones). no limit when
  //left out, the way every other caller has always worked
  maxScale?: number;
  //true: alt="" (the image says nothing to a screen reader). for a sprite
  //inside a link or button that already shows the name as text, where the
  //alt would make the name say "deino deino"
  decorative?: boolean;
}

export function SpriteDisplay({
  sprites,
  name,
  shiny,
  mode = "artwork",
  animate = false,
  size = 180,
  lazy = false,
  plain = false,
  maxScale,
  decorative = false,
}: SpriteDisplayProps) {
  const sprite = resolveSprite(sprites, { shiny, mode, animate });
  const alt = decorative ? "" : `${name}${shiny ? "(shiny)" : ""}`;

  return (
    <div
      className="sprite-stage"
      data-plain={plain || undefined}
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
          maxScale={maxScale}
        />
      ) : (
        //decorative: the name next to it already says which Pokémon this
        //is, so "No image available" would only pad a link's name
        <div
          className="sprite-placeholder"
          aria-hidden={decorative || undefined}
        >
          No image available
        </div>
      )}
    </div>
  );
}

function SpriteImage({
  sprite,
  alt,
  box,
  lazy,
  maxScale,
}: {
  sprite: ResolvedSprite;
  alt: string;
  box: number;
  lazy: boolean;
  maxScale?: number;
}) {
  const [width, setWidth] = useState<number | undefined>(undefined);

  function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    if (sprite.kind === "artwork") return;
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const scale = integerScale(
      { width: naturalWidth, height: naturalHeight },
      box,
      maxScale,
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
