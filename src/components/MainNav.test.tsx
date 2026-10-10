import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
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

function PathProbe() {
  return <p data-testid="path">{useLocation().pathname}</p>;
}

function renderNavWithProbe() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <MainNav />
      <PathProbe />
    </MemoryRouter>,
  );
}

describe("MainNav route transitions", () => {
  afterEach(() => {
    Reflect.deleteProperty(document, "startViewTransition");
  });

  function installFakeViewTransitions() {
    const fake = vi.fn((update: () => void) => {
      update();
      return {};
    });
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: fake,
    });
    return fake;
  }

  it("runs a plain click through a view transition and still navigates", async () => {
    const startViewTransition = installFakeViewTransitions();
    const user = userEvent.setup();
    renderNavWithProbe();

    await user.click(screen.getByRole("link", { name: "Compare" }));

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("path")).toHaveTextContent("/compare");
  });

  it("leaves modified clicks to the browser (no transition, no in-app navigation)", async () => {
    const startViewTransition = installFakeViewTransitions();
    const user = userEvent.setup();
    renderNavWithProbe();

    await user.keyboard("{Control>}");
    await user.click(screen.getByRole("link", { name: "Team" }));
    await user.keyboard("{/Control}");

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(screen.getByTestId("path")).toHaveTextContent("/");
  });

  it("points Library at an absolute path", () => {
    renderNav("/");

    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute(
      "href",
      "/library",
    );
  });
});
