//FavoritesList now reaches into the context directly instead of taking favorites/onRemove as props

import { useFavorites } from "../hooks/useFavorites";

interface FavoriteListProps {
  onSelect: (name: string) => void;
}

export function FavoriteList({ onSelect }: FavoriteListProps) {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return <p className="status-message">No favorites yet.</p>;
  }

  return (
    <ul className="favorites-list">
      {favorites.map((f) => (
        <li key={f.name}>
          <button type="button" onClick={() => onSelect(f.name)}>
            {f.sprite && <img src={f.sprite} alt="" width={32} height={32} />}
            {f.name}
          </button>
          <button
            type="button"
            onClick={() => removeFavorite(f.name)}
            aria-label={`Remove ${f.name} from favorites`}
          >
            x
          </button>
        </li>
      ))}
    </ul>
  );
}

//onSelect is still a plain prop, not pulled from Context. That's correct, not an oversight
//"which pokemon to search for" is App's concern, not a globally shared piece of state
//so it stays as ordinary prop-based inversion of control. Context replaces prop drilling; it isn't a replacement for props in general.
