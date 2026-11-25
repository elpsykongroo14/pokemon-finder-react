import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NamePlate } from "./NamePlate";
import type { PokemonDetails } from "../lib/type";

//the actions have their own tests
vi.mock("./PokemonActions", () => ({ PokemonActions: () => null }));

const hydreigon = {
  name: "hydreigon",
  id: 635,
  types: [
    { slot: 1, type: { name: "dark", url: "" } },
    { slot: 2, type: { name: "dragon", url: "" } },
  ],
  stats: [92, 105, 90, 125, 90, 98].map((base_stat) => ({
    base_stat,
    effort: 0,
    stat: { name: "x", url: "" },
  })),
} as unknown as PokemonDetails;

function renderPlate() {
  return render(<NamePlate pokemon={hydreigon} headingId="mon-name" />);
}

describe("NamePlate", () => {
  //moved from Stage.test: who the Pokémon is now lives on the plate
  it("shows the dex number, the name as a heading, and the types", () => {
    renderPlate();

    expect(screen.getByText("No. 635")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "hydreigon" }),
    ).toBeInTheDocument();
    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(screen.getByText("dragon")).toBeInTheDocument();
  });

  it("uses the large type chips", () => {
    const { container } = renderPlate();

    const chips = container.querySelectorAll(".type-badge");
    expect(chips).toHaveLength(2);
    chips.forEach((chip) => expect(chip).toHaveAttribute("data-size", "lg"));
  });

  it("adds up the base stat total, as text", () => {
    renderPlate();

    expect(screen.getByText("Base stat total")).toBeInTheDocument();
    expect(screen.getByText("600")).toBeInTheDocument();
  });

  //the bar is a picture of the number above it, measured against 720
  it("fills the total bar as a fraction, hidden from screen readers", () => {
    const { container } = renderPlate();

    const bar = container.querySelector(".name-plate__bar");
    expect(bar).toHaveAttribute("aria-hidden", "true");
    const fill = container.querySelector<HTMLElement>(".name-plate__fill");
    expect(Number(fill?.style.getPropertyValue("--fill"))).toBeCloseTo(
      600 / 720,
      3,
    );
  });

  //a black plate: .on-dark flips the text and focus ring colors inside it
  it("is a dark surface", () => {
    const { container } = renderPlate();

    expect(container.firstChild).toHaveClass("on-dark");
  });
});
