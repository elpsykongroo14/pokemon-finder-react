import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("behaves like a normal text input", async () => {
    const onChange = vi.fn();
    render(<Input aria-label="Search" value="" onChange={onChange} />);
    await userEvent.type(
      screen.getByRole("textbox", { name: "Search" }),
      "pika",
    );
    expect(onChange).toHaveBeenCalledTimes(4);
  });
});
