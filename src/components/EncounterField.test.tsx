import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EncounterField } from "./EncounterField";

describe("EncounterField", () => {
  it("is a region named by the heading it is given", () => {
    render(
      <EncounterField labelledBy="mon">
        <h2 id="mon">Hydreigon</h2>
      </EncounterField>,
    );

    expect(
      screen.getByRole("region", { name: "Hydreigon" }),
    ).toBeInTheDocument();
  });

  //while loading there is no name yet: an unnamed section is not announced
  //as a region at all, instead of as an empty one
  it("is not a named region before there is a name", () => {
    render(
      <EncounterField>
        <p>loading</p>
      </EncounterField>,
    );

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  //sky, ground, two stripes: scenery, never read out
  it("paints its scenery hidden from assistive tech", () => {
    const { container } = render(
      <EncounterField>
        <p>x</p>
      </EncounterField>,
    );

    const sky = container.querySelector(".encounter-field__sky");
    expect(sky).toHaveAttribute("aria-hidden", "true");
    expect(sky?.querySelector(".encounter-field__ground")).not.toBeNull();
    expect(sky?.querySelectorAll(".encounter-field__stripe")).toHaveLength(2);
  });

  //D43: the field must outlive the Pokémon inside it, so the sky can
  //change color under the slab. new content must not remount the field
  it("keeps the same field element when its content changes", () => {
    const { container, rerender } = render(
      <EncounterField>
        <p key="pikachu">pikachu</p>
      </EncounterField>,
    );
    const field = container.querySelector(".encounter-field");

    rerender(
      <EncounterField labelledBy="x">
        <p key="raichu">raichu</p>
      </EncounterField>,
    );

    expect(container.querySelector(".encounter-field")).toBe(field);
  });
});
