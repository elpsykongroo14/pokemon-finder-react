import { CompareStatRow } from "./CompareStatRow";
import { STAT_ORDER, STAT_LABELS } from "../lib/stats";
import type { PokemonStat } from "../lib/type";

interface CompareStatsChartprops {
  leftStats: PokemonStat[];
  rightStats: PokemonStat[];
}

export function CompareStatsChart({
  leftStats,
  rightStats,
}: CompareStatsChartprops) {
  return (
    <div className="compare-stats-chart">
      {STAT_ORDER.map((statName) => {
        const leftStat = leftStats.find((s) => s.stat.name === statName);
        const rightStat = rightStats.find((s) => s.stat.name === statName);

        //both sides guarded the same way, in the same branch
        //there is only one branch to check because theres only one return path
        if (!leftStat || !rightStat) return null;

        return (
          <CompareStatRow
            key={statName}
            label={STAT_LABELS[statName] ?? statName}
            leftValue={leftStat.base_stat}
            rightValue={rightStat.base_stat}
          />
        );
      })}
    </div>
  );
}

//this does not index anything.
//leftStats.find((s) => s.stat.name === statName) matches by name, not position
//the entire index coupling assumption that caused the original bug (pokemonStats's bras and mainStats' order having to line up positionally)
//isnt just fixed here, its not expressible at all.
//theres no array position anywhere that two things have to agree on.
