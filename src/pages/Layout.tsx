import "./Layout.css";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { FavoritesList } from "../components/FavoritesList";

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
        <h1 className="app-title">Pokémon Finder</h1>
        <nav className="main-nav" aria-label="Main">
          <NavLink
            to="/"
            end //without end, Navlink to= "/" would report isActive: true on every route
            //because /pokemon/pikachu technically starts with /
            //end tells it to only match if the URL is exactly this not just prefixed by it
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            Home
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            Compare
          </NavLink>
          <NavLink
            to="/team"
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            Team
          </NavLink>
          <NavLink
            to="/library"
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            Library
          </NavLink>
        </nav>

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
