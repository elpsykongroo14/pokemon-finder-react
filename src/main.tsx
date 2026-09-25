import "@fontsource/jersey-10/latin-400.css";
import "@fontsource-variable/nunito";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { FavoritesProvider } from "./context/FavoritesContext.tsx";
import { TeamProvider } from "./context/TeamContext.tsx";
import { PreferencesProvider } from "./context/PreferencesContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PreferencesProvider>
        <FavoritesProvider>
          <TeamProvider>
            <App />
          </TeamProvider>
        </FavoritesProvider>
      </PreferencesProvider>
    </BrowserRouter>
  </StrictMode>,
);
