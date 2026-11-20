//the text in browser tab, in bookmarks, in history, and the first thing
//a screen reader announces when a page loads
//
//React 19 lets any component render <title>: React lifts it into
//<head> for us and swaps it when the component unmounts. no library needed
//(react-helemt-existed because older React could not do this)
import { pageTitle } from "../lib/pageTitle";

interface pageTitleProps {
  //the page-specific part; leave it out on Home, where the app is the page
  page?: string;
}

export function PageTitle({ page }: pageTitleProps) {
  //<title> only accepts ONE string child, so the text is built first
  //(writing {page} · {APP_NAME} in JSX would give it three children)
  return <title>{pageTitle(page)}</title>;
}
