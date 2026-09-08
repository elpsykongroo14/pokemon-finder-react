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

  it("joins multiple non hidden abilities with a comma", () => {
    render(
      <MetaInfo
        height={10}
        weight={10}
        abilities={[makeAbility("overgrow"), makeAbility("chlorophyll")]}
      />,
    );

    expect(
      screen.getByRole("cell", { name: "overgrow, chlorophyll" }),
    ).toBeInTheDocument();
  });

  it("does not render a Hidden row when no ability is hidden", () => {
    render(
      <MetaInfo
        height={10}
        weight={10}
        abilities={[makeAbility("overgrow")]}
      />,
    );

    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("renders a separate Hidden row for the hidden ability", () => {
    render(
      <MetaInfo
        height={10}
        weight={10}
        abilities={[makeAbility("overgrow"), makeAbility("chlorophyll", true)]}
      />,
    );

    expect(screen.getByText("Hidden")).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "chlorophyll" }),
    ).toBeInTheDocument();
    //and it must not also show up in the regular abilities list:
    expect(screen.getByRole("cell", { name: "overgrow" })).toBeInTheDocument();
  });
});
