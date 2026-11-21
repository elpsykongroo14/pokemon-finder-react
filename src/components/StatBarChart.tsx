import "./StatBarChart.css";
import { StatMeter } from "../ui/StatMeter";
import type { PokemonStat } from "../lib/type";
import { STAT_LABELS, MAX_BASE_STAT, getOrderedStats } from "../lib/stats";

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
          max={MAX_BASE_STAT}
          variant={stat.base_stat === highestValue ? "highest" : "default"}
          index={index}
        />
      ))}
      {/* the scale: "0" and "255" at the two ends of the track column.
          aria-hidden because every meter already tells a screen reader
          its own min and max */}
      <div className="stat-bar-chart__scale" aria-hidden="true">
        <span className="stat-bar-chart__range">
          <span>0</span>
          <span>{MAX_BASE_STAT}</span>
        </span>
      </div>
    </div>
  );
}
