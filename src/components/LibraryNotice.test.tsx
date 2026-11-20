import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LibraryNotice } from "./LibraryNotice";

describe("LibraryNotice", () => {
  it("shows the error text for the error state", () => {
    render(
      <LibraryNotice
        status="error"
        error="Could not load"
        emptyMessage="Nothing"
      />,
    );
    expect(screen.getByText("Could not load")).toBeInTheDocument();
    expect(screen.queryByText("Nothing")).not.toBeInTheDocument();
  });

  it("shows the empty message for the empty state", () => {
    render(
      <LibraryNotice status="empty" error={null} emptyMessage="Nothing" />,
    );
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });
});
