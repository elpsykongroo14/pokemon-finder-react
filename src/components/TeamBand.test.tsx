import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamBand } from "./TeamBand";
import { TeamProvider } from "../context/TeamContext";
import type { TeamMember } from "../lib/type";

function seedTeam(members: TeamMember[]) {
  localStorage.setItem("pokemon_team", JSON.stringify(members));
}

function renderBand() {
  return render(
    <TeamProvider>
      <TeamBand />
    </TeamProvider>,
  );
}

function pips(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>(".team-band__pip")];
}

beforeEach(() => {
  localStorage.clear();
});

describe("TeamBand", () => {
  it("names the page with a heading", () => {
    renderBand();

    expect(
      screen.getByRole("heading", { level: 2, name: "Your team" }),
    ).toBeInTheDocument();
  });

  it("says how many slots are filled and that the team is saved", () => {
    seedTeam([
      { name: "hydreigon", id: 635, sprite: null },
      { name: "volcarona", id: 637, sprite: null },
    ]);

    renderBand();

    expect(
      screen.getByText(
        "2 of 6 slots filled. Your team is saved in this browser.",
      ),
    ).toBeInTheDocument();
  });

  it("says the party is ready when it is full", () => {
    seedTeam(
      Array.from({ length: 6 }, (_, i) => ({
        name: `member-${i + 1}`,
        id: i + 1,
        sprite: null,
      })),
    );

    renderBand();

    expect(
      screen.getByText("Six of six. Your party is ready."),
    ).toBeInTheDocument();
  });

  //the pips repeat the sentence for the eye, so they are hidden from
  //screen readers, which already heard the count
  it("draws six pips, hidden from screen readers", () => {
    const { container } = renderBand();

    expect(pips(container)).toHaveLength(6);
    expect(container.querySelector(".team-band__pips")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  //[data-type] is what type-themes.css reads to give a pip its own
  //--theme-accent, the same way the header's party counter does it
  it("fills one pip per member, in its primary type", () => {
    seedTeam([
      { name: "hydreigon", id: 635, sprite: null, types: ["dark", "dragon"] },
      { name: "pikachu", id: 25, sprite: null },
    ]);

    const { container } = renderBand();

    const [first, second, ...rest] = pips(container);
    expect(first).toHaveAttribute("data-filled", "true");
    expect(first).toHaveAttribute("data-type", "dark");
    //a member saved without types: a filled pip with no theme (Ink)
    expect(second).toHaveAttribute("data-filled", "true");
    expect(second).not.toHaveAttribute("data-type");
    for (const pip of rest) {
      expect(pip).toHaveAttribute("data-filled", "false");
    }
  });
});
