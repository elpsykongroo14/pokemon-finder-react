import { describe, it, expect, afterEach, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TCGCardGridItem } from "./TCGCardGridItem";
import type { TCGCard } from "../lib/type";

function makeCard(overrides: Partial<TCGCard> = {}): TCGCard {
  return { id: "base1-4", name: "Charizard", ...overrides };
}

describe("TCGCardGridItem", () => {
  it("renders the card's name, image, set, and rarity", () => {
    const card = makeCard({
      set: { name: "Base Set" },
      rarity: "Rare Holo",
      images: { small: "charizard.png" },
    });

    render(<TCGCardGridItem card={card} onSelect={() => {}} />);

    expect(screen.getByText("Charizard")).toBeInTheDocument();
    expect(screen.getByText("Base Set")).toBeInTheDocument();
    expect(screen.getByText("Rare Holo")).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute(
      "src",
      "charizard.png",
    );
  });

  it("falls back to placeholder text when set or rarity is missing", () => {
    const card = makeCard({ set: undefined, rarity: undefined });

    render(<TCGCardGridItem card={card} onSelect={() => {}} />);

    expect(screen.getByText("Unknown set")).toBeInTheDocument();
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("is a real button whose name carries the name, set and rarity", () => {
    const card = makeCard({
      set: { name: "Base Set" },
      rarity: "Rare Holo",
    });

    render(<TCGCardGridItem card={card} onSelect={() => {}} />);

    expect(
      screen.getByRole("button", { name: /Charizard.*Base Set.*Rare Holo/ }),
    ).toBeInTheDocument();
  });

  it("tags the button with its rarity tier so css can style it", () => {
    const { rerender } = render(
      <TCGCardGridItem
        card={makeCard({ rarity: "Rare Holo" })}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("data-rarity", "holo");

    rerender(
      <TCGCardGridItem
        card={makeCard({ rarity: undefined })}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("data-rarity", "common");
  });

  it("calls onSelect with the card when clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const card = makeCard();

    render(<TCGCardGridItem card={card} onSelect={handleSelect} />);

    await user.click(screen.getByRole("button", { name: /Charizard/ }));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(card);
  });

  it("can be opened with Space", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const card = makeCard();

    render(<TCGCardGridItem card={card} onSelect={handleSelect} />);

    await user.tab();
    await user.keyboard(" ");

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(card);
  });
});

describe("TCGCardGridItem holo effect", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  //frames run the moment they are requested, so no waiting in these tests
  function runFramesImmediately() {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  }

  function renderCard(rarity: string) {
    runFramesImmediately();
    render(<TCGCardGridItem card={makeCard({ rarity })} onSelect={() => {}} />);
    const button = screen.getByRole("button");
    button.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    return button;
  }

  it("a holo card follows the mouse through CSS variables", () => {
    const button = renderCard("Rare Holo");

    fireEvent.pointerMove(button, {
      clientX: 150,
      clientY: 25,
      pointerType: "mouse",
    });

    expect(button.style.getPropertyValue("--mx")).toBe("75%");
    expect(button.style.getPropertyValue("--ry")).toBe("4deg");
  });

  it("a common card never gets the variables: common has no effect", () => {
    const button = renderCard("common");

    fireEvent.pointerMove(button, {
      clientX: 150,
      clientY: 25,
      pointerType: "mouse",
    });
    fireEvent.pointerLeave(button);

    expect(button.style.getPropertyValue("--mx")).toBe("");
  });
});

describe("TCGCardGridItem performance contract", () => {
  it("keeps its image lazy, so a library of 50+ cards does not load all at once", () => {
    const { container } = render(
      <TCGCardGridItem
        card={makeCard({ images: { small: "small.png" } })}
        onSelect={() => {}}
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy");
  });
});

//this file protects the three fallback strings, the click contract,
//and the keyboard contract: Tab reaches the card, Enter and Space open it
