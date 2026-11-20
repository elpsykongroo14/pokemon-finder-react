import { useId, useState, type ReactNode } from "react";
import { TabsContext } from "./TabsContext";
import "./Tabs.css";

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  const baseId = useId();

  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}
