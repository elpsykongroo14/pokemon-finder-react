import { type CSSProperties } from "react";
import "./Cursor.css";

interface CursorProps {
  //how far to slide along the axis, a number is read as px (Menu uses this):
  //a string is passed through as a CSS length, so "200%" means
  //"two cursor widths", which is how MainNav moves between equal width cells
  offset: number | string;
  axis?: "x" | "y";
}

export function Cursor({ offset, axis = "y" }: CursorProps) {
  const length = typeof offset === "number" ? `${offset}px` : offset;

  return (
    <span
      className="cursor"
      data-axis={axis}
      aria-hidden="true"
      style={{ "--cursor-offset": length } as CSSProperties}
    >
      ▶
    </span>
  );
}
