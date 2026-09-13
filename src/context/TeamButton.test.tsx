import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamButton } from "./TeamButton";
import { useTeam } from "../hooks/useTeam";
import type { PokemonDetails } from "../lib/type";

vi.mock("../hooks/useTeam", () => ({
  useTeam: vi.fn(),
}));

const mockedUseTeam = vi.mocked(useTeam);

function setTeam(overrides: Partial<ReturnType<typeof useTeam>> = {}) {
  mockedUseTeam.mockReturnValue({
    team: [],
    error: null,
    addToTeam: vi.fn(),
    removeFromTeam: vi.fn(),
    clearError: vi.fn(),
    isOnTeam: () => false,
    ...overrides,
  });
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
});
