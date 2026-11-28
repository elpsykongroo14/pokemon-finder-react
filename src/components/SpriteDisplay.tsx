import "./SpriteDisplay.css";
import { useState, type CSSProperties, type SyntheticEvent } from "react";
import {
  resolveSprite,
  integerScale,
  transparentRowsBelow,
} from "../lib/sprites";
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
          grounded={plain}
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

//the empty rows under the sprite's lowest visible pixel, read off a canvas.
//0 whenever it cannot be read: no canvas (jsdom), or a tainted one
function measureFloor(image: HTMLImageElement): number {
  const { naturalWidth: width, naturalHeight: height } = image;
  if (!width || !height) return 0;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return 0;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, width, height);
    return transparentRowsBelow(data, width, height);
  } catch {
    return 0;
  }
}

function SpriteImage({
  sprite,
  alt,
  box,
  lazy,
  maxScale,
  grounded,
}: {
  sprite: ResolvedSprite;
  alt: string;
  box: number;
  lazy: boolean;
  maxScale?: number;
  //true (the "plain" sprites that stand on a platform): move the image
  //down by its empty bottom rows, so the feet touch the platform instead
  //of floating over it. reading pixels needs a CORS request; if that
  //fails, the image loads again the ordinary way and simply stays put
  grounded: boolean;
}) {
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [cors, setCors] = useState(grounded);
  //how far to move down, in % of the image's own height (translate's %
  //is relative to the element itself), so it holds at any zoom
  const [drop, setDrop] = useState(0);

  function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    if (grounded && cors && image.naturalHeight) {
      setDrop((measureFloor(image) / image.naturalHeight) * 100);
    }
    if (sprite.kind === "artwork") return;
    const { naturalWidth, naturalHeight } = image;
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
      crossOrigin={cors ? "anonymous" : undefined}
      onLoad={handleLoad}
      onError={() => {
        if (cors) setCors(false);
      }}
      style={
        width || drop
          ? {
              width,
              translate: drop ? `0 ${drop.toFixed(2)}%` : undefined,
            }
          : undefined
      }
    />
  );
}
