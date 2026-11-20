import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { TransitionLink } from "./TransitionLink";

function Probe() {
  const { pathname, search } = useLocation();
  return <p data-testid="where">{pathname + search}</p>;
}

function renderLink() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <TransitionLink to="/compare?a=pikachu" variant="secondary">
        Compare
      </TransitionLink>
      <Probe />
    </MemoryRouter>,
  );
}

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

afterEach(() => {
  Reflect.deleteProperty(document, "startViewTransitions");
});

describe("TransitionLink", () => {
  it("is a real link with the destination as its href", () => {
    renderLink();

    expect(screen.getByRole("link", { name: "Compare" })).toHaveAttribute(
      "href",
      "/compare?a=pikachu",
    );
  });

  it("runs a plain click through a view transition and navigates once", async () => {
    const startViewTransition = installFakeViewTransitions();
    const user = userEvent.setup();
    renderLink();

    await user.click(screen.getByRole("link", { name: "Compare" }));

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("where")).toHaveTextContent("/compare?a=pikachu");
  });

  it("still navigates when the browser has no View Transitions API", async () => {
    const user = userEvent.setup();
    renderLink();

    await user.click(screen.getByRole("link", { name: "Compare" }));

    expect(screen.getByTestId("where")).toHaveTextContent("/compare?a=pikachu");
  });

  it("leaves a ctrl-click to the browser", async () => {
    const startViewTransition = installFakeViewTransitions();
    const user = userEvent.setup();
    renderLink();

    await user.keyboard("{Control>}");
    await user.click(screen.getByRole("link", { name: "Compare" }));
    await user.keyboard("{/Control}");

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(screen.getByTestId("where")).toHaveTextContent("/");
  });

  it("draws itself like a button when given a variant", () => {
    renderLink();

    const link = screen.getByRole("link", { name: "Compare" });
    expect(link).toHaveClass("btn");
    expect(link).toHaveAttribute("data-variant", "secondary");
  });
});
