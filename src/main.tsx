import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { FavoritesProvider } from "./context/FavoritesContext.tsx";
import { TeamProvider } from "./context/TeamContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FavoritesProvider>
      <TeamProvider>
        <App />
      </TeamProvider>
    </FavoritesProvider>
  </StrictMode>,
);
