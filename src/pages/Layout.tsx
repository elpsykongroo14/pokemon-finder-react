import "./Layout.css";
import { Outlet, useNavigate } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { FavoritesList } from "../components/FavoritesList";
import { MainNav } from "../components/MainNav";
import { BrandMark } from "../components/Brandmark";

export function Layout() {
  const navigate = useNavigate();
  //we use useNavigate() in this file because
  //submitting the search form is an action with a side effect
  //(validate, then go somewhere), not a plain click on a link

  function handleSearch(query: string) {
    navigate(`/pokemon/${encodeURIComponent(query)}`);
    //endodeURIComponent escapes anything that isnt safe in a URL segment
    //so the string thats put in is exactly the string that gets back out of useParams later
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">
          <BrandMark />
          Pokémon Finder
        </h1>
        <MainNav />

        <div className="app-search">
          <SearchBar onSubmit={handleSearch} />
        </div>
      </header>

      <main className="app-main">
        <Outlet />
        {/* <Outlet /> is where the matched child route (HomePage, PokemonPage, etc.) actually renders. The header and tray around it persist across every navigation; only this slot swaps.*/}
      </main>

      <aside className="app-tray" aria-label="Favorites">
        <FavoritesList />
      </aside>
    </div>
  );
}
