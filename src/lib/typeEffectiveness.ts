// static game data 18 attacking types, hardcoded once, same reasoning
// as typeColors: this never changes, so it never needs to be fetched.
//
// double: this attacking type deals 2x damage to these defending types
// half:   0.5x damage
// immune: 0x damage
// omitted from all three = 1x (normal damage)
export interface TypeMatchup {
  double?: string[];
  half?: string[];
  immune?: string[];
}

export const TYPE_CHART: Record<string, TypeMatchup> = {
  normal: { immune: ["ghost"], half: ["rock", "steel"] },
  fire: {
    double: ["grass", "ice", "bug", "steel"],
    half: ["fire", "water", "rock", "dragon"],
  },
  water: {
    double: ["fire", "ground", "rock"],
    half: ["water", "grass", "dragon"],
  },
  electric: {
    double: ["water", "flying"],
    half: ["electric", "grass", "dragon"],
    immune: ["ground"],
  },
  grass: {
    double: ["water", "ground", "rock"],
    half: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
  },
  ice: {
    double: ["grass", "ground", "flying", "dragon"],
    half: ["water", "ice", "steel"],
  },
  fighting: {
    double: ["normal", "ice", "rock", "dark", "steel"],
    half: ["poison", "flying", "psychic", "bug", "fairy"],
    immune: ["ghost"],
  },
  poison: {
    double: ["grass", "fairy"],
    half: ["poison", "ground", "rock", "ghost"],
    immune: ["steel"],
  },
  ground: {
    double: ["fire", "electric", "poison", "rock", "steel"],
    half: ["grass", "bug"],
    immune: ["flying"],
  },
  flying: {
    double: ["grass", "fighting", "bug"],
    half: ["electric", "rock", "steel"],
  },
  psychic: {
    double: ["fighting", "poison"],
    half: ["psychic", "steel"],
    immune: ["dark"],
  },
  bug: {
    double: ["grass", "psychic", "dark"],
    half: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
  },
  rock: {
    double: ["fire", "ice", "flying", "bug"],
    half: ["fighting", "ground", "steel"],
  },
  ghost: {
    double: ["psychic", "ghost"],
    half: ["dark"],
    immune: ["normal", "fighting"],
  },
  dragon: { double: ["dragon"], half: ["steel"], immune: ["fairy"] },
  dark: {
    double: ["psychic", "ghost"],
    half: ["fighting", "dark", "fairy"],
  },
  steel: {
    double: ["ice", "rock", "fairy"],
    half: ["fire", "water", "electric", "steel"],
  },
  fairy: {
    double: ["fighting", "dragon", "dark"],
    half: ["fire", "poison", "steel"],
  },
};

// given a pokemon's own type(s) (the defending side), work out how hard
// every attacking type in the game hits it, as a multiplier.
export function computeDefensiveChart(
  pokemonTypes: string[],
): Record<string, number> {
  const multipliers: Record<string, number> = {};

  Object.entries(TYPE_CHART).forEach(([attackingType, chart]) => {
    let multiplier = 1;

    // a dual-type pokemon (e.g. Charizard: fire/flying) gets hit by
    // both its types' matchups, multiplied together that's how a 4x
    // weakness happens: two separate 2x matchups compounding.
    pokemonTypes.forEach((defendingType) => {
      if (chart.double?.includes(defendingType)) {
        multiplier *= 2;
      } else if (chart.half?.includes(defendingType)) {
        multiplier *= 0.5;
      } else if (chart.immune?.includes(defendingType)) {
        multiplier *= 0;
      }
      // not listed at all → stays 1x, no change needed
    });

    multipliers[attackingType] = multiplier;
  });

  return multipliers;
}
