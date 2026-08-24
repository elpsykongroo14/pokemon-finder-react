//the file reads :name from the URL, hands it to the hook
//and owns exactky one piece of local UI state that the hook correctly does not own: which card is currently selected in the modal

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTCGLibrary } from "../hooks/useTCGLibrary";
import { SearchBar } from "../components/SearchBar";
import { TCGCardGrid } from "../components/TCGCardGrid";
import { TCGCardModal } from "../components/TCGCardModal";
import type { TCGCard } from "../lib/type";
import type { SortMode } from "../lib/tcg";

export function LibraryPage() {
  const { name } = useParams<{ name?: string }>();
  const navigate = useNavigate();
  const { title, cards, status, error, sortMode, setSortMode } =
    useTCGLibrary(name);
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null);

  function handleSearch(query: string) {
    navigate(`/library/${encodeURIComponent(query)}`);
  }

  return (
    <section className="library-view">
      <div className="library-header">
        <h2 className="library-title">TCG Library</h2>
        <Link to="/library" className="library-back">
          ← Featured
        </Link>
      </div>
      <SearchBar
        onSubmit={handleSearch}
        placeholder="Search cards by Pokémon  name"
      />

      <div className="card-panel-header">
        <h3 className="card-panel-title">{title}</h3>
        <select
          className="sort-select"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          aria-label="Sort cards"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="rarity">Rarity</option>
        </select>
      </div>

      <TCGCardGrid
        cards={cards}
        status={status}
        error={error}
        emptyMessage={
          name ? `No TCG cards found for "${name}".` : "No cards loaded."
        }
        onSelect={setSelectedCard}
      />

      {selectedCard && (
        <TCGCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </section>
  );
}
