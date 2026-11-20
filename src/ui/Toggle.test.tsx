import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("has an accessible name from its visible lable", () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Shiny" />);
    expect(screen.getByRole("checkbox", { name: "Shiny" })).toBeInTheDocument();
  });

  it("reports the new value as a plain boolean", async () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} label="Shiny" />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Shiny" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
