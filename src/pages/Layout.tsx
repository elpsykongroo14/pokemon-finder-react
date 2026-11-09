import "./Layout.css";
import { Outlet } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { FavoritesList } from "../components/FavoritesList";
import { MainNav } from "../components/MainNav";
import { BrandMark } from "../components/BrandMark";
import { PartyCounter } from "../components/PartyCounter";
import { Backdrop } from "../components/Backdrop";
import { SettingsButton } from "../components/SettingsButton";
import { useViewTransitionNavigate } from "../hooks/useViewTransitionNavigate";
import { AppFooter } from "../components/AppFooter";

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
      <Backdrop />
      <header className="app-header">
        <h1 className="app-title">
          <BrandMark />
          Pokémon Finder
        </h1>
        <MainNav />

        <div className="app-search">
          <SearchBar onSubmit={handleSearch} />
        </div>

        <div className="app-settings">
          <SettingsButton />
        </div>
      </header>

      <main className="app-main">
        <Outlet />
        {/* <Outlet /> is where the matched child route (HomePage, PokemonPage, etc.) actually renders. The header and tray around it persist across every navigation; only this slot swaps.*/}
      </main>

      <aside className="app-tray" aria-label="Favorites and party">
        <div className="app-tray__favorites">
          <FavoritesList />
        </div>
        <PartyCounter />
      </aside>

      <AppFooter />
    </div>
  );
}
