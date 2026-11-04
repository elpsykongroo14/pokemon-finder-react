import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate, type NavigateOptions, type To } from "react-router-dom";
import { animationsAreOff } from "../lib/motion";

//react router's own `viewTransition` option truly only works with a data router
//(RouteProvider). this app uses <BrowserRouter>, which ignores it, so we wrap navigate() ourselves

type viewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

export function useViewTransitionNavigate() {
  const navigate = useNavigate();

  return useCallback(
    (to: To, options?: NavigateOptions) => {
      const doc: viewTransitionDocument = document;

      //progressive enhancement: no API, or animations off -> plain navigation
      if (typeof doc.startViewTransition !== "function" || animationsAreOff()) {
        navigate(to, options);
        return;
      }

      //the browser photographs the old page, runs this callback, then
      //photographs the new page. flushSync forces React to finish updating
      //the DOM *inside* the callback, so the second photo is the new page.
      doc.startViewTransition(() => {
        flushSync(() => navigate(to, options));
      });
    },
    [navigate],
  );
}
