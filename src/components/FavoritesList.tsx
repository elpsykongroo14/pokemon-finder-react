//FavoritesList now reaches into the context directly instead of taking favorites/onRemove as props

import "./FavoritesList.css";
import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import { MessageBox } from "../ui/MessageBox";
import { EMPTY_FAVORITES } from "../lib/copy";
import { staggerSlot } from "../lib/stagger";

export function FavoritesList() {
  const { favorites, removeFavorite } = useFavorites();

  //how many favorites existed on the very first render. only thos take part
  //in the one after another entrance, anything added later pops in on its own
  //useState's initial value is read once and then ignored, so this number
  //never changes, even as favorites come and go
  const [settledCount] = useState(favorites.length);

  if (favorites.length === 0) {
    return <MessageBox text={EMPTY_FAVORITES} />;
  }

  return (
    <ul className="favorites-list" aria-label="Favorites">
      {favorites.map((f, position) => (
        <li
          key={f.name}
          style={
            {
              "--fav-slot": staggerSlot(position, settledCount),
            } as CSSProperties
          }
        >
          <Link
            to={`/pokemon/${encodeURIComponent(f.name)}`}
            className="favorite-link"
          >
            {f.sprite && (
              <img
                src={f.sprite}
                alt=""
                width={32}
                height={32}
                decoding="async"
              />
            )}{" "}
            {f.name}
          </Link>
          <button
            type="button"
            onClick={() => removeFavorite(f.name)}
            aria-label={`Remove ${f.name} from favorites`}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}

//onSelect is still a plain prop, not pulled from Context. That's correct, not an oversight
//"which pokemon to search for" is App's concern, not a globally shared piece of state
//so it stays as ordinary prop-based inversion of control. Context replaces prop drilling; it isn't a replacement for props in general.
