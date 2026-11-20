import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useHoloPointer } from "./useHoloPointer";

//a small stand-in component: the hook attached to a plain div
function Harness({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const handlers = useHoloPointer(ref, enabled);
  return <div data-testid="card" ref={ref} {...handlers} />;
}

//requestAnimationFrame replaced by a queue we flush by hand, so a test
//decides exactly when "the next frame" happens
let queue: (FrameRequestCallback | null)[] = [];
let requestFrame: ReturnType<typeof vi.fn>;
let cancelFrame: ReturnType<typeof vi.fn>;

function flushFrame() {
  const callbacks = queue;
  queue = [];
  for (const callback of callbacks) callback?.(0);
}

//a 200 x 100 card at the top-left corner of the page
function renderCard(enabled = true) {
  const view = render(<Harness enabled={enabled} />);
  const card = screen.getByTestId("card");
  card.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
  return { ...view, card };
}

function move(card: HTMLElement, x: number, y: number, pointerType = "mouse") {
  fireEvent.pointerMove(card, { clientX: x, clientY: y, pointerType });
}

describe("useHoloPointer", () => {
  beforeEach(() => {
    queue = [];
    requestFrame = vi.fn((callback: FrameRequestCallback) => {
      queue.push(callback);
      return queue.length;
    });
    cancelFrame = vi.fn((id: number) => {
      queue[id - 1] = null;
    });
    vi.stubGlobal("requestAnimationFrame", requestFrame);
    vi.stubGlobal("cancelAnimationFrame", cancelFrame);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.motion;
  });

  it("writes the pose as CSS variables on the NEXT frame, not immediately", () => {
    const { card } = renderCard();

    move(card, 150, 25);
    expect(card.style.getPropertyValue("--mx")).toBe("");

    flushFrame();
    expect(card.style.getPropertyValue("--mx")).toBe("75%");
    expect(card.style.getPropertyValue("--my")).toBe("25%");
    expect(card.style.getPropertyValue("--ry")).toBe("4deg");
    expect(card.style.getPropertyValue("--rx")).toBe("4deg");
  });

  it("many moves within one frame cost one frame, and the LAST position wins", () => {
    const { card } = renderCard();

    move(card, 10, 10);
    move(card, 20, 20);
    move(card, 100, 50);

    expect(requestFrame).toHaveBeenCalledTimes(1);
    flushFrame();
    expect(card.style.getPropertyValue("--mx")).toBe("50%");
    expect(card.style.getPropertyValue("--my")).toBe("50%");
  });

  it("schedules a new frame for moves after the previous frame has run", () => {
    const { card } = renderCard();

    move(card, 100, 50);
    flushFrame();
    move(card, 200, 100);
    flushFrame();

    expect(requestFrame).toHaveBeenCalledTimes(2);
    expect(card.style.getPropertyValue("--mx")).toBe("100%");
  });

  it("leaving the card clears the variables and cancels a pending frame", () => {
    const { card } = renderCard();

    move(card, 150, 25);
    flushFrame();
    move(card, 20, 20);
    fireEvent.pointerLeave(card);

    expect(cancelFrame).toHaveBeenCalledTimes(1);
    flushFrame();
    expect(card.style.getPropertyValue("--mx")).toBe("");
    expect(card.style.getPropertyValue("--rx")).toBe("");
  });

  it("ignores touch pointers", () => {
    const { card } = renderCard();

    move(card, 150, 25, "touch");

    expect(requestFrame).not.toHaveBeenCalled();
    expect(card.style.getPropertyValue("--mx")).toBe("");
  });

  it("does nothing while disabled", () => {
    const { card } = renderCard(false);

    move(card, 150, 25);

    expect(requestFrame).not.toHaveBeenCalled();
    expect(card.style.getPropertyValue("--mx")).toBe("");
  });

  it("writes nothing when the app's animations are off", () => {
    document.documentElement.dataset.motion = "reduced";
    const { card } = renderCard();

    move(card, 150, 25);
    flushFrame();

    expect(card.style.getPropertyValue("--mx")).toBe("");
  });

  it("puts the card back at rest if the effect is switched off while it is shown", () => {
    const { card, rerender } = renderCard();
    move(card, 150, 25);
    flushFrame();
    expect(card.style.getPropertyValue("--mx")).toBe("75%");

    rerender(<Harness enabled={false} />);

    expect(card.style.getPropertyValue("--mx")).toBe("");
  });

  it("cancels a pending frame when the component goes away", () => {
    const { card, unmount } = renderCard();

    move(card, 150, 25);
    unmount();

    expect(cancelFrame).toHaveBeenCalledTimes(1);
  });
});
