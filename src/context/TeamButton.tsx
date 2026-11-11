//TeamButton.tsx: the "add to team" feature as two drawable pieces plus a
//ready made combination, the state and logic live in useTeamAction
import "../styles/shared.css";
import "./TeamButton.css";
import { Button } from "../ui/Button";
import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTeamAction, type TeamAction } from "../hooks/useTeamAction";
import { MAX_TEAM } from "../lib/teamReducer";
import { TEAM_COMPLETE, TEAM_FULL_HINT, TEAM_FULL_LINK } from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

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

//piece 1: the control itself
export function TeamToggle({ action }: { action: TeamAction }) {
  return (
    <Button
      variant="secondary"
      onClick={action.toggle}
      pressed={action.onTeam}
      //an id reference works anywhere in the document, so the button stays
      //described by the hint even when the hint is drawn somewhere else
      aria-describedby={action.partyFull ? action.hintId : undefined}
    >
      {action.onTeam ? "✅ On Team" : "+ Add to Team"}
    </Button>
  );
}

//piece 2: everything the feature has to say. returned as a fragment (no
//wrapper element), so whoever places it decides the layout
export function TeamStatus({ action }: { action: TeamAction }) {
  return (
    <>
      {action.partyFull && (
        <p id={action.hintId} className="team-full-hint">
          {TEAM_FULL_HINT} <Link to="/team">{TEAM_FULL_LINK}</Link>
        </p>
      )}

      {action.celebrating && <TeamCompleteBanner />}

      {/* a live region is only reliably announced if it already exists
          when its text changes, so it is always rendered, empty at first */}
      <span className="visually-hidden" role="status">
        {action.announcement}
      </span>

      {/* the raw reducer message, for anything the hint above does not cover */}
      {action.error && !action.partyFull && (
        <p role="alert" className="status-message status-message--error">
          {action.error}
        </p>
      )}
    </>
  );
}

export function TeamButton({ pokemon }: { pokemon: PokemonDetails }) {
  const action = useTeamAction(pokemon);

  return (
    <div className="team-builer-wrap">
      <TeamToggle action={action} />
      <TeamStatus action={action} />
    </div>
  );
}
