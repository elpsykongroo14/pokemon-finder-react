import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useBinderPage } from "./useBinderPage";

function wrapperAt(path: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;
  };
}

function usePageAndRouter() {
  return {
    ...useBinderPage(),
    location: useLocation(),
    navigate: useNavigate(),
  };
}

describe("useBinderPage", () => {
  it("reads the page from the URL, defaulting to 1 for missing or junk values", () => {
    const named = renderHook(() => useBinderPage(), {
      wrapper: wrapperAt("/library?view=binder&page=3"),
    });
    const plain = renderHook(() => useBinderPage(), {
      wrapper: wrapperAt("/library"),
    });
    const junk = renderHook(() => useBinderPage(), {
      wrapper: wrapperAt("/library?page=banana"),
    });
    expect(named.result.current.page).toBe(3);
    expect(plain.result.current.page).toBe(1);
    expect(junk.result.current.page).toBe(1);
  });

  it("setPage changes the URL and keeps the other params", () => {
    const { result } = renderHook(() => usePageAndRouter(), {
      wrapper: wrapperAt("/library?view=binder"),
    });

    act(() => result.current.setPage(2));

    expect(result.current.location.search).toBe("?view=binder&page=2");
    expect(result.current.page).toBe(2);
  });

  it("setPage(1) removes the param", () => {
    const { result } = renderHook(() => usePageAndRouter(), {
      wrapper: wrapperAt("/library?view=binder&page=4"),
    });

    act(() => result.current.setPage(1));

    expect(result.current.location.search).toBe("?view=binder");
  });

  it("adds a history entry, so Back returns to the previous page", () => {
    const { result } = renderHook(() => usePageAndRouter(), {
      wrapper: wrapperAt("/library?view=binder"),
    });

    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);

    act(() => result.current.navigate(-1));
    expect(result.current.page).toBe(1);
  });
});
