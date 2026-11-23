import "./HeartBurst.css";
import type { CSSProperties } from "react";

//eight pieces of confetti around the Favorite button (spec 6.2): where each
//one flies to, in px from the button's center, alternating squares and
//circles. a fixed pattern, like ShinySparkle's stars
const PIECES = [
  { dx: -46, dy: -40, round: false },
  { dx: -6, dy: -62, round: true },
  { dx: 40, dy: -46, round: false },
  { dx: 58, dy: -6, round: true },
  { dx: 40, dy: 36, round: false },
  { dx: -4, dy: 50, round: true },
  { dx: -48, dy: 30, round: false },
  { dx: -62, dy: -6, round: true },
] as const;

//the burst when a Pokémon becomes a favorite. the pieces take the type
//color from the theme (--theme-accent), so a Fire favorite bursts orange.
//decorative: the button's aria-pressed and the confirmation line carry
//the meaning. the parent renders it with key={popKey}, so every add is a
//NEW element and the animation plays again from the start
export function HeartBurst() {
  return (
    <span className="heart-burst" aria-hidden="true">
      {PIECES.map((piece, i) => (
        <i
          key={i}
          className="heart-burst__piece"
          data-round={piece.round || undefined}
          style={
            {
              "--dx": `${piece.dx}px`,
              "--dy": `${piece.dy}px`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
