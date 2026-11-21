import "@fontsource/jersey-10/latin-400.css";
//"standard" = the weight AND width axes (D40); the plain import has weight only,
//and the display style needs font-stretch: 125%
import "@fontsource-variable/archivo/standard.css";
import "@fontsource-variable/archivo/standard-italic.css";
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
    <BrowserRouter useTransitions={false}>
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
