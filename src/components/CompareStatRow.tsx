import { compareStat } from "../lib/statComparison";

interface compareStatRowProps {
  label: string;
  leftValue: number;
  rightvalue: number;
}

export function compareStatRow({
  label,
  leftValue,
  rightvalue,
}: compareStatRowProps) {
  //recomputed from scratch every render, straight off the two props
  //never stored, so theres no window where this can disagree with leftValue/rightValue

  const winner = compareStat(leftValue, rightvalue);

  return (
    <div className="compare-stat-row">
      <span
        className={`compare-stat-value${winner === "left" ? "stat-win" : winner === "right" ? "stat-lose" : ""}`}
      >
        {leftValue}
      </span>
      <span className={`compare-stat-label`}>{label}</span>
      <span
        className={`compare-stat-value${
          winner === "right"
            ? " stat-win"
            : winner === "left"
              ? " stat-lose"
              : ""
        }`}
      >
        {rightvalue}
      </span>
    </div>
  );
}

//this the fix for the original bug in the vanilla version
//highlighStats() had to reach the DOM twice per stat (pokemonStats.querySelectorAll(...)[indx] and compareStats.querySelectorAll(...)[index]),
//trust that both queries returned elements in the same order the loop expected, and mutate className on  whatever it found
//three seperate places index coupling could quietly break.
//here, winner is computed once from two arguments that were handed to this component directly, by name.
//theres no once from two arguments that were handed to this component directly by name.
//theres no index anywhere in this file, the className is a direct, synchronous function of the two props
//nothing to get out of sync because nothing is stored in between
