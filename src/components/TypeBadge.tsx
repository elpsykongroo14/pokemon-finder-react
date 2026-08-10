//this one only needs to know which type its rendering,
//everything else (the color) it can look up itself

interface TypeBadgeProps {
  typeName: string;
}

//keeping typeColors here instead of keeping it in a shared because the only place where its needed for now
const typeColors: Record<string, string> = {
  fire: "#ff6b35",
  water: "#4a90d9",
  grass: "#5db85d",
  electric: "#f9c523",
  psychic: "#f85888",
  ice: "#96d9d6",
  dragon: "#7038f8",
  dark: "#705848",
  fairy: "#ee99ac",
  fighting: "#c03028",
  flying: "#a890f0",
  poison: "#a040a0",
  ground: "#e0c068",
  rock: "#b8a038",
  bug: "#a8b820",
  ghost: "#705898",
  steel: "#b8b8d0",
  normal: "#a8a878",
};

export function TypeBadge({ typeName }: TypeBadgeProps) {
  return (
    <span
      className="type-badge"
      style={{ backgroundColor: typeColors[typeName] ?? "#777" }}
    >
      {typeName}
    </span>
  );
}
