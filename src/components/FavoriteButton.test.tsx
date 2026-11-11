import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FavoriteButton, FavoriteStatus } from "./FavoriteButton";
import type { FavoriteAction } from "../hooks/useFavoriteAction";
import { FIRST_FAVORITE } from "../lib/copy";

function makeAction(overrides: Partial<FavoriteAction> = {}): FavoriteAction {
  return {
    isFavorite: false,
    toggle: () => {},
    popKey: 0,
    celebratingFirst: false,
    announcement: "",
    ...overrides,
  };
}

describe("FavoriteButton", () => {
  it("shows the unfavorited state by default", () => {
    render(<FavoriteButton isFavorite={false} onToggle={() => {}} />);

    const button = screen.getByRole("button", { name: /favorite/i });
    expect(button).toHaveTextContent("🤍 Favorite");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("shows the favorited state when isFavorite is true", () => {
    render(<FavoriteButton isFavorite={true} onToggle={() => {}} />);

    const button = screen.getByRole("button", { name: /favorite/i });
    expect(button).toHaveTextContent("❤️ In Favorites");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    render(<FavoriteButton isFavorite={false} onToggle={handleToggle} />);

    await user.click(screen.getByRole("button", { name: /favorite/i }));

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("pops its icon only after an add has happened", () => {
    const { rerender } = render(
      <FavoriteButton isFavorite={true} onToggle={() => {}} />,
    );
    expect(screen.getByText("❤️")).not.toHaveAttribute("data-pop");

    rerender(
      <FavoriteButton isFavorite={true} onToggle={() => {}} popKey={1} />,
    );
    expect(screen.getByText("❤️")).toHaveAttribute("data-pop");
  });
});

describe("FavoriteStatus", () => {
  it("shows and announces the first-favorite celebration", () => {
    render(
      <FavoriteStatus
        action={makeAction({
          celebratingFirst: true,
          announcement: FIRST_FAVORITE,
        })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(FIRST_FAVORITE);
  });

  it("keeps an empty live region ready when there is nothing to say", () => {
    render(<FavoriteStatus action={makeAction()} />);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
