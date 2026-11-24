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

describe("SegmentedControl, labelled and described", () => {
  it("keeps its legend visually hidden by default", () => {
    render(
      <SegmentedControl
        label="Pick one"
        options={OPTIONS}
        value="a"
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("Pick one")).toHaveClass("visually-hidden");
  });

  it("shows its legend when labelVisible is set, keeping the same name", () => {
    render(
      <SegmentedControl
        label="Pick one"
        labelVisible
        options={OPTIONS}
        value="a"
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("Pick one")).not.toHaveClass("visually-hidden");
    expect(screen.getByRole("group", { name: "Pick one" })).toBeInTheDocument();
  });

  it("links a description to the group with aria-describedby", () => {
    render(
      <SegmentedControl
        label="Pick one"
        options={OPTIONS}
        value="a"
        onChange={() => {}}
        description="Only one at a time."
      />,
    );

    expect(
      screen.getByRole("group", { name: "Pick one" }),
    ).toHaveAccessibleDescription("Only one at a time.");
  });

  it("has no aria-describedby when there is no description", () => {
    render(
      <SegmentedControl
        label="Pick one"
        options={OPTIONS}
        value="a"
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("group", { name: "Pick one" })).not.toHaveAttribute(
      "aria-describedby",
    );
  });
});

//B&W-7: the Library's view switch shows an icon before each word (spec
//7.4). the icon is decoration: each radio is still named by its word
describe("SegmentedControl, with icons", () => {
  it("draws an option's icon, hidden, and keeps the word as its name", () => {
    render(
      <SegmentedControl
        label="View"
        options={[
          { value: "a", label: "Grid", icon: <svg data-testid="grid-icon" /> },
          { value: "b", label: "Table" },
        ]}
        value="a"
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked();
    expect(screen.getByTestId("grid-icon").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
