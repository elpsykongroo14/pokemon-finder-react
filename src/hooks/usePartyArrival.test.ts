import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePartyArrival } from "./usePartyArrival";

const team = (...names: string[]) => names.map((name) => ({ name }));

describe("usePartyArrival", () => {
  //the party is already full of members when the page loads: none of them
  //"arrived", so nothing may pop on load (D42: no self-starting motion)
  it("reports no arrival for the party the page started with", () => {
    const { result } = renderHook(({ t }) => usePartyArrival(t), {
      initialProps: { t: team("pikachu", "eevee") },
    });
    expect(result.current).toBeNull();
  });

  it("names the member who just joined", () => {
    const { result, rerender } = renderHook(({ t }) => usePartyArrival(t), {
      initialProps: { t: team("pikachu") },
    });
    rerender({ t: team("pikachu", "eevee") });
    expect(result.current).toBe("eevee");
  });

  it("forgets the arrival when someone leaves", () => {
    const { result, rerender } = renderHook(({ t }) => usePartyArrival(t), {
      initialProps: { t: team("pikachu") },
    });
    rerender({ t: team("pikachu", "eevee") });
    rerender({ t: team("pikachu") });
    expect(result.current).toBeNull();
  });

  //re-renders that do not change the party (a backfill adding types, a
  //theme change) must not count as someone joining again
  it("keeps the same answer while the party size stays the same", () => {
    const { result, rerender } = renderHook(({ t }) => usePartyArrival(t), {
      initialProps: { t: team("pikachu") },
    });
    rerender({ t: team("pikachu", "eevee") });
    rerender({ t: team("pikachu", "eevee") });
    expect(result.current).toBe("eevee");
  });
});
