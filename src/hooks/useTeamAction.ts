import { useEffect, useId, useState } from "react";
import { useTeam } from "./useTeam";
import { MAX_TEAM } from "../lib/teamReducer";
import { TEAM_COMPLETE, TEAM_FULL_ATTEMPT } from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

//everything in the "add to team" feature KNOWS and DOES, with no markup.
//the button and the messages about it are drawn by two seperate components
//(TeamToggle, TeamStatus) that both read this one object, so a page can put
//the button in one place and the messages in another, without the two ever
//holding different copies of the state
export interface TeamAction {
  onTeam: boolean;
  partyFull: boolean;
  celebrating: boolean;
  error: string | null;
  announcement: string;
  popKey: number; //goes up by one each time this click adds the pokemon
  hintId: string;
  toggle: () => void;
}

export function useTeamAction(pokemon: PokemonDetails): TeamAction {
  const { team, isOnTeam, addToTeam, removeFromTeam, error, clearError } =
    useTeam();
  const onTeam = isOnTeam(pokemon.name);
  const hintId = useId();

  //the party is full and this pokemon is not in it: adding impossible
  //right now, so we say up front instead of waiting for rejection
  const partyFull = team.length >= MAX_TEAM && !onTeam;

  //true only after this button's click filled the sixth slot
  const [justCompleted, setJustCompleted] = useState(false);
  const celebrating = justCompleted && onTeam && team.length >= MAX_TEAM;

  //an event counter for the icon pop, set in the click handler (see
  //useFavoriteAction for why evernts are recorded there, not derived later)
  const [popKey, setPopKey] = useState(0);

  //the auto dismiss timer lives here, in a hook not in the reducer
  //reucers stay pure, side effects like setTimeout belong in effects
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 3000);
    return () => clearTimeout(timer); //clean up function runs before the next effect excutions, or on unmout
    //this is necessary to avoid overlapping timers and a race where an old timer could clear an error message that belongs to a newer rejection
  }, [error, clearError]);

  function toggle() {
    if (onTeam) {
      removeFromTeam(pokemon.name);
      setJustCompleted(false);
      return;
    }

    //decide before adding, from what the team looked like at click time
    const completesParty = team.length === MAX_TEAM - 1;
    addToTeam(pokemon);
    //a full party rejects the add, so only pop when there was room
    if (team.length < MAX_TEAM) setPopKey((key) => key + 1);
    if (completesParty) setJustCompleted(true);
  }

  //one status message at a time. chosen from situation
  const announcement =
    partyFull && error ? TEAM_FULL_ATTEMPT : celebrating ? TEAM_COMPLETE : "";

  return {
    onTeam,
    partyFull,
    celebrating,
    error,
    announcement,
    popKey,
    hintId,
    toggle,
  };
}
