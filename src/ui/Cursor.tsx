import { type CSSProperties } from "react";
import "./Cursor.css";

interface CursorProps {
  offset: number; //distance, in px, to translate the cursor along its axis
}

export function Cursor({ offset }: CursorProps) {
  return (
    <span
      className="cursor"
      aria-hidden="true"
      style={{ "--cursor-offset": `${offset}px` } as CSSProperties}
    >
      ▶
    </span>
  );
}
