import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

describe("Select", () => {
  it("renders as a combobox with its options", () => {
    render(
      <Select aria-label="Sort cards" value="newest" onChange={vi.fn()}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "Sort cards" })).toHaveValue(
      "newest",
    );
  });

  it("reports the newly select option", async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Sort cards" value="newest" onChange={onChange}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </Select>,
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Sort cards" }),
      "oldest",
    );
    expect(onChange).toHaveBeenCalled();
  });
});
