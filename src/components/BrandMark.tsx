import "./BrandMark.css";

interface BrandMarkProps {
  size?: number;
}

//the Black & White mark (spec 5.1): a disc with a heavy Ink ring, split on
//the app's 13 degree slant, one half black and one half white. the whole
//design language in one glyph. original, not any game's ball.
//colors come from the plate roles in CSS, so the mark never re-tints:
//the interface is black and white, only Pokémon bring color
export function BrandMark({ size = 30 }: BrandMarkProps) {
  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 30 30"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="brand-mark__disc" cx="15" cy="15" r="13.5" />
      {/* the dark half: an arc from top to bottom, its chord leaning 13deg */}
      <path
        className="brand-mark__half"
        d="M18.1 1.9 A13.5 13.5 0 0 0 11.9 28.1 Z"
      />
    </svg>
  );
}
