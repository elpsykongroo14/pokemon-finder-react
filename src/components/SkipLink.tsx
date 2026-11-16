//one link at the very top of the app that does two jobs
//  1. a classic skip link: Tab once, Enter, and you are past the header
//  2. a page change announcer: when the URL's path changes, focus moves here
//   and the link is named after the new page, so a screen reader says
//   "Your Team: Skip to content, link" and a keyboard user starts here
import "./SkipLink.css";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useLocation } from "react-router-dom";
import { pageNameFromTitle } from "../lib/pageTitle";

//the element the link jumps to (Layout puts this id on <main>)
export const MAIN_CONTENT_ID = "main-content";

export function SkipLink() {
  const { pathname } = useLocation();
  const linkRef = useRef<HTMLAnchorElement>(null);

  //the path we last reacte to. null = nothing seen yet (the first load)
  const lastPath = useRef<string | null>(null);

  //what the link says after a page change; null until the first change
  const [pageName, setPageName] = useState<string | null>(null);
  //an event counter, like popKey in useTeamAction: "a page change happened"
  const [focusRequest, setFocusRequest] = useState(0);

  //effect 1: notice a page change. only the PATH counts: ?view=table or
  //?b= raichu is the same page showing something else, not a new page
  //Back and forwarch change the path too, so they count
  useEffect(() => {
    if (lastPath.current === null) {
      //first load: remember it and do nothing. the screen reader already
      //starts at the top of a freshly loaded page. (in development,
      //StrictMode runs this effect twice on mount; the second run sees the
      //same path and returns below, so it stays a no-op)
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    //the page's name comes from document.title, which PageTitle has
    //ALREADY set: React write <title> into <head> while committing the
    //new page, and effects only run after the commit
    setPageName(pageNameFromTitle(document.title));
    setFocusRequest((count) => count + 1);
  }, [pathname]);

  //effect 2: move focus, one render LATEr, once the link's text is the new
  //page's name. focusing in effect 1 would make the screen reader read the
  //old name, because the new text is not the DOM yet
  useEffect(() => {
    if (focusRequest === 0) return;
    linkRef.current?.focus();
  }, [focusRequest]);

  //the href makes it a real link (role, enter key, works without JS);
  //we handle the click ourselves so the URL does not get "#main-content"
  //stuck on the end of every deep link
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.getElementById(MAIN_CONTENT_ID)?.focus();
  }

  return (
    <a
      ref={linkRef}
      className="skip-link"
      href={`#${MAIN_CONTENT_ID}`}
      onClick={handleClick}
    >
      {pageName ? `${pageName}: skip to content` : "Skip to content"}
    </a>
  );
}
