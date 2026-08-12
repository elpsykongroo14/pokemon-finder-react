import type { FavoritePokemon } from "../lib/type";

interface FavoriteListProps {
  favorites: FavoritePokemon[];
  onSelect: (name: string) => void;
  onRemove: (name: string) => void;
}

export function FavoriteList({
  favorites,
  onSelect,
  onRemove,
}: FavoriteListProps) {
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
            onClick={() => onRemove(f.name)}
            aria-label={`Remove ${f.name} from favorites`}
          >
            x
          </button>
        </li>
      ))}
    </ul>
  );
}
