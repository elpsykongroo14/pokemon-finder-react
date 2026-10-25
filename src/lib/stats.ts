import type { PokemonStat } from "./type";

export const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "speed",
  "special-attack",
  "special-defense",
] as const;

//the highest base stat any pokemon can have in a single stat, so every
//stat bar in the app is measured against the same ruler
export const MAX_BASE_STAT = 255;

//how full a bat should be as a number from 0 to 100
//clamped, so a bad input can never draw a bar outside its track
//and a max of 0 returns 0 instead of dividing by zero
export function percentOf(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

export const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  speed: "Speed",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
};

//StatBarChart specific:
//filters + orders a single pokemon's stats.
//CompareStatsChart doesnt need this shape (see below), so it stays here rather than getting pulled up alongside constats
//not everything that touches a promoted value has to move with it
export function getOrderedStats(stats: PokemonStat[]): PokemonStat[] {
  return STAT_ORDER.map((name) =>
    stats.find((s) => s.stat.name === name),
  ).filter((s): s is PokemonStat => s !== undefined);
}
