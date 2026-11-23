import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TeamProvider } from "../context/TeamContext";
import { useTeamAction } from "./useTeamAction";
import type { PokemonDetails, TeamOutcome } from "../lib/type";

const hydreigon = {
  name: "hydreigon",
  id: 635,
  sprites: {},
  types: [],
} as unknown as PokemonDetails;

function seedTeam(names: string[]) {
  localStorage.setItem(
    "pokemon_team",
    JSON.stringify(names.map((name, i) => ({ name, id: i + 1, sprite: null }))),
  );
}

function renderAction() {
  return renderHook(() => useTeamAction(hydreigon), {
    wrapper: ({ children }) => <TeamProvider>{children}</TeamProvider>,
  });
}

//the click result the page turns into its confirmation line (spec 6.2):
//what happened, and the party size it left behind
function click(result: { current: ReturnType<typeof useTeamAction> }) {
  let outcome: TeamOutcome | undefined;
  act(() => {
    outcome = result.current.toggle();
  });
  return outcome;
}

beforeEach(() => localStorage.clear());

describe("useTeamAction's toggle", () => {
  it("reports a join with the new party size", () => {
    seedTeam(["pikachu", "eevee", "lucario", "zoroark"]);
    const { result } = renderAction();

    expect(click(result)).toEqual({ kind: "joined", size: 5 });
    expect(result.current.onTeam).toBe(true);
  });

  it("reports a leave with the new party size", () => {
    seedTeam(["pikachu", "hydreigon"]);
    const { result } = renderAction();

    expect(click(result)).toEqual({ kind: "left", size: 1 });
    expect(result.current.onTeam).toBe(false);
  });

  it("reports a refused add when the party is already full", () => {
    seedTeam(["a", "b", "c", "d", "e", "f"]);
    const { result } = renderAction();

    expect(click(result)).toEqual({ kind: "rejected", size: 6 });
    expect(result.current.onTeam).toBe(false);
  });
});
