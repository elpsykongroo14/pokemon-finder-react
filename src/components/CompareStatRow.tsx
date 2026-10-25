import "./CompareStatRow.css";
import {
  compareStat,
  outcomeForSide,
  type StatOutcome,
} from "../lib/statComparison";
import { STAT_OUCOME_TEXT } from "../lib/copy";

interface compareStatRowProps {
  label: string;
  leftValue: number;
  rightValue: number;
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
}: {
  value: number;
  outcome: StatOutcome;
}) {
  return (
    <span className={`compare-stat-value${OUTCOME_CLASS[outcome]}`}>
      {value}
      <span className="compare-stat-mark" aria-hidden="true">
        {OUTCOME_MARK[outcome]}
      </span>
      <span className="visually-hidden">{STAT_OUCOME_TEXT[outcome]}</span>
    </span>
  );
}

export function CompareStatRow({
  label,
  leftValue,
  rightValue,
}: compareStatRowProps) {
  //recomputed from scratch every render, straight off the two props
  //never stored, so theres no window where this can disagree with leftValue/rightValue

  const winner = compareStat(leftValue, rightValue);

  return (
    <div className="compare-stat-row">
      <StatValue value={leftValue} outcome={outcomeForSide(winner, "left")} />
      <span className="compare-stat-label">{label}</span>
      <StatValue value={rightValue} outcome={outcomeForSide(winner, "right")} />
    </div>
  );
}
