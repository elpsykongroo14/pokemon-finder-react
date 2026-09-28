import {
  useRef,
  useState,
  useCallback,
  Children,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { Cursor } from "./Cursor";
import { MenuContext } from "../hooks/useMenuContext";
import "./Menu.css";

const ITEM_HEIGHT = 40; //px, kept in sync by hand with --menu-item-height in MenuItem.css

interface MenuProps {
  children: ReactNode;
  "aria-label": string;
}

export function Menu({ children, ...rest }: MenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const itemCount = Children.count(children);

  const setItemRef = useCallback(
    (index: number, el: HTMLButtonElement | null) => {
      itemRefs.current[index] = el;
    },
    [],
  );

  const setActive = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const focusItem = useCallback((index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.focus();
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusItem((activeIndex + 1) % itemCount);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusItem((activeIndex - 1 + itemCount) % itemCount);
        break;
      case "Home":
        e.preventDefault();
        focusItem(0);
        break;
      case "End":
        e.preventDefault();
        focusItem(itemCount - 1);
        break;
    }
  }

  return (
    <MenuContext.Provider
      value={{ activeIndex, setActive, focusItem, setItemRef }}
    >
      <div {...rest} role="menu" className="menu" onKeyDown={handleKeyDown}>
        <Cursor offset={activeIndex * ITEM_HEIGHT} />
        {children}
      </div>
    </MenuContext.Provider>
  );
}
