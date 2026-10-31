import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  parseLibraryView,
  withLibrayView,
  type LibraryView,
} from "../lib/libraryView";

export function useLibraryView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = parseLibraryView(searchParams.get("view"));

  const setView = useCallback(
    (next: LibraryView) => {
      //accepts a function that receives the current params and returns the new ones.
      setSearchParams((previous) => withLibrayView(previous, next), {
        replace: true,
      });
    },
    [setSearchParams],
  );

  return { view, setView };
}
