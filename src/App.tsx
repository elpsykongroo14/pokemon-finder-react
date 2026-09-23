import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { HomePage } from "./pages/HomePage";
import { PokemonPage } from "./pages/PokemonPage";
import { ComparePage } from "./pages/ComparePage";
import { TeamPage } from "./pages/TeamPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LibraryPage } from "./pages/LibraryPage";
import "./App.css";

//Lazy + import.meta.env.DEV gated: intended so this never ships to production
const StyleGuideLazy = lazy(() =>
  import("./pages/StyleGuide").then((m) => ({ default: m.StyleGuide })),
);

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/pokemon/:name" element={<PokemonPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/:name" element={<LibraryPage />} />
        <Route path="*" element={<NotFoundPage />} />
        {import.meta.env.DEV && (
          <Route
            path="/styleguide"
            element={
              <Suspense fallback={null}>
                <StyleGuideLazy />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
export default App;
