import { useId, type CSSProperties } from "react";
import { usePreferences } from "../hooks/usePreferences";
import { usePrefersReduceMotion } from "../hooks/usePrefersReducedMotion";
import { useCountUp } from "../hooks/useCountUp";
import "./StatMeter.css";

export type MeterVariant = "default" | "highest" | "tiered";

interface statMeterProps {
  label: string;
  value: number;
  max: number;
  variant?: MeterVariant;
}

function tierFor(percent: number): "low" | "mid" | "high" {
  if (percent <= 20) return "low";
  if (percent <= 50) return "mid";
  return "high";
}

export function StatMeter({
  label,
  value,
  max,
  variant = "default",
}: statMeterProps) {
  const { animationsEnabled } = usePreferences();
  const prefersReduceMotion = usePrefersReduceMotion();
  const animate = animationsEnabled && !prefersReduceMotion;

  const shown = useCountUp(value, animate);
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const labelId = useId(); //first instinct was id={`stat-meter-label-${label}`}
  //that breaks the instant two StatMeters share a label
  //and they will, the moment a Compare page shows two Pokémon's "HP" bars side by side.
  //two elements with the same id is invalid HTML, and aria-labelledby pointing at a duplicated id has undefined behavior across browsers

  return (
    <div
      className="stat-meter"
      data-variant={variant}
      data-tier={variant === "tiered" ? tierFor(percent) : undefined}
    >
      <span className="stat-meter__label" id={labelId}>
        {label}
      </span>
      <div
        className="stat-meter__track"
        role="meter" //specifically, not role="progressbar"
        //these are easy to reach for interchangeably, but they mean different things in the ARIA spec
        //progressbar represents how much of a task is complete a file upload, a loading spinner
        //meter represents a scalar measurement within a known range exactly what HP, Attack, or Speed are
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={labelId}
      >
        <div
          className="stat-meter__fill"
          style={{ "--stat-meter-percent": `${percent}%` } as CSSProperties}
        />
      </div>
      <span className="stat-meter__value">{shown}</span>
    </div>
  );
}
