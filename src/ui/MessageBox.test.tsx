import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "../context/PreferencesContext";
import { TYPEWRITER_TICK_MS } from "../hooks/useTypewriter";
import { MessageBox, type MessageBoxVariant } from "./MessageBox";

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

function renderBox(text: string, variant?: MessageBoxVariant) {
  return render(
    <PreferencesProvider>
      <MessageBox text={text} variant={variant} />
    </PreferencesProvider>,
  );
}

function typedText(container: HTMLElement) {
  return container.querySelector(".message-box__typed")?.textContent;
}

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
  Reflect.deleteProperty(window, "matchMedia");
});

describe("MessageBox", () => {
  it("gives screen readers the full text immediately", () => {
    renderBox("A wild PIKACHU appeared!");
    expect(screen.getByRole("status")).toHaveTextContent(
      "A wild PIKACHU appeared!",
    );
  });

  it("types the visible copy progressively", () => {
    const { container } = renderBox("A wild PIKACHU appeared!");
    expect(typedText(container)).toBe("");

    act(() => {
      vi.advanceTimersByTime(TYPEWRITER_TICK_MS * 3);
    });
    expect(typedText(container)).toBe("A w");
  });

  it("uses role=alert and shows errors instantly", () => {
    const { container } = renderBox("Pokémon not found", "error");
    expect(screen.getByRole("alert")).toHaveTextContent("Pokémon not found");
    expect(typedText(container)).toBe("Pokémon not found");
  });

  it("renders extra controls under the text without announcing them", () => {
    render(
      <PreferencesProvider>
        <MessageBox text="Couldn't reach it." variant="error">
          <button type="button">Retry</button>
        </MessageBox>
      </PreferencesProvider>,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't reach it.");
    expect(screen.getByRole("alert")).not.toHaveTextContent("Retry");
  });

  it("shows text instantly when animations are turned off", () => {
    localStorage.setItem(
      "pokemon_preferences",
      JSON.stringify({
        animationsEnabled: false,
        soundEnabled: true,
        spriteMode: "pixel",
      }),
    );
    const { container } = renderBox("Loading…");
    expect(typedText(container)).toBe("Loading…");
  });

  it("shows text instantly when the OS asks for reduced motion", () => {
    mockReducedMotion(true);
    const { container } = renderBox("Loading…");
    expect(typedText(container)).toBe("Loading…");
  });
});
