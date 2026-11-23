import "./FavoritesList.css";
import { useId, useState } from "react";
import { useFavorites } from "../hooks/useFavorites";
import { TransitionLink } from "./TransitionLink";
import { EMPTY_FAVORITES, FAVORITES_LABEL } from "../lib/copy";

interface FavoritesListProps {
  //the Pokémon whose page this is: its tile is white and aria-current
  current?: string;
}

//the favorites rail (spec 7.2, D48): a black strip right under the field,
//one slanted tile per favorite, each a link to that Pokémon's page. it
//reaches into the favorites context itself instead of taking props.
//
//a <nav>: it is a set of links to other pages, so screen reader users can
//jump to it like the main nav. it is named by a visible caption, not a
//heading: an h2 here would sit between the Pokémon's name and its
//readout sections and wrongly "own" them in the outline
export function FavoritesList({ current }: FavoritesListProps) {
  const { favorites } = useFavorites();
  const captionId = useId();

  //the favorites that were there when the rail first rendered. they did
  //not just arrive, so they do not animate (D42: nothing moves on its own
  //at load). only a tile added while you are here pops in.
  //useState's initializer runs once, so this set never changes afterwards
  const [namesAtStart] = useState(() => new Set(favorites.map((f) => f.name)));

  return (
    <nav className="favorites-rail on-dark" aria-labelledby={captionId}>
      <span id={captionId} className="favorites-rail__caption">
        {FAVORITES_LABEL}
      </span>
      {favorites.length === 0 ? (
        //role="status": when the last favorite is removed, the empty
        //message is announced instead of the rail silently emptying
        <p className="favorites-rail__empty" role="status">
          {EMPTY_FAVORITES}
        </p>
      ) : (
        <ul className="favorites-rail__list">
          {favorites.map((f) => (
            <li key={f.name}>
              <TransitionLink
                to={`/pokemon/${encodeURIComponent(f.name)}`}
                className="favorite-tile"
                aria-current={f.name === current ? "page" : undefined}
                //the tile's underline takes the favorite's primary type
                //color: [data-type] gives this subtree its own theme.
                //favorites saved before D48 have no types: no attribute,
                //and the underline stays neutral
                data-type={f.types?.[0]}
                data-new={!namesAtStart.has(f.name) || undefined}
              >
                {f.sprite && (
                  <img
                    className="favorite-tile__sprite"
                    src={f.sprite}
                    alt=""
                    width={96}
                    height={96}
                    decoding="async"
                  />
                )}
                <span className="visually-hidden">{f.name}</span>
                <span className="favorite-tile__line" aria-hidden="true" />
              </TransitionLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
