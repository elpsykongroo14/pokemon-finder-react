import { type CSSProperties } from "react";
import "./Skeleton.css";

interface SkeletonProps {
  width: number | string;
  height: number | string;
  label?: string;
  decorative?: boolean;
}

export function Skeleton({
  width,
  height,
  label = "loading",
  decorative = false,
}: SkeletonProps) {
  return (
    <span
      className="skeleton"
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? "true" : undefined}
      style={{ width, height } as CSSProperties}
    />
  );
}

//this is a generic pulsing placeholder box, reusable anywhere something is loading (a Library grid card, a stat block)
