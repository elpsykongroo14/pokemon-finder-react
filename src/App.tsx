import { useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { PokemonCard } from "./components/PokemonCard";
import { CompareButton } from "./components/CompareButton";
import { CompareView } from "./components/CompareView";
import { usePokemon } from "./hooks/usePokemon";
import { FavoriteList } from "./components/FavoritesList";
import { TeamSLots } from "./context/TeamSlots";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  //four states to account for here
  //idle: nothing searched yet
  //loading: fetch is in flight
  //error: fetch failed
  //success: data is populated, show the PokemonCard
  const { data, loading, error } = usePokemon(query);

  const [compareMode, setCompareMode] = useState(false);
  const [compareQuery, setCompareQuery] = useState("");
  const {
    data: compareData,
    loading: compareLoading,
    error: compareError,
  } = usePokemon(compareQuery);

  function handleToggleCompare() {
    setCompareMode((prev) => !prev);
    setCompareQuery(""); // always start a fresh comparison, in either direction
  }
  //derived, not store recomputed every render from the two live results,
  //no useEffect keeping a "isSelfCompare" flag in sync, because theres nothing to keep in sync:
  //this line is the check, every single render.
  const isSelfCompare = Boolean(
    data && compareData && data.id === compareData.id,
  );

  return (
    <main className="app">
      <h1>Pokémon Finder</h1>
      <SearchBar onSubmit={setQuery} />
      <FavoriteList onSelect={setQuery} />
      <TeamSLots onSelect={setQuery} />

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
            <CompareButton
              active={compareMode}
              onToggle={handleToggleCompare}
            />
          </div>
          <PokemonCard pokemon={data} />
        </>
      )}

      {!loading && !error && !data && (
        <p className="status-message">Search for a Pokémon to get started.</p>
      )}

      {compareMode && data && (
        <section className="compare-panel">
          <SearchBar onSubmit={setCompareQuery} />

          {compareLoading && (
            <p role="status" className="status-message">
              Loading…
            </p>
          )}
          {compareError && (
            <p role="alert" className="status-message status-message--error">
              {compareError}
            </p>
          )}
          {!compareLoading && !compareError && compareData && isSelfCompare && (
            <p role="alert" className="status-message status-message--error">
              Choose a different Pokémon to compare.
            </p>
          )}
          {!compareLoading &&
            !compareError &&
            compareData &&
            !isSelfCompare && (
              <CompareView primary={data} secondary={compareData} />
            )}
        </section>
      )}
    </main>
  );
}
export default App;
