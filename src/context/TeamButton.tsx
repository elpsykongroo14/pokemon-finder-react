//TeamButton.tsx is the dumb-ish component that sits on PokemonCard,
//mirroring FavoriteButton.tsx
import "../styles/shared.css";
import "./TeamButton.css";
import { Button } from "../ui/Button";
import { useEffect, useId, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTeam } from "../hooks/useTeam";
import { MAX_TEAM } from "../lib/teamReducer";
import {
  TEAM_COMPLETE,
  TEAM_FULL_ATTEMPT,
  TEAM_FULL_HINT,
  TEAM_FULL_LINK,
} from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

interface TeamButtonProps {
  pokemon: PokemonDetails;
}

//the visible celebration: six pips lighting up one after another, like the
//party counter filling, decorative: the words are announced by the live region
function TeamCompleteBanner() {
  return (
    <p className="team-complete" aria-hidden="true">
      <span className="team-complete__pips">
        {Array.from({ length: MAX_TEAM }, (_, i) => (
          <span
            key={i}
            className="team-complete__pip"
            style={{ "--i": i } as CSSProperties}
          />
        ))}
      </span>
      {TEAM_COMPLETE}
    </p>
  );
}

export function TeamButton({ pokemon }: TeamButtonProps) {
  const { team, isOnTeam, addToTeam, removeFromTeam, error, clearError } =
    useTeam();
  const onTeam = isOnTeam(pokemon.name);
  const hintId = useId();

  //the party is full and this pokemon is not in it: adding impossible
  //right now, so we say so up front instead of waiting for a rejection
  const partyFull = team.length >= MAX_TEAM && !onTeam;

  //true only after this button's click filled the sixth slot
  const [justCompleted, setJustCompleted] = useState(false);
  const celebrating = justCompleted && onTeam && team.length >= MAX_TEAM;

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
      setJustCompleted(false);
      return;
    }

    //decide before adding, from what the team locked like at click time
    const completesParty = team.length === MAX_TEAM - 1;
    addToTeam(pokemon);
    if (completesParty) setJustCompleted(true);
  }

  //one status message at a time. chosen from the situation
  const announcement =
    partyFull && error ? TEAM_FULL_ATTEMPT : celebrating ? TEAM_COMPLETE : "";

  return (
    <div className="team-builder-wrap">
      <Button
        variant="secondary"
        onClick={handleClick}
        pressed={onTeam}
        aria-describedby={partyFull ? hintId : undefined}
      >
        {onTeam ? "✅ On Team" : "+ Add to Team"}
      </Button>
      {partyFull && (
        <p id={hintId} className="team-full-hint">
          {TEAM_FULL_HINT} <Link to="/team">{TEAM_FULL_LINK}</Link>.
        </p>
      )}

      {celebrating && <TeamCompleteBanner />}

      {/* a live region is only reliably announced if it already exists
          when its text changes, so it is always rendered, empty at first */}
      <span className="visually-hidden" role="status">
        {announcement}
      </span>

      {/* the raw reducer message, for anything the hint above does not cover */}
      {error && !partyFull && (
        <p role="alert" className="status-message status-message--error">
          {error}
        </p>
      )}
    </div>
  );
}
