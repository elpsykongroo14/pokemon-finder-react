import "./BrandMark.css";

interface BrandMarkProps {
  size?: number;
}

//an original mark: a tilted "dex lens", not a copy of any game's ball
//every color comes from a semantic token, and the top half reads
//--theme-accent, so the logo re-tints with the Pokemon's type for free
export function BrandMark({ size = 32 }: BrandMarkProps) {
  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="rotate(-30 16 16)">
        <path className="brand-mark__top" d="M2 16A14 14 0 0 1 30 16Z" />
        <path className="brand-mark__bottom" d="M2 16A14 14 0 0 0 30 16Z" />
        <rect
          className="brand-mark__band"
          x="2"
          y="14.25"
          width="28"
          height="3.5"
        />
        <circle className="brand-mark__outline" cx="16" cy="16" r="14" />
        <circle className="brand-mark__button" cx="16" cy="16" r="4.5" />
      </g>
    </svg>
  );
}
