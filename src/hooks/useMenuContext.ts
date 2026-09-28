import { createContext, useContext } from "react";

export interface MenuContextValue {
  activeIndex: number;
  setActive: (index: number) => void; //sync active state, no focus()call
  focusItem: (index: number) => void; //sync active state AND move real focus
  setItemRef: (index: number, el: HTMLButtonElement | null) => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("MenuItem must be rendered inside a Menu");
  }
  return ctx;
}
