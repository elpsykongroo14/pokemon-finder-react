import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeaderSearch } from "./HeaderSearch";
import { SEARCH_INPUT_ID } from "../lib/ids";

//the real SearchBar has its own tests; here only the disclosure around it
//matters, so a stand-in with the same input id and a submit is enough
vi.mock("./SearchBar", () => ({
  SearchBar: ({ onSubmit }: { onSubmit: (query: string) => void }) => (
    <>
      <input id={SEARCH_INPUT_ID} aria-label="Search Pokémon" />
      <button onClick={() => onSubmit("pikachu")}>fake-submit</button>
    </>
  ),
}));

const toggle = () => screen.getByRole("button", { name: "Search" });

describe("HeaderSearch", () => {
  //phones: the field hides behind an icon button (spec 8). the button says
  //whether the field is shown and which element it shows: a disclosure
  it("starts closed and points the toggle at the field it controls", () => {
    const { container } = render(<HeaderSearch onSubmit={vi.fn()} />);

    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    const field = container.querySelector(
      `#${toggle().getAttribute("aria-controls")}`,
    );
    expect(field).toContainElement(screen.getByRole("textbox"));
    expect(field).not.toHaveAttribute("data-open");
  });

  it("opens the field and puts the cursor in it", async () => {
    const user = userEvent.setup();
    render(<HeaderSearch onSubmit={vi.fn()} />);

    await user.click(toggle());

    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("closes again after a search, and still passes the query on", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<HeaderSearch onSubmit={onSubmit} />);

    await user.click(toggle());
    await user.click(screen.getByRole("button", { name: "fake-submit" }));

    expect(onSubmit).toHaveBeenCalledWith("pikachu");
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  //the toggle sits AFTER the field in the DOM. desktop hides the toggle, so
  //the Tab order there stays nav, then field (the Layout test holds that);
  //on phones opening moves focus into the field directly
  it("keeps the field first in reading order", () => {
    render(<HeaderSearch onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("textbox").compareDocumentPosition(toggle()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
