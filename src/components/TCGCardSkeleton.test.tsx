import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TCGCardSkeleton } from "./TCGCardSkeleton";

describe("TCGCardSkeleton", () => {
  it("is purely decorative: no status, no button, nothing for a screen reader", () => {
    render(<TCGCardSkeleton />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
