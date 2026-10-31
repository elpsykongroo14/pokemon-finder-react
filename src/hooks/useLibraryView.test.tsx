import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLibraryView } from "./useLibraryView";
import { MemoryRouter, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

function wrapperAt(path: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;
  };
}

function useViewAndLocation() {
  return { ...useLibraryView(), location: useLocation() };
}

describe("useLibraryView", () => {
  it("readss the view from the URL", () => {
    const { result } = renderHook(() => useLibraryView(), {
      wrapper: wrapperAt("/library?view=binder"),
    });
    expect(result.current.view).toBe("binder");
  });

  it("defaults to grid, and treats a junk value as grid", () => {
    const plain = renderHook(() => useLibraryView(), {
      wrapper: wrapperAt("/library"),
    });
    const junk = renderHook(() => useLibraryView(), {
      wrapper: wrapperAt("/library?view=banana"),
    });
    expect(plain.result.current.view).toBe("grid");
    expect(junk.result.current.view).toBe("grid");
  });

  it("setView changes the URL, and the view follows it", () => {
    const { result } = renderHook(() => useViewAndLocation(), {
      wrapper: wrapperAt("/library"),
    });

    act(() => result.current.setView("table"));

    expect(result.current.location.search).toBe("?view=table");
    expect(result.current.view).toBe("table");
  });

  it("setView back to grid removes the param and keeps other params", () => {
    const { result } = renderHook(() => useViewAndLocation(), {
      wrapper: wrapperAt("/library?view=table&sort=rarity"),
    });

    act(() => result.current.setView("grid"));

    expect(result.current.location.search).toBe("?sort=rarity");
  });
});
