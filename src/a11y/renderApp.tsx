//renders the whole app at a given URL, with the same provider stack as
//main.tsx, so a test sees exactly what a user sees. shared by every
//page-level test in this folder
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { PreferencesProvider } from "../context/PreferencesContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { TeamProvider } from "../context/TeamContext";

export function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PreferencesProvider>
        <FavoritesProvider>
          <TeamProvider>
            <App />
          </TeamProvider>
        </FavoritesProvider>
      </PreferencesProvider>
    </MemoryRouter>,
  );
}
