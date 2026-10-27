import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { TeamSLots } from "./TeamSlots";
import { TeamProvider } from "./TeamContext";
import { MAX_TEAM } from "../lib/teamReducer";
import type { TeamMember } from "../lib/type";

function seedTeam(members: TeamMember[]) {
  localStorage.setItem("pokemon_team", JSON.stringify(members));
}

function makeMembers(count: number): TeamMember[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `member-${i + 1}`,
    id: i + 1,
    sprite: null,
  }));
}

function renderSlots() {
  return render(
    <MemoryRouter>
      <TeamProvider>
        <TeamSLots />
      </TeamProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("TeamSLots", () => {
  it("renders six empty slots when the team is empty", () => {
    const { container } = renderSlots();

    expect(container.querySelectorAll(".team-slot")).toHaveLength(6);
    expect(container.querySelectorAll(".team-slot--empty")).toHaveLength(6);
  });

  it("renders a filled slot with a link for each team member, leaving the rest empty", () => {
    localStorage.setItem(
      "pokemon_team",
      JSON.stringify([{ name: "pikachu", id: 25, sprite: "pikachu.png" }]),
    );

    const { container } = renderSlots();

    expect(screen.getByRole("link", { name: "pikachu" })).toHaveAttribute(
      "href",
      "/pokemon/pikachu",
    );
    expect(container.querySelectorAll(".team-slot--filled")).toHaveLength(1);
    expect(container.querySelectorAll(".team-slot--empty")).toHaveLength(5);
  });

  it("removes a member and frees up their slot when the remove button is clicked", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "pokemon_team",
      JSON.stringify([{ name: "pikachu", id: 25, sprite: "pikachu.png" }]),
    );
    const { container } = renderSlots();

    await user.click(
      screen.getByRole("button", { name: "Remove pikachu from team" }),
    );

    expect(
      screen.queryByRole("link", { name: "pikachu" }),
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll(".team-slot--empty")).toHaveLength(6);
  });

  describe("the party screen", () => {
    it.each([0, 1, 5, MAX_TEAM])(
      "always renders exactly MAX_TEAM slots, with %i members",
      (count) => {
        seedTeam(makeMembers(count));

        const { container } = renderSlots();

        expect(container.querySelectorAll(".team-slot")).toHaveLength(MAX_TEAM);
        expect(container.querySelectorAll(".team-slot--filled")).toHaveLength(
          count,
        );
      },
    );

    it("gives every empty slot a spoken name, numbered by its position", () => {
      seedTeam(makeMembers(2));

      renderSlots();

      expect(screen.queryByText("Empty slot 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Empty slot 2")).not.toBeInTheDocument();
      for (const n of [3, 4, 5, 6]) {
        expect(screen.getByText(`Empty slot ${n}`)).toBeInTheDocument();
      }
    });

    it("shows a type badge for each saved type, in order", () => {
      seedTeam([
        { name: "charizard", id: 6, sprite: null, types: ["fire", "flying"] },
      ]);

      const { container } = renderSlots();

      const badges = container.querySelectorAll(".type-badge");
      expect([...badges].map((b) => b.textContent)).toEqual(["fire", "flying"]);
    });

    it("still renders a member saved before type existed, with no badges", () => {
      seedTeam([{ name: "pikachu", id: 25, sprite: null }]);

      const { container } = renderSlots();

      expect(screen.getByRole("link", { name: "pikachu" })).toBeInTheDocument();
      expect(container.querySelectorAll(".type-badge")).toHaveLength(0);
    });

    it("keeps the link's name to just the pokemon's name (sprite and types are not included)", () => {
      seedTeam([
        {
          name: "charizard",
          id: 6,
          sprite: "charizard.png",
          types: ["fire", "flying"],
        },
      ]);

      const { container } = renderSlots();

      expect(
        screen.getByRole("link", { name: "charizard" }),
      ).toBeInTheDocument();
      expect(container.querySelector("img")).toHaveAttribute("alt", "");
    });

    it("draws no image and does not crash, for a member with no sprite", () => {
      seedTeam([{ name: "pikachu", id: 25, sprite: null }]);

      const { container } = renderSlots();

      expect(container.querySelector("img")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "pikachu" })).toBeInTheDocument();
    });

    it("marks only the first slot as the lead, and says so in words", () => {
      seedTeam(makeMembers(3));

      const { container } = renderSlots();

      const slots = container.querySelectorAll(".team-slot");
      expect(slots[0]).toHaveAttribute("data-lead", "true");
      for (const slot of [...slots].slice(1)) {
        expect(slot).not.toHaveAttribute("data-lead");
      }
      expect(screen.getAllByText("Lead")).toHaveLength(1);
    });

    it("keeps the lead slot (without the word) when the team is empty", () => {
      const { container } = renderSlots();

      expect(container.querySelector(".team-slot")).toHaveAttribute(
        "data-lead",
        "true",
      );
      expect(screen.queryByText("Lead")).not.toBeInTheDocument();
    });

    it("themes each filled slot by its pokemon's primary type", () => {
      seedTeam([
        { name: "charizard", id: 6, sprite: null, types: ["fire", "flying"] },
        { name: "pikachu", id: 25, sprite: null },
      ]);

      const { container } = renderSlots();

      const [first, second] = container.querySelectorAll(".team-slot--filled");
      expect(first).toHaveAttribute("data-type", "fire");
      expect(second).not.toHaveAttribute("data-type");
    });
  });
});
