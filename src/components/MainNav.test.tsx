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

//the current page is drawn as a slanted Ink plate by CSS on .active
//(D46), so the contract the tests hold is: exactly one link is current,
//and the class and aria-current always agree
function currentLinks() {
  return screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "page");
}

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
    ["/", "Home"],
    ["/compare", "Compare"],
    ["/team", "Team"],
    ["/library", "Library"],
    ["/library/pikachu", "Library"],
  ])("on %s, marks %s and only %s as current", (path, name) => {
    renderNav(path);

    expect(currentLinks()).toEqual([screen.getByRole("link", { name })]);
    expect(screen.getByRole("link", { name })).toHaveClass("active");
  });

  it("moves the current mark when the route changes", async () => {
    const user = userEvent.setup();
    renderNav("/");

    await user.click(screen.getByRole("link", { name: "Team" }));

    expect(currentLinks()).toEqual([
      screen.getByRole("link", { name: "Team" }),
    ]);
  });

  it("marks nothing current on a page that is not a nav destination", () => {
    renderNav("/pokemon/pikachu");

    expect(currentLinks()).toEqual([]);
  });

  //phones show the icons (the bottom bar), desktop hides them; either way
  //an icon is decoration and must not change what a link is called
  it("draws an icon for every link, kept out of the links' names", () => {
    const { container } = renderNav("/");

    const icons = container.querySelectorAll(".main-nav__icon");
    expect(icons).toHaveLength(4);
    icons.forEach((icon) =>
      expect(icon).toHaveAttribute("aria-hidden", "true"),
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  it("no longer draws the old ▶ cursor", () => {
    renderNav("/");

    expect(screen.queryByText("▶")).not.toBeInTheDocument();
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
