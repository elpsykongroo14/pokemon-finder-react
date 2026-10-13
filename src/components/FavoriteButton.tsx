//FavoriteButton is intentionally dumb,
//it doesnt know how favorites work
//it just renders a boolean and fires a callback

import { Button } from "../ui/Button";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export function FavoriteButton({ isFavorite, onToggle }: FavoriteButtonProps) {
  return (
    <Button variant="secondary" onClick={onToggle} pressed={isFavorite}>
      {isFavorite ? "❤️ In Favorites" : "🤍 Favorite"}
    </Button>
  );
}
