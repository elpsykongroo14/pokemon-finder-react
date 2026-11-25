import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetaInfo } from "./MetaInfo";
import type { PokemonAbility } from "../lib/type";

function makeAbility(name: string, isHidden = false): PokemonAbility {
  return { is_hidden: isHidden, slot: 1, ability: { name, url: "" } };
}

describe("MetaInfo", () => {
  it("converts height and weight from the API's decimetre/hectogram units", () => {
    render(
      <MetaInfo
        height={17}
        weight={905}
        abilities={[makeAbility("overgrow")]}
      />,
    );

    expect(screen.getByRole("cell", { name: "1.7 m" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "90.5 kg" })).toBeInTheDocument();
  });

  it("labels every row with a row header, so each value is tied to its names", () => {
    render(
      <MetaInfo
        height={10}
        weight={10}
        abilities={[makeAbility("overgrow"), makeAbility("chlorophyll", true)]}
      />,
    );

    for (const name of ["Height", "Weight", "Abilities", "Hidden ability"]) {
      expect(screen.getByRole("rowheader", { name })).toBeInTheDocument();
    }
  });

  it("joins multiple non hidden abilities with a comma", () => {
    render(
      <MetaInfo
        height={10}
        weight={10}
        abilities={[makeAbility("overgrow"), makeAbility("chlorophyll")]}
      />,
    );

    expect(
      screen.getByRole("cell", { name: "Overgrow, Chlorophyll" }),
    ).toBeInTheDocument();
  });

  //spec 7.2: the row is always there, so every profile has the same four
  //rows; "None" answers the question instead of hiding it
  it("says None in the Hidden ability row when no ability is hidden", () => {
    render(
      <MetaInfo
        height={10}
        weight={10}
        abilities={[makeAbility("overgrow")]}
      />,
    );

    expect(
      screen.getByRole("rowheader", { name: "Hidden ability" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "None" })).toBeInTheDocument();
  });

  it("writes API slugs as words", () => {
    render(
      <MetaInfo
        height={10}
        weight={10}
        abilities={[makeAbility("flame-body"), makeAbility("swarm", true)]}
      />,
    );

    expect(
      screen.getByRole("cell", { name: "Flame Body" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Swarm" })).toBeInTheDocument();
  });

  it("renders a separate Hidden row for the hidden ability", () => {
    render(
      <MetaInfo
        height={10}
        weight={10}
        abilities={[makeAbility("overgrow"), makeAbility("chlorophyll", true)]}
      />,
    );

    expect(
      screen.getByRole("rowheader", { name: "Hidden ability" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "Chlorophyll" }),
    ).toBeInTheDocument();
    //and it must not also show up in the regular abilities list:
    expect(screen.getByRole("cell", { name: "Overgrow" })).toBeInTheDocument();
  });
});

//this file protects the unit-conversion math with an input specifically chosen to catch the most likely arithmetic mistake,
//and it protects the hidden ability partition in both directions
//not just "does the Hidden row show up" but "did the ability actually leave the normal list"
