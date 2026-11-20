import { describe, it, expect, afterEach, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

  it("zooms in and out with the card button, and says which state it is in", async () => {
    const user = userEvent.setup();
    render(<TCGCardModal card={makeCard()} onClose={() => {}} />);
    const zoom = screen.getByRole("button", { name: "Zoom card" });

    expect(zoom).toHaveAttribute("aria-pressed", "false");
    await user.click(zoom);
    expect(zoom).toHaveAttribute("aria-pressed", "true");
    await user.click(zoom);
    expect(zoom).toHaveAttribute("aria-pressed", "false");
  });
});

describe("TCGCardModal chips", () => {
  it("shows the set and the rarity as chips, the rarity carrying its tier", () => {
    render(
      <TCGCardModal
        card={makeCard({ set: { name: "Base Set" }, rarity: "Rare Holo" })}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Base Set")).not.toHaveAttribute("data-rarity");
    expect(screen.getByText("Rare Holo")).toHaveAttribute(
      "data-rarity",
      "holo",
    );
  });

  it("does not repeat the set and rarity as rows under the chips", () => {
    render(
      <TCGCardModal
        card={makeCard({
          set: { name: "Base Set" },
          rarity: "Rare Holo",
          artist: "Mitsuhiro Arita",
        })}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Artist")).toBeInTheDocument();
    expect(screen.queryByText("Set")).not.toBeInTheDocument();
    expect(screen.queryByText("Rarity")).not.toBeInTheDocument();
  });

  it("shows no chip for a fact the card does not have", () => {
    render(<TCGCardModal card={makeCard()} onClose={() => {}} />);

    expect(document.querySelector(".card-chip")).toBeNull();
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
    const stage = screen.getByRole("button", { name: "Zoom card" });
    stage.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    return stage;
  }

  it("a holo card tilts toward the mouse", () => {
    const stage = renderTilting("Rare Holo");

    fireEvent.pointerMove(stage, {
      clientX: 150,
      clientY: 25,
      pointerType: "mouse",
    });

    expect(stage.style.getPropertyValue("--ry")).toBe("4deg");
  });

  it("a common card does not tilt", () => {
    const stage = renderTilting("Common");

    fireEvent.pointerMove(stage, {
      clientX: 150,
      clientY: 25,
      pointerType: "mouse",
    });

    expect(stage.style.getPropertyValue("--ry")).toBe("");
  });
});

//this file protects the two level image fallback and falvor text branch
//the logic is genuinely TCGCardModal's own, while relying on real already tested Modal and getCardMetaRows
//rather than re-verifying either one's internal rules from scratch
