import "./PokemonActions.css";
import { useId } from "react";
import { FavoriteButton } from "./FavoriteButton";
import { TeamStatus, TeamToggle } from "../context/TeamButton";
import { useTeamAction } from "../hooks/useTeamAction";
import { TransitionLink } from "./TransitionLink";
import { useFavorites } from "../hooks/useFavorites";
import { ACTIONS_COLLECT_LABEL, ACTIONS_EXPLORE_LABEL } from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

interface PokemonActionsProps {
  pokemon: PokemonDetails;
}

//what we can do with this pokemon, sorted by what each contol acts on
//  Collect  = buttons that change our collection (favorites, team)
//  Explore  = links that take us to another page (compare, cards)
//how the sprite looks is not here anymore: those switches live on the Stage,
//next to the sprite they change
//the team feature's messages (party full, party complete, errors) are about
//the whole party, not one button, so they are drawn once, under both  groups
//instead of inside "Collect" where they could only make one group taller

export function PokemonActions({ pokemon }: PokemonActionsProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const name = encodeURIComponent(pokemon.name);
  const collectId = useId();
  const exploreId = useId();
  const teamAction = useTeamAction(pokemon);

  return (
    <div className="pokemon-actions">
      {/* role="group" + aria-labelledby: a screen reader announces
          "Collect, group" on entering, from the same caption people see */}
      <div
        className="pokemon-actions__group"
        role="group"
        aria-labelledby={collectId}
      >
        <span id={collectId} className="pokemon-actions__caption">
          {ACTIONS_COLLECT_LABEL}
        </span>
        <div className="pokemon-actions__row">
          <FavoriteButton
            isFavorite={isFavorite(pokemon.name)}
            onToggle={() => toggleFavorite(pokemon)}
          />
          <TeamToggle action={teamAction} />
        </div>
      </div>

      <div
        className="pokemon-actions__group"
        role="group"
        aria-labelledby={exploreId}
      >
        <span id={exploreId} className="pokemon-actions__caption">
          {ACTIONS_EXPLORE_LABEL}
        </span>
        <div className="pokemon-actions__row">
          <TransitionLink to={`/compare?a=${name}`} variant="secondary">
            ⚔️ Compare
          </TransitionLink>
          <TransitionLink to={`/library/${name}`} variant="secondary">
            View Cards
          </TransitionLink>
        </div>
      </div>

      <TeamStatus action={teamAction} />
    </div>
  );
}
