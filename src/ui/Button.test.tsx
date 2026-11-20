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
});
