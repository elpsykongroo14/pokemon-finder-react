//FavoriteButton is intentionally dumb,
//it doesnt know how favorites work
//it just renders a boolean and fires a callback

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export function FavoriteButton({ isFavorite, onToggle }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className="favorite-button"
      onClick={onToggle}
      //aria-pressed is the correct ARIA attribute for a toggle button (as opposed to aria-label alone)
      //it tells assistive tech this button has an on/off state, which role="search" and friends won't cover automatically
      aria-pressed={isFavorite}
    >
      {isFavorite ? "❤️ In Favorites" : "🤍 Favorite"}
    </button>
  );
}
