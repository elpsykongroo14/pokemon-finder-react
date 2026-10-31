import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SegmentedControl } from "./SegmentedControl";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
] as const;

describe("SegmentedControl", () => {
  it("is a named group of radios with the current value selected", () => {
    render(
      <SegmentedControl
        label="Pick one"
        options={OPTIONS}
        value="b"
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("group", { name: "Pick one" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Alpha" })).not.toBeChecked();
  });

  it("calls onChange with the clicked option's value", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        label="Pick one"
        options={OPTIONS}
        value="a"
        onChange={handleChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "Gamma" }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("c");
  });

  it("is one Tab stop, and the arrow keys move the selection", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        label="Pick one"
        options={OPTIONS}
        value="a"
        onChange={handleChange}
      />,
    );

    await user.tab();
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(handleChange).toHaveBeenCalledWith("b");
  });
});
