import "./ComparePage.css";
import "../styles/shared.css";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { CompareView } from "../components/CompareView";
import { FailureMessage } from "../components/FailureMessage";
import { MessageBox } from "../ui/MessageBox";
import { usePokemon } from "../hooks/usePokemon";
import { getComparePageState } from "../lib/comparePageState";
import { EMPTY_COMPARE, LOADING_LABEL, SELF_COMPARE } from "../lib/copy";

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const a = searchParams.get("a") ?? "";
  const b = searchParams.get("b") ?? "";

  const first = usePokemon(a);
  const second = usePokemon(b);
  const regionRef = useRef<HTMLDivElement>(null);

  //exactly one situation at a time, worked out before anything is drawn
  const state = getComparePageState({ a, b, first, second });

  function handlePickSecond(query: string) {
    setSearchParams({ a, b: query });
  }

  //a Retry button removes itself when its message is replaced by loading,
  //which would drop keyboard focus to the top of the page. so focus moves
  //to the wrapper (which stays mounted) first. same reasoning as PokemonPage
  function handleRetry(retry: () => void) {
    regionRef.current?.focus();
    retry();
  }

  function renderState() {
    switch (state.status) {
      case "no-first":
        return <MessageBox text={EMPTY_COMPARE} />;
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
            <h3>Comparing {state.first.name} with...</h3>
            <SearchBar onSubmit={handlePickSecond} />
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
            <SearchBar onSubmit={handlePickSecond} />
          </>
        );
      case "same-pokemon":
        return (
          <>
            <MessageBox variant="error" text={SELF_COMPARE} />
            <SearchBar onSubmit={handlePickSecond} />
          </>
        );
      case "ready":
        return (
          <CompareView primary={state.primary} secondary={state.secondary} />
        );
    }
  }

  return (
    <div className="compare-page" ref={regionRef} tabIndex={-1}>
      {renderState()}
    </div>
  );
}
