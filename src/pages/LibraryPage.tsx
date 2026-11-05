//the file reads :name from the URL, hands it to the hook
//and owns exactly one piece of local UI state that the hook correctly does not own: which card is currently selected in the modal

import "./LibraryPage.css";
import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useTCGLibrary } from "../hooks/useTCGLibrary";
import { useLibraryView } from "../hooks/useLibraryView";
import { useBinderPage } from "../hooks/useBinderPage";
import { SegmentedControl } from "../ui/SegmentedControl";
import { Select } from "../ui/Select";
import { SearchBar } from "../components/SearchBar";
import { TCGCardGrid } from "../components/TCGCardGrid";
import { TCGCardTable } from "../components/TCGCardTable";
import { TCGCardBinder } from "../components/TCGCardBinder";
import { TCGCardModal } from "../components/TCGCardModal";
import type { TCGCard } from "../lib/type";
import type { SortMode } from "../lib/tcg";
import type { LibraryView } from "../lib/libraryView";
import { withoutPage } from "../lib/pagination";
import { LIBRARY_VIEW_LABEL, SORT_CARDS_LABEL } from "../lib/copy";

const VIEW_OPTIONS: { value: LibraryView; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "table", label: "Table" },
  { value: "binder", label: "Binder" },
];

export function LibraryPage() {
  const { name } = useParams<{ name?: string }>();
  const navigate = useNavigate();
  //everything after the ? (the view, later mayber more) has to survive a new
  //search and the way back to Featured. or the page would forget the view
  const { search } = useLocation();
  const { view, setView } = useLibraryView();
  const { page, setPage } = useBinderPage();
  const { title, cards, status, error, sortMode, setSortMode } =
    useTCGLibrary(name);
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null);

  //a new set of results (a new search, or back to featured) keeps the view
  //but drops the page: "page 3" of the old results means nothing for the new ones
  const searchForNewResults = withoutPage(search);

  //every view is handed the same data and the same callbacks
  const viewProps = {
    cards,
    status,
    error,
    emptyMessage: name
      ? `No TCG cards found for "${name}".`
      : "No cards loaded.",
    onSelect: setSelectedCard,
  };

  function handleSearch(query: string) {
    navigate({
      pathname: `/library/${encodeURIComponent(query)}`,
      search: searchForNewResults,
    });
  }

  //one branch per LibraryView. the switch lists all three, so adding a
  //fourth view LIBRARY_VIEWS makes TypeScript flag this function
  function renderCards() {
    switch (view) {
      case "table":
        return <TCGCardTable {...viewProps} caption={title} />;
      case "binder":
        return (
          <TCGCardBinder {...viewProps} page={page} onPageChange={setPage} />
        );
      case "grid":
        return <TCGCardGrid {...viewProps} />;
    }
  }

  return (
    <section className="library-view">
      <div className="library-header">
        <h2 className="library-title">TCG Library</h2>
        <Link
          to={{ pathname: "/library", search: searchForNewResults }}
          className="library-back"
        >
          ← Featured
        </Link>
      </div>
      <SearchBar
        onSubmit={handleSearch}
        placeholder="Search cards by Pokémon  name"
      />

      <div className="card-panel-header">
        <h3 className="card-panel-title">{title}</h3>
        <div className="card-panel-controls">
          <SegmentedControl
            label={LIBRARY_VIEW_LABEL}
            options={VIEW_OPTIONS}
            value={view}
            onChange={setView}
          />
          <Select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            aria-label={SORT_CARDS_LABEL}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rarity">Rarity</option>
          </Select>
        </div>
      </div>

      {renderCards()}

      {selectedCard && (
        <TCGCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </section>
  );
}
