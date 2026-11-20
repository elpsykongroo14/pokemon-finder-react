import "./ShinySparkle.css";
import type { CSSProperties } from "react";
import { PixelArt } from "../ui/PixelArt";

//one 7x7 pixel star, drawn with the same text-to-SVG system as the 404 scene.
//the dark outline ("o") keeps it readable on light type colors (Fire's
//peach, Electric's yellow), the trick pixel art always uses for contrast
const STAR_PALETTE = { o: "#6b4a00", W: "#fffbe6", Y: "#ffd84a" } as const;
const STAR_LAYERS = [
  {
    name: "star",
    rows: [
      "...o...",
      "..oWo..",
      ".ooYoo.",
      "oWYWYWo",
      ".ooYoo.",
      "..oWo..",
      "...o...",
    ],
  },
] as const;

//fixed positions around the sprite (percent of the sprite box) and a size
//each. fixed, not Math.random(): the same burst every time is easier to
//test, and a designed arrangement looks better than a random one
const SPARKLES = [
  { x: 20, y: 18, size: 34 },
  { x: 78, y: 14, size: 26 },
  { x: 90, y: 50, size: 30 },
  { x: 72, y: 82, size: 22 },
  { x: 24, y: 78, size: 28 },
  { x: 8, y: 46, size: 22 },
] as const;

//the "it's shiny!" moment: six pixel stars pop around the sprite, one after
//another, once. purely decorative (the switch already says Shiny is on), so
//the whole burst is hidden from screen readers
export function ShinySparkle() {
  return (
    <div className="shiny-sparkle" aria-hidden="true">
      {SPARKLES.map((sparkle, i) => (
        <span
          key={i}
          className="shiny-sparkle__star"
          style={
            {
              "--x": `${sparkle.x}%`,
              "--y": `${sparkle.y}%`,
              "--size": `${sparkle.size}px`,
              "--i": i,
            } as CSSProperties
          }
        >
          <PixelArt
            width={7}
            height={7}
            palette={STAR_PALETTE}
            layers={STAR_LAYERS}
            label=""
          />
        </span>
      ))}
    </div>
  );
}
