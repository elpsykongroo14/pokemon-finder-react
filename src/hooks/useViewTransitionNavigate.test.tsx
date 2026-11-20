import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useViewTransitionNavigate } from "./useViewTransitionNavigate";

function renderNavigate() {
  return renderHook(
    () => ({ go: useViewTransitionNavigate(), location: useLocation() }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
      ),
    },
  );
}

//jsdom has no view transitions API, so test that need it install a fake
//that does what the real one does first: run the update callback
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
  Reflect.deleteProperty(document, "startViewTransition");
  document.documentElement.removeAttribute("data-motion");
  vi.unstubAllGlobals();
});

describe("useViewTransitionNavigate", () => {
  it("just navigates when the browser has no View Transitions API", () => {
    const { result } = renderNavigate();

    act(() => result.current.go("/compare"));

    expect(result.current.location.pathname).toBe("/compare");
  });

  it("wraps the navigation in a view transition when the API exists", () => {
    const startViewTransition = installFakeViewTransitions();
    const { result } = renderNavigate();

    act(() => result.current.go("/compare"));

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(result.current.location.pathname).toBe("/compare");
  });

  it("skips the transition when the app's animation setting is off", () => {
    const startViewTransition = installFakeViewTransitions();
    document.documentElement.dataset.motion = "reduced";
    const { result } = renderNavigate();

    act(() => result.current.go("/compare"));

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(result.current.location.pathname).toBe("/compare");
  });

  it("follows the OS reduced-motion setting when the app has no setting yet", () => {
    const startViewTransition = installFakeViewTransitions();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { result } = renderNavigate();

    act(() => result.current.go("/compare"));

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(result.current.location.pathname).toBe("/compare");
  });

  it("lets an explicit 'on' setting win over the OS preference", () => {
    const startViewTransition = installFakeViewTransitions();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    document.documentElement.dataset.motion = "on";
    const { result } = renderNavigate();

    act(() => result.current.go("/compare"));

    expect(startViewTransition).toHaveBeenCalledTimes(1);
  });
});
