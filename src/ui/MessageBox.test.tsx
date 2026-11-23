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
        animations: "off",
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

  //the blinking triangle in the corner of a battle dialog: "done talking,
  //your move". it must not show while the line is still typing
  it("shows the continue caret only once the text has finished typing", () => {
    const { container } = renderBox("Hi");
    expect(container.querySelector(".message-box__caret")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(TYPEWRITER_TICK_MS * 2);
    });
    const caret = container.querySelector(".message-box__caret");
    expect(caret).toBeInTheDocument();
    expect(caret).toHaveAttribute("aria-hidden", "true");
  });

  it("never shows the caret on an error", () => {
    const { container } = renderBox("Pokémon not found", "error");
    expect(container.querySelector(".message-box__caret")).toBeNull();
  });

  //B&W-5, Home's battle dialog (spec 6.1): each line types out on the
  //encounter's clock, in CSS. the text itself is all there from the start
  describe("typing line by line", () => {
    const TEXT = "A wild ZOROARK appeared!\nWhat will you do?";

    function renderLines(text = TEXT) {
      return render(
        <PreferencesProvider>
          <MessageBox text={text} typing="lines" />
        </PreferencesProvider>,
      );
    }

    it("puts every line in the page at once, each with its length for the CSS", () => {
      const { container } = renderLines();

      const lines =
        container.querySelectorAll<HTMLElement>(".message-box__line");
      expect(lines).toHaveLength(2);
      expect(lines[0]).toHaveTextContent("A wild ZOROARK appeared!");
      expect(lines[0].style.getPropertyValue("--chars")).toBe("24");
      expect(lines[1].style.getPropertyValue("--chars")).toBe("17");
      expect(typedText(container)).toBe(
        "A wild ZOROARK appeared!What will you do?",
      );
    });

    it("shows the caret from the start, since no script is typing", () => {
      const { container } = renderLines();

      expect(
        container.querySelector(".message-box__caret"),
      ).toBeInTheDocument();
    });

    //a live region announces CHANGES to its text. replacing the region
    //itself with a new one that already holds the text is often not read
    //at all, so a new Pokémon must change the text inside the same region
    it("keeps the same live region when the text changes, so it is announced", () => {
      const view = renderLines();
      const status = screen.getByRole("status");

      view.rerender(
        <PreferencesProvider>
          <MessageBox
            text={"A wild PIKACHU appeared!\nWhat will you do?"}
            typing="lines"
          />
        </PreferencesProvider>,
      );

      expect(screen.getByRole("status")).toBe(status);
      expect(status).toHaveTextContent("A wild PIKACHU appeared!");
    });

    it("draws fresh lines for new text, so the typing plays again", () => {
      const view = renderLines();
      const before = view.container.querySelector(".message-box__line");

      view.rerender(
        <PreferencesProvider>
          <MessageBox
            text={"A wild PIKACHU appeared!\nWhat will you do?"}
            typing="lines"
          />
        </PreferencesProvider>,
      );

      expect(view.container.querySelector(".message-box__line")).not.toBe(
        before,
      );
    });
  });
});
