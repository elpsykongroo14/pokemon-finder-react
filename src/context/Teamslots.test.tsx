import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { TeamSLots } from "./TeamSlots";
import { TeamProvider } from "./TeamContext";
import { PreferencesProvider } from "./PreferencesContext";
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
    //PreferencesProvider: B&W-6, the card asks whether animations are on
    //before it waits for an exit animation
    <MemoryRouter>
      <PreferencesProvider>
        <TeamProvider>
          <TeamSLots />
        </TeamProvider>
      </PreferencesProvider>
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

  it("removes a member and frees up their slot once the exit animation ends", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "pokemon_team",
      JSON.stringify([{ name: "pikachu", id: 25, sprite: "pikachu.png" }]),
    );
    const { container } = renderSlots();

    await user.click(
      screen.getByRole("button", { name: "Remove pikachu from team" }),
    );
    //removal is now two steps: the card first plays its exit, then it is removed
    fireEvent.animationEnd(
      container.querySelector(".team-slot--filled") as HTMLElement,
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

    //changed in B&W-6: the words were a hidden "Empty slot 3"; the slot
    //now shows them (spec 7.5), so the test asks for the visible wording
    it("gives every empty slot a name, numbered by its position", () => {
      seedTeam(makeMembers(2));

      renderSlots();

      expect(screen.queryByText("Slot 1 is open")).not.toBeInTheDocument();
      expect(screen.queryByText("Slot 2 is open")).not.toBeInTheDocument();
      for (const n of [3, 4, 5, 6]) {
        expect(screen.getByText(`Slot ${n} is open`)).toBeVisible();
      }
    });

    //spec 7.5: an open slot is an invitation, so it says how to fill it
    it("offers a way to find a Pokémon in every open slot", () => {
      seedTeam(makeMembers(4));

      renderSlots();

      const links = screen.getAllByRole("link", { name: "Find a Pokémon" });
      expect(links).toHaveLength(2);
      for (const link of links) expect(link).toHaveAttribute("href", "/");
    });

    it("shows each member's dex number and names the card with a heading", () => {
      seedTeam([{ name: "hydreigon", id: 635, sprite: null }]);

      renderSlots();

      expect(screen.getByText("No. 635")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: "hydreigon" }),
      ).toBeInTheDocument();
    });

    //D49: the total travels with the member, so the card needs no fetch
    it("shows the base stat total once the member has one", () => {
      seedTeam([
        { name: "hydreigon", id: 635, sprite: null, statTotal: 600 },
        { name: "pikachu", id: 25, sprite: null },
      ]);

      const { container } = renderSlots();

      const [withTotal, withoutTotal] = container.querySelectorAll(
        ".team-slot--filled",
      ) as NodeListOf<HTMLElement>;
      expect(within(withTotal).getByText("Base stat total")).toBeVisible();
      expect(within(withTotal).getByText("600")).toBeVisible();
      //a team saved before B&W-6: no number to show until the backfill
      //brings one, and no "0" pretending to be a total
      expect(
        within(withoutTotal).queryByText("Base stat total"),
      ).not.toBeInTheDocument();
    });

    //the card has one way in, the name. "Details" is drawn like a button
    //for the eye, but a second link to the same page would be a second
    //tab stop that says less than the first
    it("gives each card exactly one link, named by the Pokémon", () => {
      seedTeam([{ name: "hydreigon", id: 635, sprite: null }]);

      const { container } = renderSlots();

      const card = container.querySelector(".team-slot--filled") as HTMLElement;
      expect(within(card).getAllByRole("link")).toHaveLength(1);
      expect(within(card).getByText("Details")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
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

    //changed in B&W-8: the card follows the sprite setting now (D65 left it
    //for B&W-8). only ARTWORK depends on the saved sprite; pixel sprites
    //come from the dex number, so this case is about artwork mode
    it("draws no image and does not crash, for a member with no saved artwork", () => {
      localStorage.setItem(
        "pokemon_preferences",
        JSON.stringify({ animations: "auto", spriteMode: "artwork" }),
      );
      seedTeam([{ name: "pikachu", id: 25, sprite: null }]);

      const { container } = renderSlots();

      expect(container.querySelector("img")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "pikachu" })).toBeInTheDocument();
    });

    //B&W-8: the setting the Pokémon page's sprites follow, cards follow too
    it("draws the pixel sprite from the dex number in pixel mode", () => {
      seedTeam([{ name: "pikachu", id: 25, sprite: "art.png" }]);

      const { container } = renderSlots();

      const img = container.querySelector("img");
      expect(img?.getAttribute("src")).toMatch(/\/pokemon\/25\.png$/);
      expect(img).toHaveAttribute("data-mode", "pixel");
    });

    it("draws the saved artwork in artwork mode", () => {
      localStorage.setItem(
        "pokemon_preferences",
        JSON.stringify({ animations: "auto", spriteMode: "artwork" }),
      );
      seedTeam([{ name: "pikachu", id: 25, sprite: "art.png" }]);

      const { container } = renderSlots();

      const img = container.querySelector("img");
      expect(img).toHaveAttribute("src", "art.png");
      expect(img).toHaveAttribute("data-mode", "artwork");
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

    //the mini field's stripes are the second type's color (spec 4.1), which
    //the type-theme engine reads from data-type2
    it("gives a two-type member's slot its second type too", () => {
      seedTeam([
        { name: "charizard", id: 6, sprite: null, types: ["fire", "flying"] },
        { name: "pikachu", id: 25, sprite: null, types: ["electric"] },
      ]);

      const { container } = renderSlots();

      const [first, second] = container.querySelectorAll(".team-slot--filled");
      expect(first).toHaveAttribute("data-type2", "flying");
      expect(second).not.toHaveAttribute("data-type2");
    });
  });

  describe("removing a member (exit animation, D6)", () => {
    function clickRemove(name: string) {
      fireEvent.click(
        screen.getByRole("button", { name: `Remove ${name} from team` }),
      );
    }

    function leavingCard(container: HTMLElement) {
      return container.querySelector(".team-slot--filled") as HTMLElement;
    }

    beforeEach(() => {
      seedTeam([
        { name: "pikachu", id: 25, sprite: null },
        { name: "charmander", id: 4, sprite: null },
      ]);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("marks the card as leaving, but keeps it in place until the exit ends", () => {
      const { container } = renderSlots();

      clickRemove("pikachu");

      expect(leavingCard(container)).toHaveAttribute("data-leaving", "true");
      expect(screen.getByRole("link", { name: "pikachu" })).toBeInTheDocument();
    });

    it("removes the member when its own exit animation ends", () => {
      const { container } = renderSlots();

      clickRemove("pikachu");
      fireEvent.animationEnd(leavingCard(container));

      expect(
        screen.queryByRole("link", { name: "pikachu" }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "charmander" }),
      ).toBeInTheDocument();
    });

    it("removes the member anyway if the animation never reports back", () => {
      vi.useFakeTimers();
      renderSlots();

      clickRemove("pikachu");
      expect(screen.getByRole("link", { name: "pikachu" })).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(
        screen.queryByRole("link", { name: "pikachu" }),
      ).not.toBeInTheDocument();
    });

    it("ignores an animation end that comes from a child of the card", () => {
      renderSlots();

      clickRemove("pikachu");
      fireEvent.animationEnd(screen.getByRole("link", { name: "pikachu" }));

      expect(screen.getByRole("link", { name: "pikachu" })).toBeInTheDocument();
    });

    it("ignores the animation end of a card that is not leaving (the enter animation)", () => {
      const { container } = renderSlots();

      fireEvent.animationEnd(leavingCard(container));

      expect(screen.getByRole("link", { name: "pikachu" })).toBeInTheDocument();
      expect(container.querySelector("[data-leaving]")).not.toBeInTheDocument();
    });

    it("lets only one card leave at a time", () => {
      const { container } = renderSlots();

      clickRemove("pikachu");
      clickRemove("charmander");

      expect(container.querySelectorAll("[data-leaving]")).toHaveLength(1);
      expect(
        screen.getByRole("link", { name: "pikachu" }).closest("li"),
      ).toHaveAttribute("data-leaving");
    });

    it("announces the removal only after it has happened", () => {
      const { container } = renderSlots();

      clickRemove("pikachu");
      expect(screen.getByRole("status")).toBeEmptyDOMElement();

      fireEvent.animationEnd(leavingCard(container));
      expect(screen.getByRole("status")).toHaveTextContent(
        "pikachu removed from your team.",
      );
    });

    //the slot-leave motion only exists while animations are on (spec 6.2,
    //D59). with them off no animationend will ever come, so waiting for it
    //would leave the card on screen for the whole fallback time
    it("removes the member at once when animations are off", () => {
      localStorage.setItem(
        "pokemon_preferences",
        JSON.stringify({ animations: "off", spriteMode: "pixel" }),
      );
      const { container } = renderSlots();

      clickRemove("pikachu");

      expect(
        screen.queryByRole("link", { name: "pikachu" }),
      ).not.toBeInTheDocument();
      expect(container.querySelector("[data-leaving]")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent(
        "pikachu removed from your team.",
      );
      expect(screen.getByRole("list", { name: "Your party" })).toHaveFocus();
    });

    it("moves keyboard focus to the party list, so it is not lost with the button", () => {
      const { container } = renderSlots();

      clickRemove("pikachu");
      fireEvent.animationEnd(leavingCard(container));

      expect(screen.getByRole("list", { name: "Your party" })).toHaveFocus();
    });
  });
});
