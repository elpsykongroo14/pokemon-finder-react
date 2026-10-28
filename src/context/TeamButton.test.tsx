import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamButton } from "./TeamButton";
import { useTeam } from "../hooks/useTeam";
import type { PokemonDetails, TeamMember } from "../lib/type";
import { MemoryRouter } from "react-router-dom";
import { MAX_TEAM } from "../lib/teamReducer";

vi.mock("../hooks/useTeam", () => ({
  useTeam: vi.fn(),
}));

const mockedUseTeam = vi.mocked(useTeam);

function makeMembers(count: number): TeamMember[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `member-${i + 1}`,
    id: i + 1,
    sprite: null,
  }));
}

function setTeam(overrides: Partial<ReturnType<typeof useTeam>> = {}) {
  mockedUseTeam.mockReturnValue({
    team: [],
    error: null,
    addToTeam: vi.fn(),
    removeFromTeam: vi.fn(),
    backfillMember: vi.fn(),
    clearError: vi.fn(),
    isOnTeam: () => false,
    ...overrides,
  });
}

//the full party hint contains a link to /team, so those tests need a router
function renderButton() {
  return render(
    <MemoryRouter>
      <TeamButton pokemon={pikachu} />
    </MemoryRouter>,
  );
}

const pikachu = { name: "pikachu" } as PokemonDetails;

beforeEach(() => {
  vi.useFakeTimers();
  setTeam();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TeamButton", () => {
  it("shows 'Add to Team' and calls addToTeam when not on the team", async () => {
    vi.useRealTimers();
    const addToTeam = vi.fn();
    setTeam({ isOnTeam: () => false, addToTeam });
    const user = userEvent.setup();

    render(<TeamButton pokemon={pikachu} />);

    const button = screen.getByRole("button", { name: "+ Add to Team" });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);
    expect(addToTeam).toHaveBeenCalledWith(pikachu);
  });

  it("shows an alert with the error message", () => {
    setTeam({ error: "pikachu is already on your team" });

    render(<TeamButton pokemon={pikachu} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "pikachu is already on your team",
    );
  });

  it("does not show an alert when there is no error", () => {
    setTeam({ error: null });

    render(<TeamButton pokemon={pikachu} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls clearError automatically after 3 seconds", () => {
    const clearError = vi.fn();
    setTeam({ error: "Team is full (6/6)", clearError });

    render(<TeamButton pokemon={pikachu} />);
    expect(clearError).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);

    expect(clearError).toHaveBeenCalledTimes(1);
  });

  it("does not fire the stale timer's clearError after a newer Error replaces it", () => {
    const clearError = vi.fn();
    setTeam({ error: "pikachu is already on your team", clearError });
    const { rerender } = render(<TeamButton pokemon={pikachu} />);

    vi.advanceTimersByTime(1500);

    setTeam({ error: "Team is full (6/6)", clearError });
    rerender(<TeamButton pokemon={pikachu} />);

    vi.advanceTimersByTime(1500);
    expect(clearError).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1500);
    expect(clearError).toHaveBeenCalledTimes(1);
  });

  describe("when the party is full", () => {
    it("explains what to do, with a link to the team page", () => {
      setTeam({ team: makeMembers(MAX_TEAM) });

      renderButton();

      expect(screen.getByText(/Your party is full/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Team page" })).toHaveAttribute(
        "href",
        "/team",
      );
    });

    it("ties the hint to the button so a screen reader reads it with the button", () => {
      setTeam({ team: makeMembers(MAX_TEAM) });
      renderButton();
      expect(
        screen.getByRole("button", { name: "+ Add to Team" }),
      ).toHaveAccessibleDescription(/Your party is full/);
    });

    it("says nothing about full while there is still room", () => {
      setTeam({ team: makeMembers(MAX_TEAM - 1) });

      renderButton();

      expect(screen.queryByText(/Your party is full/)).not.toBeInTheDocument();
    });

    it("says nothing about being full for a pokemon that is already on the team", () => {
      setTeam({ team: makeMembers(MAX_TEAM), isOnTeam: () => true });

      renderButton();

      expect(screen.queryByText(/Your party is full/)).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "✅ On Team" }),
      ).toBeInTheDocument();
    });

    it("does not also show the raw reduce error since the hint already covers it", () => {
      setTeam({ team: makeMembers(MAX_TEAM), error: "Team is full (6/6)" });

      renderButton();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText(/Your party is full/)).toBeInTheDocument();
    });

    it("announces a rejected add through a live region that was there from the start", () => {
      setTeam({ team: makeMembers(MAX_TEAM) });
      const { rerender } = renderButton();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();

      setTeam({ team: makeMembers(MAX_TEAM), error: "Team is full (6/6)" });
      rerender(
        <MemoryRouter>
          <TeamButton pokemon={pikachu} />
        </MemoryRouter>,
      );

      expect(screen.getByRole("status")).toHaveTextContent(
        "Couldn't add: your party is full.",
      );
    });
  });

  describe("completing the team", () => {
    async function clickAddWith(memberCount: number) {
      vi.useRealTimers();
      setTeam({ team: makeMembers(memberCount) });
      const user = userEvent.setup();
      const view = renderButton();
      await user.click(screen.getByRole("button", { name: "+ Add to Team" }));
      return view;
    }

    function becomeTeamOf(
      count: number,
      rerender: (ui: React.ReactElement) => void,
    ) {
      setTeam({ team: makeMembers(count), isOnTeam: () => true });
      rerender(
        <MemoryRouter>
          <TeamButton pokemon={pikachu} />
        </MemoryRouter>,
      );
    }

    it("celebrates, in words and visually, when this click fills the sixth slot", async () => {
      const { container, rerender } = await clickAddWith(MAX_TEAM - 1);

      becomeTeamOf(MAX_TEAM, rerender);

      expect(screen.getByRole("status")).toHaveTextContent("Team complete!");
      expect(container.querySelector(".team-complete")).toBeInTheDocument();
      expect(container.querySelectorAll(".team-complete__pip")).toHaveLength(
        MAX_TEAM,
      );
    });

    it("does not celebrate when a click only fills a middle slot", async () => {
      const { container, rerender } = await clickAddWith(2);

      becomeTeamOf(3, rerender);

      expect(container.querySelector(".team-complete")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("does not celebrate when the team became full some other way", () => {
      setTeam({ team: makeMembers(MAX_TEAM - 1) });
      const { container, rerender } = renderButton();

      becomeTeamOf(MAX_TEAM, rerender);

      expect(container.querySelector(".team-complete")).not.toBeInTheDocument();
    });

    it("hides the decorative banner from assistive tech (the live region carries the words)", async () => {
      const { container, rerender } = await clickAddWith(MAX_TEAM - 1);

      becomeTeamOf(MAX_TEAM, rerender);

      expect(container.querySelector(".team-complete")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });
});
