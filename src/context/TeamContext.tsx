import { useReducer, useEffect, type ReactNode } from "react";
import type { PokemonDetails } from "../lib/type";
import { TeamContext } from "../hooks/useTeam";
import { TeamReducer, type TeamState } from "../lib/teamReducer";

const TEAM_KEY = "pokemon_team";

function loadInitialState(): TeamState {
  try {
    const stored = localStorage.getItem(TEAM_KEY);
    return { members: stored ? JSON.parse(stored) : [], error: null };
  } catch {
    return { members: [], error: null };
  }
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    TeamReducer,
    undefined,
    loadInitialState,
  ); //the three-argument, lazy-initializer form
  //undefined is the "initial arg" that gets handed to loadInitialState, which ignores it and reads localStorage instead. It only runs once, on moun

  //only ever persists members, error is transient UI state
  //never disk state
  useEffect(() => {
    try {
      localStorage.setItem(TEAM_KEY, JSON.stringify(state.members));
    } catch {
      //storage full or unavailable
      //state still holds in memory
    }
  }, [state.members]);

  function addToTeam(pokemon: PokemonDetails) {
    dispatch({ type: "ADD", payload: pokemon });
  }
  function removeFromTeam(name: string) {
    dispatch({ type: "REMOVE", payload: name });
  }
  function clearError() {
    dispatch({ type: "CLEAR_ERROR" });
  }
  function isOnTeam(name: string) {
    return state.members.some((m) => m.name === name);
  }

  return (
    <TeamContext.Provider
      value={{
        team: state.members,
        error: state.error,
        addToTeam,
        removeFromTeam,
        clearError,
        isOnTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}
