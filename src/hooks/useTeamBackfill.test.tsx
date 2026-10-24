import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useTeamBackfil } from "./useTeamBackfill";
import { useTeam } from "./useTeam";
import { TeamProvider } from "../context/TeamContext";
import type { PokemonDetails } from "../lib/type";

const { fetchPokemon } = vi.hoisted(() => ({ fetchPokemon: vi.fn() }));
vi.mock("../lib/api", () => ({ fetchPokemon }));

function makePokemon(name: string, typeName: string): PokemonDetails {
  return {
    name,
    id: 1,
    height: 4,
    weight: 60,
    types: [{ slot: 1, type: { name: typeName, url: "" } }],
    sprites: { front_default: `${name}.png` },
    abilities: [],
    stats: [],
    species: { name, url: "" },
  };
}

function seedTeam(members: object[]) {
  localStorage.setItem("pokemon_team", JSON.stringify(members));
}

function renderBackfill() {
  return renderHook(
    () => {
      useTeamBackfil();
      return useTeam();
    },
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TeamProvider>{children}</TeamProvider>
      ),
    },
  );
}

//a promise we resolved by hand, so a test controls exactly when a "network" call finishes
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  localStorage.clear();
  fetchPokemon.mockReset();
});

describe("useTeamBackfill", () => {
  it("makes no request when every member already has types", () => {
    seedTeam([{ name: "pikachu", id: 25, sprite: null, types: ["electric"] }]);

    renderBackfill();

    expect(fetchPokemon).not.toHaveBeenCalled();
  });

  it("fills in types for members saved before types existed", async () => {
    seedTeam([
      { name: "pikachu", id: 25, sprite: null },
      { name: "charmander", id: 4, sprite: null },
    ]);
    fetchPokemon.mockImplementation(async (name: string) =>
      makePokemon(name, name === "pikachu" ? "electric" : "fire"),
    );

    const { result } = renderBackfill();

    await waitFor(() => {
      expect(result.current.team.map((m) => m.types)).toEqual([
        ["electric"],
        ["fire"],
      ]);
    });
    expect(fetchPokemon).toHaveBeenCalledTimes(2);
  });

  it("fetches one member at a time, not all at once", async () => {
    seedTeam([
      { name: "pikachu", id: 25, sprite: null },
      { name: "charmander", id: 4, sprite: null },
    ]);
    const first = deferred<PokemonDetails>();
    fetchPokemon
      .mockReturnValueOnce(first.promise)
      .mockRejectedValue(makePokemon("charmander", "fire"));

    renderBackfill();

    await waitFor(() => expect(fetchPokemon).toHaveBeenCalledTimes(1));
    expect(fetchPokemon).toHaveBeenCalledWith("pikachu", expect.anything());

    await act(async () => {
      first.resolve(makePokemon("pikachu", "electric"));
    });

    await waitFor(() => expect(fetchPokemon).toHaveBeenCalledTimes(2));
    expect(fetchPokemon).toHaveBeenLastCalledWith(
      "charmander",
      expect.anything(),
    );
  });

  it("keeps going when one member fails to load", async () => {
    seedTeam([
      { name: "pikachu", id: 25, sprite: null },
      { name: "charmander", id: 4, sprite: null },
    ]);
    fetchPokemon
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(makePokemon("charmander", "fire"));

    const { result } = renderBackfill();

    await waitFor(() => {
      expect(result.current.team[1]?.types).toEqual(["fire"]);
    });
    expect(result.current.team[0]?.types).toBeUndefined();
    expect(fetchPokemon).toHaveBeenCalledTimes(2);
  });

  it("aborts its request and stops when the page unmounts", async () => {
    seedTeam([
      { name: "pikachu", id: 25, sprite: null },
      { name: "charmander", id: 4, sprite: null },
    ]);
    const first = deferred<PokemonDetails>();
    fetchPokemon.mockReturnValueOnce(first.promise);

    const { unmount } = renderBackfill();
    await waitFor(() => expect(fetchPokemon).toHaveBeenCalledTimes(1));
    const signal = fetchPokemon.mock.calls[0]?.[1].signal as AbortSignal;

    unmount();
    expect(signal.aborted).toBe(true);

    await act(async () => {
      first.resolve(makePokemon("pikachu", "electric"));
    });
    expect(fetchPokemon).toHaveBeenCalledTimes(1);
  });

  it("ignores a response for a member removed while it was loading", async () => {
    seedTeam([{ name: "pikachu", id: 25, sprite: null }]);
    const first = deferred<PokemonDetails>();
    fetchPokemon.mockReturnValueOnce(first.promise);

    const { result } = renderBackfill();
    await waitFor(() => expect(fetchPokemon).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.removeFromTeam("pikachu");
    });
    await act(async () => {
      first.resolve(makePokemon("pikachu", "electric"));
    });

    expect(result.current.team).toEqual([]);
  });
});
