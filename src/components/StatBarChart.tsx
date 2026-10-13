import "./StatBarChart.css";
import { StatMeter } from "../ui/StatMeter";
import type { PokemonStat } from "../lib/type";
import { STAT_LABELS, getOrderedStats } from "../lib/stats";

const MAX_STAT = 255;

interface StatBarChartProps {
  stats: PokemonStat[];
}

//decides which stats to show in what order, and which one stands out
//drawing a single bar is StatMeter's job.
export function StatBarChart({ stats }: StatBarChartProps) {
  const orderedStats = getOrderedStats(stats);

  const highestValue = Math.max(...orderedStats.map((s) => s.base_stat));

  return (
    <div className="stat-bar-chart">
      {orderedStats.map((stat, index) => (
        <StatMeter
          key={stat.stat.name}
          label={STAT_LABELS[stat.stat.name] ?? stat.stat.name}
          value={stat.base_stat}
          max={MAX_STAT}
          variant={stat.base_stat === highestValue ? "highest" : "default"}
          index={index}
        />
      ))}
    </div>
  );
}
