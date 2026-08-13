import { useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { PokemonCard } from "./components/PokemonCard";
import { usePokemon } from "./hooks/usePokemon";
import { FavoriteList } from "./components/FavoritesList";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  //four states to account for here
  //idle: nothing searched yet
  //loading: fetch is in flight
  //error: fetch failed
  //success: data is populated, show the PokemonCard
  const { data, loading, error } = usePokemon(query);

  return (
    <main className="app">
      <h1>Pokémon Finder</h1>
      <SearchBar onSubmit={setQuery} />
      <FavoriteList onSelect={setQuery} />

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
      {!loading && !error && data && <PokemonCard pokemon={data} />}

      {!loading && !error && !data && (
        <p className="status-message">Search for a Pokémon to get started.</p>
      )}
    </main>
  );
}
export default App;
