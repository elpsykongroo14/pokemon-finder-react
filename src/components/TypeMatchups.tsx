import "./TypeMatchups.css";
import { useId } from "react";
import { TypeBadge } from "./TypeBadge";
import { groupMatchups, type Matchup } from "../lib/typeEffectiveness";
import { IMMUNE_TO_LABEL, RESISTS_LABEL, WEAK_TO_LABEL } from "../lib/copy";

interface TypeMatchupsProps {
  //the defending Pokémon's types, primary first
  types: string[];
}

//one labelled list of chips. the label is a plain paragraph that NAMES the
//list (aria-labelledby), not a heading: on phones these sit inside a tab
//panel with no heading above them, and a stray h4 would break the outline
function MatchupList({
  label,
  matchups,
}: {
  label: string;
  matchups: Matchup[];
}) {
  const labelId = useId();

  return (
    <div className="type-matchups__group">
      <p id={labelId} className="type-matchups__label">
        {label}
      </p>
      <ul className="type-matchups__chips" aria-labelledby={labelId}>
        {matchups.map((m) => (
          <li key={m.type}>
            <TypeBadge typeName={m.type} multiplier={m.multiplier} />
          </li>
        ))}
      </ul>
    </div>
  );
}

//"Type matchups" (spec 7.2): how hard every attacking type hits this
//Pokémon, sorted into the three lists people read. the sorting is a pure,
//tested function (groupMatchups); this component only draws it.
//a list only appears when it has something in it
export function TypeMatchups({ types }: TypeMatchupsProps) {
  const { weak, resists, immune } = groupMatchups(types);

  return (
    <div className="type-matchups">
      {weak.length > 0 && <MatchupList label={WEAK_TO_LABEL} matchups={weak} />}
      {resists.length > 0 && (
        <MatchupList label={RESISTS_LABEL} matchups={resists} />
      )}
      {immune.length > 0 && (
        <MatchupList label={IMMUNE_TO_LABEL} matchups={immune} />
      )}
    </div>
  );
}
