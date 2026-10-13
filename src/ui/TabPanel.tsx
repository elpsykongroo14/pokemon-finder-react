import { type ReactNode } from "react";
import { useTabsContext } from "./TabsContext";

interface TabPanelProps {
  value: string;
  children: ReactNode;
  //true (default): content stays in the DOM while hidden, so its state and
  //fetched data survive tab switches. false: content only exists while the
  //tab is selected, so it mounts (and replays any entrance animation) each time.
  keepMounted?: boolean;
}

export function TabPanel({
  value,
  children,
  keepMounted = true,
}: TabPanelProps) {
  const { value: selectedValue, baseId } = useTabsContext();
  const isSelected = value === selectedValue;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!isSelected}
      tabIndex={0}
      className="tab-panel"
    >
      {(isSelected || keepMounted) && children}
    </div>
  );
}
