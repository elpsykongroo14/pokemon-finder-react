import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TeamPage } from "./TeamPage";
import { TeamProvider } from "../context/TeamContext";

vi.mock("../context/TeamSlots", () => ({
  TeamSLots: () => <div data-testid="team-slots">team-slots</div>,
}));

const { fetchPokemon } = vi.hoisted(() => ({ fetchPokemon: vi.fn() }));
vi.mock("../lib/api", () => ({ fetchPokemon }));

beforeEach(() => {
  localStorage.clear();
  fetchPokemon.mockReset();
});

describe("TeamPage", () => {
  it("renders the team heading and delegates the roster to TeamSLots", () => {
    render(
      <TeamProvider>
        <TeamPage />
      </TeamProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Your Team" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("team-slots")).toBeInTheDocument();
  });

  it("starts the lazy backfill for members saved without types", async () => {
    localStorage.setItem(
      "pokemon_team",
      JSON.stringify([{ name: "pikachu", id: 25, sprite: null }]),
    );
    fetchPokemon.mockResolvedValue({
      name: "pikachu",
      id: 25,
      types: [{ slot: 1, type: { name: "electric", url: "" } }],
      sprites: {},
    });

    render(
      <TeamProvider>
        <TeamPage />
      </TeamProvider>,
    );

    await waitFor(() =>
      expect(fetchPokemon).toHaveBeenCalledWith("pikachu", expect.anything()),
    );
  });
});

//TeamSLots already has its own dedicated test file (Teamslots.test.tsx)
//covering the roster's real rendering logic. TeamPage's only job is to show the heading
//mount the roster, and start the backfill, so those are the only things this file needs to prove
