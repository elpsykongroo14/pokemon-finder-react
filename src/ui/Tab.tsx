import { type ReactNode } from "react";
import { useTabsContext } from "./TabsContext";

interface TabProps {
  value: string;
  children: ReactNode;
}

export function Tab({ value, children }: TabProps) {
  const { value: selectedValue, setValue, baseId } = useTabsContext();
  const isSelected = value === selectedValue;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isSelected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isSelected ? 0 : -1}
      className="tab"
      onFocus={() => setValue(value)}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
}
