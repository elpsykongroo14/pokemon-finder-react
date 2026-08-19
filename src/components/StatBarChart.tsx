import { StatBar } from "./StatBar";
import type { PokemonStat } from "../lib/type";
import { STAT_LABELS, getOrderedStats } from "../lib/stats";

const MAX_STAT = 225;

interface StatBarChartProps {
  stats: PokemonStat[];
}

export function StatBarChart({ stats }: StatBarChartProps) {
  const orderedStats = getOrderedStats(stats);

  const highestValue = Math.max(...orderedStats.map((s) => s.base_stat));

  return (
    <div className="stat-bar-chart">
      {orderedStats.map((stat) => (
        <StatBar
          key={stat.stat.name}
          label={STAT_LABELS[stat.stat.name] ?? stat.stat.name}
          value={stat.base_stat}
          maxValue={MAX_STAT}
          isHighest={stat.base_stat === highestValue}
        />
      ))}
    </div>
  );
}
