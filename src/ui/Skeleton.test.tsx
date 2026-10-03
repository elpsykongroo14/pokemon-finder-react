import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("announces itself as requested", () => {
    render(<Skeleton width={96} height={96} label="Pikachu sprite loading" />);
    expect(
      screen.getByRole("status", { name: "Pikachu sprite loading" }),
    ).toHaveStyle({ width: "96px", height: "96px" });
  });

  it("stays silent when decorative", () => {
    render(<Skeleton width={96} height={96} decorative />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
