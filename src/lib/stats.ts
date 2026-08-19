import type { PokemonStat } from "./type";

export const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "speed",
  "special-attack",
  "special-defense",
] as const;

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
