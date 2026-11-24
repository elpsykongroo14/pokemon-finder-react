//the file reads :name from the URL, hands it to the hooks, and owns the
//few pieces of UI state no hook owns: which card the dialog shows, and
//whether the view or sort has changed since the page opened (tile in)

import "./LibraryPage.css";
import { useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTCGLibrary } from "../hooks/useTCGLibrary";
import { useLibraryView } from "../hooks/useLibraryView";
import { useBinderPage } from "../hooks/useBinderPage";
import { usePokemon } from "../hooks/usePokemon";
import { LibraryHero } from "../components/LibraryHero";
import { LibraryToolbar } from "../components/LibraryToolbar";
import { TCGCardGrid } from "../components/TCGCardGrid";
import { TCGCardTable } from "../components/TCGCardTable";
import { TCGCardBinder } from "../components/TCGCardBinder";
import { TCGCardModal } from "../components/TCGCardModal";
import type { TCGCard } from "../lib/type";
import { withoutPage } from "../lib/pagination";
import { animationsAreOff } from "../lib/motion";

export function LibraryPage() {
  const { name } = useParams<{ name?: string }>();
  const navigate = useNavigate();
  //everything after the ? (the view, the page) has to survive a new search
  //and the way back to Featured, or the page would forget the view
  const { search } = useLocation();
  const { view, setView } = useLibraryView();
  const { page, setPage } = useBinderPage();
  const { title, cards, status, error, sortMode, setSortMode } =
    useTCGLibrary(name);

  //the hero's dex number and colors. usePokemon keeps its last answer
  //while a new one loads (and on the featured page, where there is no
  //name), so only a finished lookup for THIS name is shown: otherwise the
  //previous Pokémon's number would sit over the new one's cards
  const lookup = usePokemon(name ?? "");
  const pokemon = name && !lookup.loading && !lookup.error ? lookup.data : null;

  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  //tile in (spec 6.2) plays when the view or the sort CHANGES, never on
  //load (the hand's deal is the Library's entrance). "has it changed?" is
  //worked out during render, the same "adjust state while rendering"
  //pattern as useComparePageState: remember the arrangement seen last,
  //and the first render that sees a different one flips the flag
  const arrangement = `${view}|${sortMode}`;
  const [seenArrangement, setSeenArrangement] = useState(arrangement);
  const [rearranged, setRearranged] = useState(false);
  if (arrangement !== seenArrangement) {
    setSeenArrangement(arrangement);
    setRearranged(true);
  }

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

  //"Open the binder" (spec 7.4): switch the view, and bring the cards up
  //to the top of the window. no smooth scroll with motion off
  function openBinder() {
    setView("binder");
    cardsRef.current?.scrollIntoView?.({
      behavior: animationsAreOff() ? "auto" : "smooth",
      block: "start",
    });
  }

  //one branch per LibraryView. the switch lists all three, so adding a
  //fourth view LIBRARY_VIEWS makes TypeScript flag this function
  function renderCards() {
    switch (view) {
      case "table":
        return (
          <TCGCardTable {...viewProps} caption={title} entering={rearranged} />
        );
      case "binder":
        return (
          <TCGCardBinder {...viewProps} page={page} onPageChange={setPage} />
        );
      case "grid":
        return (
          <TCGCardGrid
            {...viewProps}
            sortMode={sortMode}
            entering={rearranged}
            //a new key per arrangement: the tiles are new elements, so
            //their rise-in plays from the start
            key={arrangement}
          />
        );
    }
  }

  return (
    <div className="library-page page--bleed">
      <LibraryHero
        name={name}
        pokemon={pokemon}
        cards={cards}
        status={status}
        featuredHref={`/library${searchForNewResults}`}
        onSearch={handleSearch}
        onSelect={setSelectedCard}
        onOpenBinder={openBinder}
      />

      <div ref={cardsRef} className="library-page__cards">
        <LibraryToolbar
          cards={cards}
          status={status}
          view={view}
          onViewChange={setView}
          sortMode={sortMode}
          onSortChange={setSortMode}
        />
        <div className="library-page__body">{renderCards()}</div>
      </div>

      {selectedCard && (
        <TCGCardModal
          card={selectedCard}
          cards={cards}
          onSelect={setSelectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
