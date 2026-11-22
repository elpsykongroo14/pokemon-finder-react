import "./ShinySparkle.css";
import type { CSSProperties } from "react";

//one four-point star (spec 6.2): white, with an Ink outline so it reads on
//every sky, from Electric's yellow to Ghost's purple
const STAR_PATH =
  "M12 1.5l2.3 8.2 8.2 2.3-8.2 2.3L12 22.5l-2.3-8.2L1.5 12l8.2-2.3z";

//where each star sits (its center, in percent of the sprite box, so some
//stand just outside it) and when it starts. fixed, not Math.random(): the
//same burst every time is easier to test, and a designed arrangement
//looks better than a random one
const STARS = [
  { x: -4, y: 22, delay: 0 },
  { x: 108, y: 10, delay: 90 },
  { x: 50, y: -6, delay: 130 },
  { x: 104, y: 62, delay: 170 },
  { x: 0, y: 74, delay: 240 },
] as const;

//the "it's shiny!" moment: five stars pop around the sprite, once. purely
//decorative (the Shiny button already says it is on), so the whole burst
//is hidden from screen readers
export function ShinySparkle() {
  return (
    <div className="shiny-sparkle" aria-hidden="true">
      {STARS.map((star, i) => (
        <svg
          key={i}
          className="shiny-sparkle__star"
          viewBox="0 0 24 24"
          style={
            {
              "--x": `${star.x}%`,
              "--y": `${star.y}%`,
              "--delay": `${star.delay}ms`,
            } as CSSProperties
          }
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}
