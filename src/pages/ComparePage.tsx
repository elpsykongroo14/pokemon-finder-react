import "./ComparePage.css";
import "../styles/shared.css";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { CompareView } from "../components/CompareView";
import { FailureMessage } from "../components/FailureMessage";
import { MessageBox } from "../ui/MessageBox";
import { PageHeader } from "../ui/PageHeader";
import { PageTitle } from "../ui/PageTitle";
import { usePokemon } from "../hooks/usePokemon";
import { formatSlug } from "../lib/text";
import { useComparePageState } from "../hooks/useComparePageState";
import {
  pickForSide,
  swapPair,
  type ComparePair,
  type CompareSlot,
} from "../lib/comparePair";
import {
  EMPTY_COMPARE,
  LOADING_LABEL,
  SELF_COMPARE,
  COMPARE_HEADING,
  COMPARE_SUBTITLE,
  OPPONENT_SEARCH_LABEL,
  FIRST_SEARCH_LABEL,
} from "../lib/copy";

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pair: ComparePair = {
    a: searchParams.get("a") ?? "",
    b: searchParams.get("b") ?? "",
  };

  const first = usePokemon(pair.a);
  const second = usePokemon(pair.b);
  const regionRef = useRef<HTMLDivElement>(null);

  //exactly one situation at a time, worked out before anything is drawn.
  //the hook also remembers the comparison on screen, so a pick or a Swap
  //keeps it up (pending) until the next one has loaded
  const state = useComparePageState({ ...pair, first, second });

  //the URL is the one place the pair lives: every change goes through it,
  //so Back and Forward step through comparisons, and a link can share one.
  //the rules for what it becomes are pure functions (lib/comparePair)
  function goTo(next: ComparePair) {
    setSearchParams(next.b ? { a: next.a, b: next.b } : { a: next.a });
  }

  function handlePick(slot: CompareSlot, query: string) {
    goTo(pickForSide(pair, slot, query));
  }

  function handleSwap() {
    goTo(swapPair(pair));
  }

  //a Retry button removes itself when its message is replaced by loading,
  //which would drop keyboard focus to the top of the page. so focus moves
  //to the wrapper (which stays mounted) first. same reasoning as PokemonPage
  function handleRetry(retry: () => void) {
    regionRef.current?.focus();
    retry();
  }

  //a plain JSX value, not a component declared in here: a function componenet
  //defined inside another component is brand new type on every render, so
  //React would unmout and remount the search bar each time (losing what was typed)
  const opponentSearch = (
    <SearchBar
      onSubmit={(query) => handlePick("b", query)}
      label={OPPONENT_SEARCH_LABEL}
    />
  );

  function renderState() {
    switch (state.status) {
      //the empty page starts the comparison right here, instead of only
      //saying where to go to start one
      case "no-first":
        return (
          <>
            <MessageBox text={EMPTY_COMPARE} />
            <SearchBar
              onSubmit={(query) => handlePick("a", query)}
              label={FIRST_SEARCH_LABEL}
            />
          </>
        );
      case "first-loading":
      case "second-loading":
        return <MessageBox text={LOADING_LABEL} />;
      case "first-failed":
        return (
          <FailureMessage
            kind={state.kind}
            query={state.name}
            onRetry={() => handleRetry(first.retry)}
          />
        );
      case "pick-second":
        return (
          <>
            {/* the API's lowercase slug, written as a name ("Mr Mime") */}
            <h3>Comparing {formatSlug(state.first.name)} with...</h3>
            {opponentSearch}
          </>
        );
      //a failed or rejected opponent still leaves the way forward open:
      //an error should say what happened AND what to do next
      case "second-failed":
        return (
          <>
            <FailureMessage
              kind={state.kind}
              query={state.name}
              onRetry={() => handleRetry(second.retry)}
            />
            {opponentSearch}
          </>
        );
      case "same-pokemon":
        return (
          <>
            <MessageBox variant="error" text={SELF_COMPARE} />
            {opponentSearch}
          </>
        );
      case "ready":
        return (
          <CompareView
            primary={state.primary}
            secondary={state.secondary}
            pending={state.pending}
            onPick={handlePick}
            onSwap={handleSwap}
          />
        );
    }
  }

  const ready = state.status === "ready";

  return (
    //page--bleed once the comparison is up: the versus field and the band
    //run edge to edge. every other state sits in the normal column
    <div
      className={ready ? "compare-page page--bleed" : "compare-page"}
      ref={regionRef}
      tabIndex={-1}
    >
      {ready ? (
        //spec 7.3: the field and the two names say what this page is, so
        //the title leaves the screen but stays in the outline (an h2,
        //under the app's h1) for screen-reader heading navigation
        <>
          <PageTitle page={COMPARE_HEADING} />
          <h2 className="visually-hidden">{COMPARE_HEADING}</h2>
        </>
      ) : (
        <PageHeader title={COMPARE_HEADING} subtitle={COMPARE_SUBTITLE} />
      )}
      {renderState()}
    </div>
  );
}
