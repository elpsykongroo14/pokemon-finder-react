import { TypeBadge } from "./TypeBadge";
import type { PokemonType } from "../lib/type";

interface TypeBadgeListProps {
  types: PokemonType[];
}

export function TypeBadgeList({ types }: TypeBadgeListProps) {
  return (
    <div className="type-badge-list">
      {/* 
        it renders each array of elements in order. This replaces the forEach + document.createDocumentFragment() + fragment.appendChild() dance from the vanilla renderTypes
        we just describe "for each type, here's a badge," and React does the efficient DOM diffing/attaching for us
      */}
      {types.map((t) => (
        <TypeBadge key={t.type.name} typeName={t.type.name} />
      ))}
    </div>
  );
}
