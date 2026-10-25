import "./CompareStatRow.css";
import type { CSSProperties } from "react";
import {
  compareStat,
  outcomeForSide,
  type StatOutcome,
} from "../lib/statComparison";
import { STAT_OUCOME_TEXT } from "../lib/copy";
import { MAX_BASE_STAT, percentOf } from "../lib/stats";

type Side = "left" | "right";

interface compareStatRowProps {
  label: string;
  leftValue: number;
  rightValue: number;
  //the ruler both bars are measured against. Defaults to the highest possible base stat
  max?: number;
}

//class names are part of the test contract, so they stay as they were
const OUTCOME_CLASS: Record<StatOutcome, string> = {
  win: " stat-win",
  lose: " stat-lose",
  tie: "",
};

//the visible, non-color cue for sighted users who can't rely on the color change
const OUTCOME_MARK: Record<StatOutcome, string> = {
  win: "▲",
  lose: "▼",
  tie: "=",
};

function StatValue({
  value,
  outcome,
  side,
}: {
  value: number;
  outcome: StatOutcome;
  side: Side;
}) {
  return (
    <span
      className={`compare-stat-value${OUTCOME_CLASS[outcome]}`}
      data-side={side}
    >
      {value}
      <span className="compare-stat-mark" aria-hidden="true">
        {OUTCOME_MARK[outcome]}
      </span>
      <span className="visually-hidden">{STAT_OUCOME_TEXT[outcome]}</span>
    </span>
  );
}

//one half of the tug-of-war, purely visual: the number and the words already
//say everything, so assistive tech skips the bar instead of hearing it twice
function StatBar({
  percent,
  outcome,
  side,
}: {
  percent: number;
  outcome: StatOutcome;
  side: Side;
}) {
  return (
    <div
      className="compare-stat-bar"
      data-side={side}
      data-outcome={outcome}
      aria-hidden="true"
    >
      <div
        className="compare-stat-bar__fill"
        style={{ "--stat-bar-percent": `${percent}%` } as CSSProperties}
      ></div>
    </div>
  );
}

export function CompareStatRow({
  label,
  leftValue,
  rightValue,
  max = MAX_BASE_STAT,
}: compareStatRowProps) {
  //recomputed from scratch every render, straight off the two props
  //never stored, so theres no window where this can disagree with leftValue/rightValue

  const winner = compareStat(leftValue, rightValue);

  const leftOutcome = outcomeForSide(winner, "left");
  const rightOutcome = outcomeForSide(winner, "right");

  //DOM order is the reading order for a screen reader: label first, then each
  //side, so it hears "speed, 90 higher, 60 lower". CSS grid places the pieces
  //in their visual positions: value, bar, label, bar, value
  return (
    <div className="compare-stat-row">
      <span className="compare-stat-label">{label}</span>
      <StatValue value={leftValue} outcome={leftOutcome} side="left" />
      <StatBar
        percent={percentOf(leftValue, max)}
        outcome={leftOutcome}
        side="left"
      />
      <StatBar
        percent={percentOf(rightValue, max)}
        outcome={rightOutcome}
        side="right"
      />
      <StatValue value={rightValue} outcome={rightOutcome} side="right" />
    </div>
  );
}
