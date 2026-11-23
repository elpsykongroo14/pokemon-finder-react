import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FavoriteButton } from "./FavoriteButton";

const button = () => screen.getByRole("button", { name: "Favorite" });

describe("FavoriteButton", () => {
  it("shows the unfavorited state by default", () => {
    render(<FavoriteButton isFavorite={false} onToggle={() => {}} />);

    expect(button()).toHaveTextContent("Favorite");
    expect(button()).not.toHaveTextContent("Favorited");
    expect(button()).toHaveAttribute("aria-pressed", "false");
  });

  //spec 5.2: the visible words swap with the state
  it("says Favorited when it is a favorite", () => {
    render(<FavoriteButton isFavorite={true} onToggle={() => {}} />);

    expect(button()).toHaveTextContent("Favorited");
    expect(button()).toHaveAttribute("aria-pressed", "true");
  });

  //D44: the NAME never changes; aria-pressed says the state. a toggle that
  //changed both would be heard twice ("Favorited, pressed")
  it("is named exactly 'Favorite' in both states", () => {
    const { rerender } = render(
      <FavoriteButton isFavorite={false} onToggle={() => {}} />,
    );
    expect(button()).toBeInTheDocument();

    rerender(<FavoriteButton isFavorite={true} onToggle={() => {}} />);
    expect(button()).toBeInTheDocument();
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    render(<FavoriteButton isFavorite={false} onToggle={handleToggle} />);

    await user.click(button());

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("pops its icon only after an add has happened", () => {
    const { rerender } = render(
      <FavoriteButton isFavorite={true} onToggle={() => {}} />,
    );
    const icon = () => button().querySelector(".pop-icon");
    expect(icon()).not.toHaveAttribute("data-pop");

    rerender(
      <FavoriteButton isFavorite={true} onToggle={() => {}} popKey={1} />,
    );
    expect(icon()).toHaveAttribute("data-pop");
  });

  //the heart is drawn, not an emoji: filled when on, an outline when off,
  //and hidden from screen readers either way (the name says "Favorite")
  it("draws a filled heart when on and an outline when off", () => {
    const { rerender } = render(
      <FavoriteButton isFavorite={false} onToggle={() => {}} />,
    );
    const iconUse = () => button().querySelector("use");
    expect(iconUse()).toHaveAttribute("href", "/icons.svg#heart-outline-icon");

    rerender(<FavoriteButton isFavorite={true} onToggle={() => {}} />);
    expect(iconUse()).toHaveAttribute("href", "/icons.svg#heart-icon");
    expect(button().querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("sits on the black plate as a white (light) button", () => {
    render(<FavoriteButton isFavorite={false} onToggle={() => {}} />);

    expect(button()).toHaveAttribute("data-variant", "light");
  });
});
