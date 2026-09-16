import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamPage } from "./TeamPage";
import { TeamProvider } from "../context/TeamContext";

vi.mock("../context/TeamSlots", () => ({
  TeamSLots: () => <div data-testid="team-slots">team-slots</div>,
}));

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
});

//TeamSLots already has its own dedicated test file (Teamslots.test.tsx)
//covering the roster's real rendering logic. TeamPage's only job is to show the heading
//and mount the roster, so thats the only thing this file needs to prove
