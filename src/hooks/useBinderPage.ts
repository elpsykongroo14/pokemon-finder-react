import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { parsePage, withPage } from "../lib/pagination";

//the requested page is derived from the url (?page=2), like the view is
//it is the page the url asks for: the binder clamps it to what exists
export function useBinderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));

  const setPage = useCallback(
    (next: number) => {
      //no {replace: true} here, unlike the view toggle: every page is a
      //different place, so back should return to the previous page
      setSearchParams((previous) => withPage(previous, next));
    },
    [setSearchParams],
  );

  return { page, setPage };
}
