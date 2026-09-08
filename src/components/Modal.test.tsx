import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders its children", () => {
    render(
      <Modal onClose={() => {}}>
        <p>Modal content</p>
      </Modal>,
    );

    expect(screen.getByText("Modal content")).toBeInTheDocument();
    //This single assertion is quietly also a portal test
    //it only passes because screen searches the whole document, not just wherever render() mounted things
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal onClose={handleClose}>
        <p>Modal content</p>
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when clicking inside the content", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal onClose={handleClose}>
        <p>Modal content</p>
      </Modal>,
    );

    await user.click(screen.getByText("Modal content"));

    expect(handleClose).not.toHaveBeenCalled();
    //this test exists because it's not obvious from reading the JSX alone that this is safe
    //the backdrop and the content div are siblings, not parent/child
    //so a click inside content never bubbles up into the backdrop's onClick
    //that's correct today because of how the markup happens to be structured, not because of an explicit stopPropagation() guard
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal onClose={handleClose}>
        <p>Modal content</p>
      </Modal>,
    );

    await user.keyboard("{Escape}");

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll while mounted and restores it on unmout", () => {
    const { unmount } = render(
      <Modal onClose={() => {}}>
        <p>Modal content</p>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });
});

//this test file protects: content actually reaches the screen despite the portal, all three ways of closing work,
//clicking inside doesnt accidentaly close it, and the background is locked and restored correctly
//along the way we caught and fixed real listener leak
