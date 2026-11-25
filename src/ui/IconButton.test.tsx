import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("is named by its label, not by its icon", async () => {
    const onClick = vi.fn();
    render(<IconButton icon="⚙" aria-label="Settings" onClick={onClick} />);

    const button = screen.getByRole("button", { name: "Settings" });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("hides the icon itself from screen readers", () => {
    render(<IconButton icon="⚙" aria-label="Settings" />);
    expect(screen.getByText("⚙")).toHaveAttribute("aria-hidden", "true");
  });

  //a <button> inside a <form> submits by default; an icon button never should
  it("never submits a form", () => {
    render(<IconButton icon="x" aria-label="Close" />);
    expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute(
      "type",
      "button",
    );
  });
});
