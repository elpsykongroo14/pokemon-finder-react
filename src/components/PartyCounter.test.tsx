import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TeamProvider } from "../context/TeamContext";
import { MAX_TEAM } from "../lib/teamReducer";
import { PartyCounter } from "./PartyCounter";

function member(name: string, id: number) {
  return { name, id, sprite: `https://img.example/${name}.png` };
}

function renderCounter(storedTeam: ReturnType<typeof member>[] = []) {
  localStorage.setItem("pokemon_team", JSON.stringify(storedTeam));
  return render(
    <MemoryRouter>
      <TeamProvider>
        <PartyCounter />
      </TeamProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("PartyCounter", () => {
  it("shows an empty party as 0 of the maximum", () => {
    renderCounter();

    expect(
      screen.getByRole("link", { name: `Party 0/${MAX_TEAM}` }),
    ).toBeInTheDocument();
  });

  it("counts the members on the team", () => {
    renderCounter([
      member("pikachu", 25),
      member("charizard", 6),
      member("eevee", 133),
    ]);

    expect(
      screen.getByRole("link", { name: `Party 3/${MAX_TEAM}` }),
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

    const link = screen.getByRole("link", { name: /party/i });
    expect(link.querySelectorAll("[data-filled]")).toHaveLength(MAX_TEAM);
    expect(link.querySelectorAll('[data-filled="true"]')).toHaveLength(2);
  });
  it("keeps the decorative pips out of the accesible name", () => {
    renderCounter([member("pikachu", 25)]);

    const link = screen.getByRole("link", { name: /party/i });
    expect(link.querySelector("[data-filled]")?.parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
