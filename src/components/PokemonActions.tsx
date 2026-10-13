import "./PokemonActions.css";
import { FavoriteButton } from "./FavoriteButton";
import { TeamButton } from "../context/TeamButton";
import { TransitionLink } from "./TransitionLink";
import { Toggle } from "../ui/Toggle";
import { useFavorites } from "../hooks/useFavorites";
import type { PokemonDetails } from "../lib/type";

interface PokemonActionsProps {
  pokemon: PokemonDetails;
  shiny: boolean;
  onShinyChange: (shiny: boolean) => void;
}

//everything you can do with this pokemon, in one place.
//buttons act on this page (favorite, team, shiny); links take us
//somewhere else (compare, cards), so they are real <a href> elements.

export function PokemonActions({
  pokemon,
  shiny,
  onShinyChange,
}: PokemonActionsProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const name = encodeURIComponent(pokemon.name);

  return (
    <div className="pokemon-actions">
      <FavoriteButton
        isFavorite={isFavorite(pokemon.name)}
        onToggle={() => toggleFavorite(pokemon)}
      />
      <TeamButton pokemon={pokemon} />
      <Toggle label="Shiny" checked={shiny} onChange={onShinyChange} />
      <TransitionLink to={`/compare?a=${name}`} variant="secondary">
        ⚔️ Compare
      </TransitionLink>
      <TransitionLink to={`/library/${name}`} variant="secondary">
        View Cards
      </TransitionLink>
    </div>
  );
}
