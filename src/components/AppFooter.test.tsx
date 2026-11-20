import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { AppFooter } from "./AppFooter";
import { FOOTER_DISCLAIMER } from "../lib/copy";

describe("AppFooter", () => {
  it("is the page's contentinfo landmark", () => {
    render(<AppFooter />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("says planly that this is an unofficial fan project", () => {
    render(<AppFooter />);

    expect(screen.getByText(FOOTER_DISCLAIMER)).toBeInTheDocument();
  });

  it.each([
    ["PokéAPI", "https://pokeapi.co"],
    ["Pokémon TCG API", "https://pokemontcg.io"],
    ["Jersey 10 & Nunito", "https://fontsource.org"],
    ["elpsykongroo14", "https://github.com/elpsykongroo14"],
  ])("credits %s with a link to its source", (name, href) => {
    render(<AppFooter />);

    expect(
      within(screen.getByRole("contentinfo")).getByRole("link", { name }),
    ).toHaveAttribute("href", href);
  });
});
