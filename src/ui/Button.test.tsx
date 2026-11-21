import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";
import { describe, it, vi, expect } from "vitest";

describe("Button", () => {
  it("renders it label and responds to a click", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("is not a toggle button when `pressed` is not provided", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).not.toHaveAttribute(
      "aria-pressed",
    );
  });

  it("announces its pressed state when it is a toggle", () => {
    render(<Button pressed>Shiny</Button>);
    expect(screen.getByRole("button", { name: "Shiny" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("is disabled and non clickable while loading", async () => {
    const handleClick = vi.fn();
    render(
      <Button loading onClick={handleClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  //the four looks are named after what they sit on: dark and line live on
  //white, light and ghost on a black plate
  it("draws the dark variant unless told otherwise", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "data-variant",
      "dark",
    );
  });

  it("passes its variant and size to CSS", () => {
    render(
      <Button variant="line" size="sm">
        Details
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Details" });
    expect(button).toHaveAttribute("data-variant", "line");
    expect(button).toHaveAttribute("data-size", "sm");
  });
});
