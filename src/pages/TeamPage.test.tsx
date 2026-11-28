import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TeamPage } from "./TeamPage";
import { TeamProvider } from "../context/TeamContext";

vi.mock("../components/TeamSlots", () => ({
  TeamSlots: () => <div data-testid="team-slots">team-slots</div>,
}));

const { fetchPokemon } = vi.hoisted(() => ({ fetchPokemon: vi.fn() }));
vi.mock("../lib/api", () => ({ fetchPokemon }));

beforeEach(() => {
  localStorage.clear();
  fetchPokemon.mockReset();
});

describe("TeamPage", () => {
  //changed in B&W-6: "Your Team" became "Your team" (spec 9's copy, the
  //sentence case every other heading uses). the heading now comes from
  //the title band
  it("renders the team heading and delegates the roster to TeamSlots", () => {
    render(
      <TeamProvider>
        <TeamPage />
      </TeamProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Your team" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("team-slots")).toBeInTheDocument();
  });

  it("says how full the party is, in the title band", () => {
    render(
      <TeamProvider>
        <TeamPage />
      </TeamProvider>,
    );

    expect(
      screen.getByText(
        "0 of 6 slots filled. Your team is saved in this browser.",
      ),
    ).toBeInTheDocument();
  });

  //the band and the cards run edge to edge, like the encounter fields
  it("marks itself as a full-bleed page", () => {
    const { container } = render(
      <TeamProvider>
        <TeamPage />
      </TeamProvider>,
    );

    expect(container.firstElementChild).toHaveClass("page--bleed");
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
      //a real Pokémon always has stats; since D49 the backfill sums them
      //(fixed in B&W-7: without this the late answer threw after the test)
      stats: [],
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

//TeamSlots already has its own dedicated test file (TeamSlots.test.tsx)
//covering the roster's real rendering logic. TeamPage's only job is to show the heading
//mount the roster, and start the backfill, so those are the only things this file needs to prove
