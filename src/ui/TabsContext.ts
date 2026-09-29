import { createContext, useContext } from "react";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs parts must be rendered inside <Tabs>");
  }
  return ctx;
}
