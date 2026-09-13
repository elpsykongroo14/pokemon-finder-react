import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { TeamSLots } from "./TeamSlots";
import { TeamProvider } from "./TeamContext";

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
});
