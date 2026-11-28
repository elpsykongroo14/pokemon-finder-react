import "./BrandMark.css";

interface BrandMarkProps {
  size?: number;
}

//the app's mark (spec 5.1): a Poké Ball in the Black & White palette. a
//heavy Ink ring, an Ink top half, a white bottom half, the Ink band across
//the middle and the white button in its centre.
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
      {/* the top half: the arc over the top, closed along the middle */}
      <path
        className="brand-mark__half"
        d="M1.5 15 A13.5 13.5 0 0 1 28.5 15 Z"
      />
      {/* the band across the middle */}
      <path className="brand-mark__band" d="M1.5 15 H28.5" />
      {/* the button, drawn last so it sits on the band */}
      <circle className="brand-mark__button" cx="15" cy="15" r="4.25" />
    </svg>
  );
}
