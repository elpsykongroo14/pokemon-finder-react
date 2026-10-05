import "./PokemonPage.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { usePokemon } from "../hooks/usePokemon";
import { PokemonCard } from "../components/PokemonCard";
import { useTypeTheme } from "../hooks/useTypeTheme";

export function PokemonPage() {
  const { name } = useParams<{ name: string }>(); //this line reads the dynamic segment straight off the current URL.
  //it just reflects whatever the router already matched to get this component rendered in the first place
  //useParams here just reads result
  const navigate = useNavigate();
  const { data, loading, error } = usePokemon(name ?? "");

  useTypeTheme(error ? undefined : data?.types.map((t) => t.type.name));
  //usePokemon does not clear data when name changes
  //so while the next Pokemon loads, data still holds the previous one
  //thats gives us a good property for free
  //moving pikachu->charizard goes yellow -> orange directly instead of
  // yellow -> default -> orange, which would flicker, but if the new fetch fails, data is still the old pokemon and the page would show an error while wearing the old pokemon's colors
  //so we pass undefined on error.

  if (!name) {
    return <p className="status-message">No Pokémon specified</p>;
  }

  return (
    <>
      {loading && (
        <p role="status" className="status-message">
          Loading…
        </p>
      )}
      {error && (
        <p role="alert" className="status-message status-message--error">
          {error}
        </p>
      )}

      {!loading && !error && data && (
        <>
          <div className="card-header-actions">
            <button
              type="button"
              className="compare-button"
              onClick={() =>
                navigate(`/compare?a=${encodeURIComponent(data.name)}`)
              }
            >
              ⚔️ Compare
            </button>

            <Link
              to={`/library/${encodeURIComponent(data.name)}`}
              className="tcg-btn"
            >
              View Cards
            </Link>
          </div>
          <PokemonCard pokemon={data} />
        </>
      )}

      {!loading && !error && !data && (
        <p className="status-message">No results for "{name}".</p>
      )}
    </>
  );
}
