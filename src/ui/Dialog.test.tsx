import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";

function Harness({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <Dialog
          aria-label="Test dialog"
          onClose={() => {
            setOpen(false);
            onClose();
          }}
        >
          <button>First</button>
          <button>Second</button>
        </Dialog>
      )}
    </div>
  );
}

describe("Dialog", () => {
  it("has the correct role and accessible name", () => {
    render(
      <Dialog aria-label="Test dialog" onClose={vi.fn()}>
        <button>OK</button>
      </Dialog>,
    );
    expect(
      screen.getByRole("dialog", { name: "Test dialog" }),
    ).toBeInTheDocument();
  });

  it("moves focus inside on open", () => {
    render(
      <Dialog aria-label="Test dialog" onClose={vi.fn()}>
        <button>First</button>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("traps Tab within the dialog, wrapping at both ends", async () => {
    render(
      <Dialog aria-label="Test dialog" onClose={vi.fn()}>
        <button>First</button>
        <button>Second</button>
      </Dialog>,
    );
    const close = screen.getByRole("button", { name: "Close" });
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });

    expect(close).toHaveFocus();
    await userEvent.tab();
    expect(first).toHaveFocus();
    await userEvent.tab();
    expect(second).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus(); //wraped past the end back to the start

    await userEvent.tab({ shift: true });
    expect(second).toHaveFocus(); //wrapped past the start back to the end
  });

  it("returns focus to whatever opened it, on close", async () => {
    const handleClose = vi.fn();
    render(<Harness onClose={handleClose} />);

    const openButton = screen.getByRole("button", { name: "Open" });
    await userEvent.click(openButton);
    expect(screen.getByRole("button", { name: "First" })).not.toBeNull();

    await userEvent.keyboard("{Escape}");
    expect(openButton).toHaveFocus();
  });

  //B&W-7: the card dialog is the same dialog on a black stage (spec 7.4);
  //CSS reads the variant, the behavior is untouched
  it("is the white sheet by default, and can be the black card stage", () => {
    const { rerender } = render(
      <Dialog aria-label="Plain" onClose={() => {}}>
        <p>Body</p>
      </Dialog>,
    );
    expect(document.querySelector(".dialog")).toHaveAttribute(
      "data-variant",
      "sheet",
    );

    rerender(
      <Dialog aria-label="Plain" onClose={() => {}} variant="stage">
        <p>Body</p>
      </Dialog>,
    );
    expect(document.querySelector(".dialog")).toHaveAttribute(
      "data-variant",
      "stage",
    );
  });
});
