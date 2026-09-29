import { type ReactNode } from "react";
import { useTabsContext } from "./TabsContext";

interface TabPanelProps {
  value: string;
  children: ReactNode;
}

export function TabPanel({ value, children }: TabPanelProps) {
  const { value: selectedValue, baseId } = useTabsContext();

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={value !== selectedValue}
      tabIndex={0}
      className="tab-panel"
    >
      {children}
    </div>
  );
}
