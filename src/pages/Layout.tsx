import "./Layout.css";
import { Outlet } from "react-router-dom";
import { HeaderSearch } from "../components/HeaderSearch";
import { FavoritesList } from "../components/FavoritesList";
import { MainNav } from "../components/MainNav";
import { BrandMark } from "../components/BrandMark";
import { PartyCounter } from "../components/PartyCounter";
import { SettingsButton } from "../components/SettingsButton";
import { useViewTransitionNavigate } from "../hooks/useViewTransitionNavigate";
import { AppFooter } from "../components/AppFooter";
import { MAIN_CONTENT_ID, SkipLink } from "../components/SkipLink";
import { FAVORITES_TRAY_LABEL } from "../lib/copy";

export function Layout() {
  const navigate = useViewTransitionNavigate();
  //we use useViewTransitionNavigate() in this file because
  //submitting the search form is an action with a side effect
  //(validate, then go somewhere), not a plain click on a link

  function handleSearch(query: string) {
    navigate(`/pokemon/${encodeURIComponent(query)}`);
    //endodeURIComponent escapes anything that isnt safe in a URL segment
    //so the string thats put in is exactly the string that gets back out of useParams later
  }

  return (
    <div className="app-shell">
      {/* first in the page, so it is the first Tab stop */}
      <SkipLink />
      {/* the white bar (spec 5.1). DOM order = Tab order: brand, nav,
          search, party, settings. On phones CSS moves the nav to a bottom
          bar; it stays here in the DOM so there is one "Main" landmark */}
      <header className="app-header">
        <h1 className="app-title">
          <BrandMark />
          <span className="app-title__words">Pokémon Finder</span>
        </h1>
        <MainNav />
        <div className="app-header__end">
          <HeaderSearch onSubmit={handleSearch} />
          <PartyCounter />
          <SettingsButton />
        </div>
      </header>

      {/* tabIndex -1: focusable by the skip link, but not a Tab stop */}
      <main className="app-main" id={MAIN_CONTENT_ID} tabIndex={-1}>
        <Outlet />
        {/* <Outlet /> is where the matched child route (HomePage, PokemonPage, etc.) actually renders. The header and tray around it persist across every navigation; only this slot swaps.*/}
      </main>

      {/* favorites only now; B&W-4 moves them to a rail on the Pokémon page
          and this tray goes */}
      <aside className="app-tray" aria-label={FAVORITES_TRAY_LABEL}>
        <FavoritesList />
      </aside>

      <AppFooter />
    </div>
  );
}
