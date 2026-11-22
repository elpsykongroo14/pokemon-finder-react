import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { TeamProvider } from "../context/TeamContext";
import { MAX_TEAM } from "../lib/teamReducer";
import { useTeam } from "../hooks/useTeam";
import { PartyCounter } from "./PartyCounter";
import type { PokemonDetails } from "../lib/type";

function member(name: string, id: number, types?: string[]) {
  return { name, id, sprite: `https://img.example/${name}.png`, types };
}

//what addToTeam receives in the app: the full API object, not a stored member
function details(name: string, id: number, type: string): PokemonDetails {
  return {
    name,
    id,
    height: 0,
    weight: 0,
    types: [{ slot: 1, type: { name: type, url: "" } }],
    sprites: { front_default: "", front_shiny: "" },
    abilities: [],
    stats: [],
    species: { name, url: "" },
  };
}

//a stand-in for the app's "Add to team" button: it adds through the real
//context, the way the app does, so the test watches the counter react
function AddEeveeButton() {
  const { addToTeam } = useTeam();
  return (
    <button onClick={() => addToTeam(details("eevee", 133, "normal"))}>
      add eevee
    </button>
  );
}

function renderCounter(storedTeam: ReturnType<typeof member>[] = []) {
  localStorage.setItem("pokemon_team", JSON.stringify(storedTeam));
  return render(
    <MemoryRouter>
      <TeamProvider>
        <PartyCounter />
        <AddEeveeButton />
      </TeamProvider>
    </MemoryRouter>,
  );
}

const pips = () =>
  screen
    .getByRole("link", { name: /party/i })
    .querySelectorAll<HTMLElement>("[data-filled]");

beforeEach(() => {
  localStorage.clear();
});

describe("PartyCounter", () => {
  //D45: the name starts with the visible word "Party", then the count
  it("shows an empty party as 0 of the maximum", () => {
    renderCounter();

    expect(
      screen.getByRole("link", { name: `Party, 0 of ${MAX_TEAM}` }),
    ).toBeInTheDocument();
  });

  it("counts the members on the team", () => {
    renderCounter([
      member("pikachu", 25),
      member("charizard", 6),
      member("eevee", 133),
    ]);

    expect(
      screen.getByRole("link", { name: `Party, 3 of ${MAX_TEAM}` }),
    ).toBeInTheDocument();
  });

  it("links to the team page", () => {
    renderCounter();

    expect(screen.getByRole("link", { name: /party/i })).toHaveAttribute(
      "href",
      "/team",
    );
  });

  it("draws one pip per slot and fills as many as there are members", () => {
    renderCounter([member("pikachu", 25), member("eevee", 133)]);

    expect(pips()).toHaveLength(MAX_TEAM);
    expect(
      screen
        .getByRole("link", { name: /party/i })
        .querySelectorAll('[data-filled="true"]'),
    ).toHaveLength(2);
  });

  it("keeps the decorative pips out of the accesible name", () => {
    renderCounter([member("pikachu", 25)]);

    expect(pips()[0].parentElement).toHaveAttribute("aria-hidden", "true");
  });

  //the pip reads --theme-accent from its own data-type, so it takes the
  //member's primary type color with no color logic in JS
  it("colors a filled pip with the member's primary type", () => {
    renderCounter([member("charizard", 6, ["fire", "flying"])]);

    expect(pips()[0]).toHaveAttribute("data-type", "fire");
    expect(pips()[1]).not.toHaveAttribute("data-type");
  });

  //D50: teams saved before types were stored show a plain Ink pip
  it("leaves the pip uncolored for a member saved without types", () => {
    renderCounter([member("pikachu", 25)]);

    expect(pips()[0]).toHaveAttribute("data-filled", "true");
    expect(pips()[0]).not.toHaveAttribute("data-type");
  });

  it("pops only the pip of a member who joins, never the ones loaded with the page", async () => {
    renderCounter([member("pikachu", 25, ["electric"])]);
    expect(pips()[0]).not.toHaveAttribute("data-joined");

    await userEvent.click(screen.getByRole("button", { name: "add eevee" }));

    expect(pips()[0]).not.toHaveAttribute("data-joined");
    expect(pips()[1]).toHaveAttribute("data-joined", "true");
  });

  //found in a real browser (B&W-4): Chrome puts a space before an
  //absolutely positioned hidden span, so "Party" + ", 0 of 6" was read as
  //"Party , 0 of 6". jsdom does not lay out, so it never showed the gap;
  //the name is now one string
  it("writes its name as one string, so no browser can split it", () => {
    renderCounter();

    expect(screen.getByRole("link")).toHaveAttribute(
      "aria-label",
      "Party, 0 of 6",
    );
  });
});
