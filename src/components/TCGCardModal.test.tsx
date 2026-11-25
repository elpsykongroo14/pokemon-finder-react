import { describe, it, expect, afterEach, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TCGCardModal } from "./TCGCardModal";
import type { TCGCard } from "../lib/type";

function makeCard(overrides: Partial<TCGCard> = {}): TCGCard {
  return { id: "base1-4", name: "Charizard", ...overrides };
}

const THREE: TCGCard[] = [
  makeCard({ id: "a", name: "Hydreigon" }),
  makeCard({ id: "b", name: "Hydreigon ex" }),
  makeCard({ id: "c", name: "Hydreigon BREAK" }),
];

describe("TCGCardModal", () => {
  //changed in B&W-7: with no picture at all the dialog draws none (it used
  //to draw an <img> with no src, which browsers show as a broken image)
  it("prefers the large image, falling back to small, and draws none without one", () => {
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
    expect(screen.queryByAltText("Charizard")).not.toBeInTheDocument();
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
    expect(screen.getAllByText("Rare Holo").length).toBeGreaterThan(0);
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
      screen.queryByText("Spits fire hot enough to melt boulders."),
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

describe("TCGCardModal as dialog", () => {
  it("is a dialog named after the card", () => {
    render(<TCGCardModal card={makeCard()} onClose={() => {}} />);

    expect(
      screen.getByRole("dialog", { name: "Charizard card details" }),
    ).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<TCGCardModal card={makeCard()} onClose={handleClose} />);
    await user.keyboard("{Escape}");

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  //spec 7.4: focus goes to Close when the dialog opens
  it("puts focus on Close when it opens", () => {
    render(<TCGCardModal card={makeCard()} onClose={() => {}} />);

    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  //D53 retired the zoom: the card flips in instead, and is not a button
  it("has no zoom button any more", () => {
    render(<TCGCardModal card={makeCard()} onClose={() => {}} />);

    expect(
      screen.queryByRole("button", { name: "Zoom card" }),
    ).not.toBeInTheDocument();
  });
});

//changed in B&W-7: the chips became the spec's subtitle ("Surging Sparks,
//240/191") and a tier mark, and the list is the spec's (it includes Rarity)
describe("TCGCardModal facts (spec 7.4)", () => {
  it("writes the set and number under the name", () => {
    render(
      <TCGCardModal
        card={makeCard({
          number: "240",
          set: { name: "Surging Sparks", printedTotal: 191 },
        })}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Surging Sparks, 240/191")).toBeInTheDocument();
  });

  it("shows the rarity as a tier mark carrying its tier", () => {
    const { container } = render(
      <TCGCardModal
        card={makeCard({ rarity: "Special Illustration Rare" })}
        onClose={() => {}}
      />,
    );

    expect(container.ownerDocument.querySelector(".tier-mark")).toHaveAttribute(
      "data-rarity",
      "ultra",
    );
  });

  it("lists the facts as a description list, leaving out what the card lacks", () => {
    render(
      <TCGCardModal
        card={makeCard({
          set: { series: "Scarlet & Violet", releaseDate: "2024/11/08" },
          artist: "Akira Egawa",
        })}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Series").tagName).toBe("DT");
    expect(screen.getByText("8 Nov 2024").tagName).toBe("DD");
    expect(screen.getByText("Akira Egawa")).toBeInTheDocument();
    expect(screen.queryByText("HP")).not.toBeInTheDocument();
  });
});

//D53: Previous / Next and the arrow keys move through the cards in the
//order the page shows them
describe("TCGCardModal, flipping through", () => {
  it("says where this card sits in the current order", () => {
    render(<TCGCardModal card={THREE[1]!} cards={THREE} onClose={() => {}} />);

    expect(screen.getByText("Card 2 of 3")).toBeInTheDocument();
  });

  it("asks for the card before or after with the buttons", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(
      <TCGCardModal
        card={THREE[1]!}
        cards={THREE}
        onSelect={handleSelect}
        onClose={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Next card" }));
    expect(handleSelect).toHaveBeenLastCalledWith(THREE[2]);

    await user.click(screen.getByRole("button", { name: "Previous card" }));
    expect(handleSelect).toHaveBeenLastCalledWith(THREE[0]);
  });

  it("does the same with the arrow keys", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(
      <TCGCardModal
        card={THREE[1]!}
        cards={THREE}
        onSelect={handleSelect}
        onClose={() => {}}
      />,
    );

    await user.keyboard("{ArrowRight}");
    expect(handleSelect).toHaveBeenLastCalledWith(THREE[2]);

    await user.keyboard("{ArrowLeft}");
    expect(handleSelect).toHaveBeenLastCalledWith(THREE[0]);
  });

  it("disables the way past either end", () => {
    const { rerender } = render(
      <TCGCardModal card={THREE[0]!} cards={THREE} onClose={() => {}} />,
    );
    expect(
      screen.getByRole("button", { name: "Previous card" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next card" })).toBeEnabled();

    rerender(
      <TCGCardModal card={THREE[2]!} cards={THREE} onClose={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Next card" })).toBeDisabled();
  });

  //B&W-8: "Next card" onto the last card disables itself; a disabled
  //button drops focus out of the dialog. focus moves to the way back
  it("keeps focus in the dialog when a step reaches either end", async () => {
    const user = userEvent.setup();
    function Stateful() {
      const [card, setCard] = useState(THREE[1]!);
      return (
        <TCGCardModal
          card={card}
          cards={THREE}
          onSelect={setCard}
          onClose={() => {}}
        />
      );
    }
    render(<Stateful />);

    await user.click(screen.getByRole("button", { name: "Next card" }));
    expect(screen.getByRole("button", { name: "Next card" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous card" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Previous card" }));
    await user.click(screen.getByRole("button", { name: "Previous card" }));
    expect(
      screen.getByRole("button", { name: "Previous card" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next card" })).toHaveFocus();
  });

  //a new card is a new element, so its flip plays from the start
  it("draws a fresh card for each new card, so the flip plays again", () => {
    const { rerender } = render(
      <TCGCardModal card={THREE[0]!} cards={THREE} onClose={() => {}} />,
    );
    const before = document.querySelector(".card-dialog__flipper");

    rerender(
      <TCGCardModal card={THREE[1]!} cards={THREE} onClose={() => {}} />,
    );
    expect(document.querySelector(".card-dialog__flipper")).not.toBe(before);
  });

  it("tells keyboard users how to flip through", () => {
    render(<TCGCardModal card={makeCard()} onClose={() => {}} />);

    expect(document.querySelector(".card-dialog__keys")).toHaveTextContent(
      "Use ← → to flip through, Esc to close.",
    );
  });
});

describe("TCGCardModal holo tilt", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function renderTilting(rarity: string) {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    render(<TCGCardModal card={makeCard({ rarity })} onClose={() => {}} />);
    //B&W-7: the card is no longer a zoom button; its face takes the pointer
    const face = document.querySelector(".card-dialog__face") as HTMLElement;
    face.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 400, height: 200 }) as DOMRect;
    return face;
  }

  it("a holo card tilts toward the mouse", () => {
    const face = renderTilting("Rare Holo");

    fireEvent.pointerMove(face, {
      clientX: 300,
      clientY: 50,
      pointerType: "mouse",
    });

    //0.25 of the way right of center: 0.25 * 20 = 5deg (spec 7.4)
    expect(face.style.getPropertyValue("--ry")).toBe("5deg");
  });

  //changed in B&W-7: every card tilts (spec 6.2); a common card only
  //lacks the light
  it("a common card tilts too", () => {
    const face = renderTilting("Common");

    fireEvent.pointerMove(face, {
      clientX: 300,
      clientY: 50,
      pointerType: "mouse",
    });

    expect(face.style.getPropertyValue("--ry")).toBe("5deg");
  });
});
