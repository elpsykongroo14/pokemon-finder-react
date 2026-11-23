import "./CompareStatsChart.css";
import { CompareStatRow } from "./CompareStatRow";
import { STAT_ORDER, STAT_LABELS, statTotal } from "../lib/stats";
import { TOTAL_LABEL } from "../lib/copy";
import type { PokemonStat } from "../lib/type";

interface CompareStatsChartprops {
  leftStats: PokemonStat[];
  rightStats: PokemonStat[];
  //each side's primary type, handed to every row so each bar can wear it
  leftType?: string;
  rightType?: string;
}

export function CompareStatsChart({
  leftStats,
  rightStats,
  leftType,
  rightType,
}: CompareStatsChartprops) {
  //first pair every stat by NAME, dropping any stat one side lacks; then
  //number what is left. numbering after the filter keeps the stagger
  //(--stat-index) gap-free even when a stat is missing
  const rows = STAT_ORDER.flatMap((statName) => {
    const leftStat = leftStats.find((s) => s.stat.name === statName);
    const rightStat = rightStats.find((s) => s.stat.name === statName);

    //both sides guarded the same way, in the same branch
    //there is only one branch to check because theres only one return path
    if (!leftStat || !rightStat) return [];
    return [{ statName, left: leftStat.base_stat, right: rightStat.base_stat }];
  });

  return (
    <div className="compare-stats-chart">
      {rows.map((row, index) => (
        <CompareStatRow
          key={row.statName}
          label={STAT_LABELS[row.statName] ?? row.statName}
          leftValue={row.left}
          rightValue={row.right}
          index={index}
          leftType={leftType}
          rightType={rightType}
        />
      ))}
      <CompareStatRow
        label={TOTAL_LABEL}
        leftValue={statTotal(leftStats)}
        rightValue={statTotal(rightStats)}
        variant="total"
      />
    </div>
  );
}

//this does not index anything.
//leftStats.find((s) => s.stat.name === statName) matches by name, not position
//the entire index coupling assumption that caused the original bug (pokemonStats's bars and mainStats' order having to line up positionally)
//isnt just fixed here, its not expressible at all.
//theres no array position anywhere that two things have to agree on.
//(the index on each row is only a delay for the animation, handed out after
//the pairing is done, so it can never pair the wrong stats)
