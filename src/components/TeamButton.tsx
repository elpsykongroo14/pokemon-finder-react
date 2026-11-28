//TeamButton.tsx: the "add to team" feature as two drawable pieces plus a
//ready made combination, the state and logic live in useTeamAction
import "../styles/shared.css";
import "./TeamButton.css";
import { Button } from "../ui/Button";
import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTeamAction, type TeamAction } from "../hooks/useTeamAction";
import { MAX_TEAM } from "../lib/teamReducer";
import {
  TEAM_COMPLETE,
  TEAM_FULL_HINT,
  TEAM_FULL_LINK,
  TEAM_OFF_TEXT,
  TEAM_ON_TEXT,
  TEAM_TOGGLE_LABEL,
} from "../lib/copy";
import type { PokemonDetails } from "../lib/type";
import { PopIcon } from "../ui/PopIcon";
import { Icon } from "./Icon";

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

interface TeamToggleProps {
  action: TeamAction;
  //a page that wants to know what the click did (the Pokémon page's
  //confirmation line) passes its own handler, which calls action.toggle
  //itself. left out, the click just toggles
  onToggle?: () => void;
}

//piece 1: the control itself
export function TeamToggle({ action, onToggle }: TeamToggleProps) {
  return (
    <Button
      //on the black name plate: a white plate (spec 7.2)
      variant="light"
      onClick={onToggle ?? action.toggle}
      pressed={action.onTeam}
      //D44: the name stays "Team" in both states and aria-pressed says which.
      //the visible words swap ("Add to team" / "On your team"); "Team" is not
      //literally inside "Add to team", a recorded WCAG 2.5.3 exception:
      //speech tools match the word "team"
      aria-label={TEAM_TOGGLE_LABEL}
      //an id reference works anywhere in the document, so the button stays
      //described by the hint even when the hint is drawn somewhere else
      aria-describedby={action.partyFull ? action.hintId : undefined}
    >
      <PopIcon popKey={action.popKey}>
        <Icon name={action.onTeam ? "check" : "plus"} size={16} />
      </PopIcon>
      {action.onTeam ? TEAM_ON_TEXT : TEAM_OFF_TEXT}
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
