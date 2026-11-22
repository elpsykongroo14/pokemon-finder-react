//FavoriteButton is intentionally dumb,
//it doesnt know how favorites work
//it just renders a boolean and fires a callback
import { Button } from "../ui/Button";
import { PopIcon } from "../ui/PopIcon";
import { Icon } from "./Icon";
import {
  FAVORITE_OFF_TEXT,
  FAVORITE_ON_TEXT,
  FAVORITE_TOGGLE_LABEL,
} from "../lib/copy";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  //optional: callers that do not celebrate (or tests) simply leave it out
  popKey?: number;
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  popKey = 0,
}: FavoriteButtonProps) {
  return (
    <Button
      //on the black name plate: a white plate (spec 7.2)
      variant="light"
      onClick={onToggle}
      pressed={isFavorite}
      //D44: the NAME never changes, aria-pressed says the state. the visible
      //words swap ("Favorite" / "Favorited") for people who see them, and
      //"Favorite" is inside both, so speech control still matches
      aria-label={FAVORITE_TOGGLE_LABEL}
    >
      <PopIcon popKey={popKey}>
        <Icon name={isFavorite ? "heart" : "heart-outline"} size={18} />
      </PopIcon>
      {isFavorite ? FAVORITE_ON_TEXT : FAVORITE_OFF_TEXT}
    </Button>
  );
}
