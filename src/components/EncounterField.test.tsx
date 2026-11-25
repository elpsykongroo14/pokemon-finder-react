import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EncounterField, FieldSky } from "./EncounterField";

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

  //Home has no heading to point at: its field is named by a short label
  it("can be named by a label instead (Home's 'Wild encounter')", () => {
    render(
      <EncounterField label="Wild encounter">
        <p>x</p>
      </EncounterField>,
    );

    expect(
      screen.getByRole("region", { name: "Wild encounter" }),
    ).toBeInTheDocument();
  });

  it("tells CSS which field it is, so Home can be taller", () => {
    const { container } = render(
      <EncounterField variant="home">
        <p>x</p>
      </EncounterField>,
    );

    expect(container.querySelector(".encounter-field")).toHaveAttribute(
      "data-variant",
      "home",
    );
  });
});

//B&W-5: Compare paints two skies side by side, each in its own Pokémon's
//colors, so the scenery is a piece of its own
describe("FieldSky", () => {
  it("paints a sky, a ground and two stripes, hidden from assistive tech", () => {
    const { container } = render(<FieldSky />);

    const sky = container.querySelector(".encounter-field__sky");
    expect(sky).toHaveAttribute("aria-hidden", "true");
    expect(sky?.querySelector(".encounter-field__ground")).not.toBeNull();
    expect(sky?.querySelectorAll(".encounter-field__stripe")).toHaveLength(2);
  });
});
