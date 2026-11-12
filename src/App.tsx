import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { HomePage } from "./pages/HomePage";
import { PokemonPage } from "./pages/PokemonPage";
import { ComparePage } from "./pages/ComparePage";
import { TeamPage } from "./pages/TeamPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LibraryPage } from "./pages/LibraryPage";

//dwv only. the DEV check has to wrap the import() itself: Vite replaces
//import.meta.env.DEV with the literal false in a production build, so
//"false ? lazy(import(...)) : null" becomes plain null and the bundler
//drops the StyleGuide chunk entirely. hiding only the <Route> (as before)
//left the import() reachable, so its chunk was still built and deployed
const StyleGuideLazy = import.meta.env.DEV
  ? lazy(() =>
      import("./pages/StyleGuide").then((m) => ({ default: m.StyleGuide })),
    )
  : null;

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
        {StyleGuideLazy && (
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
