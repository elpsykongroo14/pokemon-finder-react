import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FavoriteButton } from "./FavoriteButton";

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
});
