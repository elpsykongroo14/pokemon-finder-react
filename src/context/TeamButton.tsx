//TeamButton.tsx is the dumb-ish component that sits on PokemonCard,
//mirroring FavoriteButton.tsx
import { useEffect } from "react";
import { useTeam } from "../hooks/useTeam";
import type { PokemonDetails } from "../lib/type";

interface TeamButtonProps {
  pokemon: PokemonDetails;
}

export function TeamButton({ pokemon }: TeamButtonProps) {
  const { isOnTeam, addToTeam, removeFromTeam, error, clearError } = useTeam();
  const onTeam = isOnTeam(pokemon.name);

  //the auto dismiss timer lives here, in a component not in the reducer
  //reducers stay pure, sider effects like setTimeout belong in effects
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 3000);
    return () => clearTimeout(timer); //clean up function runs before the next effect execution, or on unmout
    //this is necessary to avoid overlapping timers and a race where an old timer could clear an error message that belongs to a newer rejection
  }, [error, clearError]);

  function handleClick() {
    if (onTeam) {
      removeFromTeam(pokemon.name);
    } else {
      addToTeam(pokemon);
    }
  }

  return (
    <div className="team-builder-wrap">
      <button
        type="button"
        className="team-button"
        onClick={handleClick}
        aria-pressed={onTeam}
      >
        {onTeam ? "✅ On Team" : "+ Add to Team"}
      </button>
      {error && (
        <p role="alert" className="status-message status-message--error">
          {error}
        </p>
      )}
    </div>
  );
}
