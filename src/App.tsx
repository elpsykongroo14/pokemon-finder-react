import { Routes, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { HomePage } from "./pages/HomePage";
import { PokemonPage } from "./pages/PokemonPage";
import { ComparePage } from "./pages/ComparePage";
import { TeamPage } from "./pages/TeamPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LibraryPage } from "./pages/LibraryPage";
import "./App.css";

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
        <Route />
      </Route>
    </Routes>
  );
}
export default App;
