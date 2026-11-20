import "./BallOutline.css";

interface BallOutlineProps {
  size?: number;
}

//the outline version of the brand mark (a tilted orb with a band and a
//center ring), used for empty party slots. outline only, drawn in
//currentColor, so whatever contains it decides its color.
//purely decorative: whatever it sits in is responsible for saying what it means
export function BallOutline({ size = 48 }: BallOutlineProps) {
  return (
    <svg
      className="ball-outline"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="rotate(-30 16 16)">
        <circle cx="16" cy="16" r="13" />
        <line x1="3" y1="16" x2="29" y2="16" />
        <circle cx="16" cy="16" r="4" />
      </g>
    </svg>
  );
}
