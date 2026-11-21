//FavoriteButton is intentionally dumb,
//it doesnt know how favorites work
//it just renders a boolean and fires a callback
import "./FavoriteButton.css";
import { Button } from "../ui/Button";
import { PopIcon } from "../ui/PopIcon";
import type { FavoriteAction } from "../hooks/useFavoriteAction";
import { FAVORITE_TOGGLE_LABEL, FIRST_FAVORITE } from "../lib/copy";

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
    <Button variant="line" onClick={onToggle} pressed={isFavorite}>
      {/* the heart and the pressed look SHOW the state; aria-pressed SAYS
          it. the words never change (a toggle that changes both is heard
          twice: "In Favorites, pressed") */}
      <PopIcon popKey={popKey}>{isFavorite ? "❤️" : "🤍"}</PopIcon>{" "}
      {FAVORITE_TOGGLE_LABEL}
    </Button>
  );
}

//what the favorite has to say. a fragment, like TeamStatus, so the
//page decides where it goes
export function FavoriteStatus({ action }: { action: FavoriteAction }) {
  return (
    <>
      {action.celebratingFirst && (
        //a decorative copy of the words: the live region below announces them
        <p className="favorite-first" aria-hidden="true">
          <PopIcon popKey={1}>❤️</PopIcon> {FIRST_FAVORITE}
        </p>
      )}
      <span className="visually-hidden" role="status">
        {action.announcement}
      </span>
    </>
  );
}
