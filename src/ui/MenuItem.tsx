import { type ReactNode } from "react";
import { useMenuContext } from "../hooks/useMenuContext";
import "./MenuItem.css";

interface MenuItemProps {
  index: number;
  onSelect: () => void;
  children: ReactNode;
}

export function MenuItem({ index, onSelect, children }: MenuItemProps) {
  const { activeIndex, setActive, focusItem, setItemRef } = useMenuContext();
  const isActive = index === activeIndex;

  return (
    <button
      ref={(el) => setItemRef(index, el)}
      type="button"
      role="menuitem"
      tabIndex={isActive ? 0 : -1}
      className="menu-item"
      onFocus={() => setActive(index)}
      onClick={() => {
        focusItem(index);
        onSelect();
      }}
    >
      {children}
    </button>
  );
}
