import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "../context/PreferencesContext";
import { COUNT_UP_DURATION_MS } from "../hooks/useCountUp";
import { StatMeter } from "./StatMeter";

function renderMeter(props: Partial<Parameters<typeof StatMeter>[0]> = {}) {
  return render(
    <PreferencesProvider>
      <StatMeter label="HP" value={78} max={255} {...props} />
    </PreferencesProvider>,
  );
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("StatMeter", () => {
  it("exposes the value, min and max to assistive tech", () => {
    renderMeter();
    const meter = screen.getByRole("meter", { name: "HP" });
    expect(meter).toHaveAttribute("aria-valuenow", "78");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "255");
  });

  it("counts up to the final value", () => {
    renderMeter();
    act(() => {
      vi.advanceTimersByTime(COUNT_UP_DURATION_MS);
    });
    expect(screen.getByText("78")).toBeInTheDocument();
  });

  it("colors by percentage when tiered", () => {
    const { container } = renderMeter({
      value: 10,
      max: 100,
      variant: "tiered",
    });
    expect(container.querySelector(".stat-meter")).toHaveAttribute(
      "data-tier",
      "low",
    );
  });

  it("does not tier a default or highest bar", () => {
    const { container } = renderMeter({ variant: "highest" });
    expect(container.querySelector(".stat-meter")).not.toHaveAttribute(
      "data-tier",
    );
  });
});
