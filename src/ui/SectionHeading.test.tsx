import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeading } from "./SectionHeading";

describe("SectionHeading", () => {
  it("is a level 2 heading by default", () => {
    render(<SectionHeading>Type matchups</SectionHeading>);
    expect(
      screen.getByRole("heading", { level: 2, name: "Type matchups" }),
    ).toBeInTheDocument();
  });

  //the outline of the page decides the level, not the look: a section
  //inside a section is an h3 that still draws the same rule and size
  it("takes the level the page outline needs", () => {
    render(<SectionHeading level={3}>Evolution</SectionHeading>);
    expect(
      screen.getByRole("heading", { level: 3, name: "Evolution" }),
    ).toBeInTheDocument();
  });

  it("forwards an id so a section can be labelled by its heading", () => {
    render(
      <section aria-labelledby="stats-heading">
        <SectionHeading id="stats-heading">Base stats</SectionHeading>
      </section>,
    );
    expect(screen.getByRole("region", { name: "Base stats" })).toBeVisible();
  });
});
