import { useSearchParams } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { CompareView } from "../components/CompareView";
import { usePokemon } from "../hooks/usePokemon";

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const a = searchParams.get("a") ?? "";
  const b = searchParams.get("b") ?? "";

  const { data: dataA, loading: loadingA, error: errorA } = usePokemon(a);
  const { data: dataB, loading: loadingB, error: errorB } = usePokemon(b);

  //same "derived every render, nothing to keep in sync" pattern
  const isSelfCompare = Boolean(dataA && dataB && dataA.id === dataB.id);

  function handlePickSecond(query: string) {
    setSearchParams({ a, b: query });
  }

  if (!a) {
    return (
      <p className="status-message">
        Search for a Pokémon first, then hit Compare to bring it here.
      </p>
    );
  }

  return (
    <section className="compare-panel">
      {loadingA && (
        <p role="status" className="status-message">
          Loading...
        </p>
      )}
      {errorA && (
        <p role="alert" className="status-message status-message--error">
          {errorA}
        </p>
      )}

      {!loadingA && !errorA && dataA && !b && (
        <>
          <h3>Comparing {dataA.name} with...</h3>
          <SearchBar onSubmit={handlePickSecond} />
        </>
      )}

      {b && (
        <>
          {loadingB && (
            <p role="status" className="status-message">
              Loading...
            </p>
          )}
          {errorB && (
            <p role="alert" className="status-message status-message--error">
              {errorB}
            </p>
          )}
          {!loadingB && !errorB && dataB && isSelfCompare && (
            <p role="alert" className="status-message status-message--error">
              Choose a different Pokémon to compare.
            </p>
          )}
          {!loadingB && !errorB && dataA && dataB && !isSelfCompare && (
            <CompareView primary={dataA} secondary={dataB} />
          )}
        </>
      )}
    </section>
  );
}
