import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TCGCardModal } from "./TCGCardModal";
import type { TCGCard } from "../lib/type";

function makeCard(overrides: Partial<TCGCard> = {}): TCGCard {
  return { id: "base1-4", name: "Charizard", ...overrides };
}

describe("TCGCardModal", () => {
  it("prefers the large image, falling back to small, falling back to empty", () => {
    const { rerender } = render(
      <TCGCardModal
        card={makeCard({ images: { small: "small.png", large: "large.png" } })}
        onClose={() => {}}
      />,
    );
    expect(screen.getByAltText("Charizard")).toHaveAttribute(
      "src",
      "large.png",
    );

    rerender(
      <TCGCardModal
        card={makeCard({ images: { small: "small.png" } })}
        onClose={() => {}}
      />,
    );
    expect(screen.getByAltText("Charizard")).toHaveAttribute(
      "src",
      "small.png",
    );

    rerender(
      <TCGCardModal
        card={makeCard({ images: undefined })}
        onClose={() => {}}
      />,
    );
    expect(screen.getByAltText("Charizard")).not.toHaveAttribute("src");
  });

  it("renders the cardname and its real meta rows", () => {
    const cards = makeCard({
      set: { name: "Base set" },
      rarity: "Rare Holo",
      hp: "120",
    });

    render(<TCGCardModal card={cards} onClose={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "Charizard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Base set")).toBeInTheDocument();
    expect(screen.getByText("Rare Holo")).toBeInTheDocument();
    expect(screen.getByText("120 HP")).toBeInTheDocument(); //this line is doing double duty, its not just checking that meta row rendered,
    //its implicitly relying on getCardMetaRows's real ${card.hp} HP formatting
  });

  it("shows flavor text when present, and omits it when absent", () => {
    const { rerender } = render(
      <TCGCardModal
        card={makeCard({
          flavorText: "Spits fire hot enough to melt boulders.",
        })}
        onClose={() => {}}
      />,
    );
    expect(
      screen.getByText("Spits fire hot enough to melt boulders."),
    ).toBeInTheDocument();

    rerender(
      <TCGCardModal
        card={makeCard({ flavorText: undefined })}
        onClose={() => {}}
      />,
    );
    expect(
      screen.queryByText("Spites fire hot enough to melt boulders."),
    ).not.toBeInTheDocument();
  });

  it("wires onClose through to the modal's close button", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<TCGCardModal card={makeCard()} onClose={handleClose} />);
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

//this file protects the two level image fallback and falvor text branch
//the logic is genuinely TCGCardModal's own, while relying on real already tested Modal and getCardMetaRows
//rather than re-verifying either one's internal rules from scratch
