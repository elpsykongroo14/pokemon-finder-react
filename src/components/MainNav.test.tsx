import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { MainNav } from "./MainNav";

function renderNav(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MainNav />
    </MemoryRouter>,
  );
}

const cursorOffset = () =>
  screen.getByText("▶").style.getPropertyValue("--cursor-offset");

describe("MainNav", () => {
  it("renders the four destinations as links", () => {
    renderNav("/");

    for (const name of ["Home", "Compare", "Team", "Library"]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });

  it("announces the current page with aria-current", () => {
    renderNav("/compare");

    expect(screen.getByRole("link", { name: "Compare" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it.each([
    ["/", "0%"],
    ["/compare", "100%"],
    ["/team", "200%"],
    ["/library", "300%"],
    ["/library/pikachu", "300%"],
  ])("puts the active item at %s (%s)", (path, offset) => {
    renderNav(path);

    expect(cursorOffset()).toBe(offset);
  });

  it("slides to the new item when the route changes", async () => {
    const user = userEvent.setup();
    renderNav("/");
    expect(cursorOffset()).toBe("0%");

    await user.click(screen.getByRole("link", { name: "Team" }));

    expect(cursorOffset()).toBe("200%");
  });

  it("shows no cursor on pages that are not a nav destination", () => {
    renderNav("/pokemon/pikachu");

    expect(screen.queryByText("▶")).not.toBeInTheDocument();
  });

  it("keeps the cursor out of the links' accessible names", () => {
    renderNav("/");

    expect(screen.getByText("▶")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});
