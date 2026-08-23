import { useParams, useNavigate } from "react-router-dom";
import { usePokemon } from "../hooks/usePokemon";
import { PokemonCard } from "../components/PokemonCard";

export function PokemonPage() {
  const { name } = useParams<{ name: string }>(); //this line reads the dynamic segment straight off the current URL.
  //it just reflects whatever the router already matched to get this component rendered in the first place
  //useParams here just reads result
  const navigate = useNavigate();
  const { data, loading, error } = usePokemon(name ?? "");

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
