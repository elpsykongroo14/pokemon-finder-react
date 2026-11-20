import "./BattleMenu.css";
import { useRef, useState, type KeyboardEvent } from "react";
import { TransitionLink } from "./TransitionLink";
import { Button } from "../ui/Button";
import { moveInGrid } from "../lib/gridNav";
import { SEARCH_INPUT_ID } from "../lib/ids";

const COLUMNS = 2;

//one list drives what is drawn and how many cells the keyboard logic knows about
//"link" items go to another page, the "search" item is an action: it moves
//focus to the search box in the header
type MenuItem =
  | { kind: "search"; label: string }
  | { kind: "link"; label: string; to: string };

const ITEMS: MenuItem[] = [
  { kind: "search", label: "Search" },
  { kind: "link", label: "Compare", to: "/compare" },
  { kind: "link", label: "Team", to: "/team" },
  { kind: "link", label: "Library", to: "/library" },
];

//the 2x2 "what will you do?" hub. keyboard model is a roving tabindex:
//only one item is in the Tab order at at time, so Tab enters the menu once
//and the next Tab leaves it. the arrow keys then move between the items
export function BattleMenu() {
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  function focusItem(index: number) {
    const items =
      listRef.current?.querySelectorAll<HTMLElement>("[data-battle-item]");
    items?.[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    //alt+left is the browser's Back, ctrl/cmd+arrows belong to the OS. leave them alone
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const next = moveInGrid(active, event.key, COLUMNS, ITEMS.length);
    if (next === null) return;

    event.preventDefault();
    focusItem(next);
  }

  function focusSearch() {
    document.getElementById(SEARCH_INPUT_ID)?.focus();
  }

  return (
    <nav aria-label="Quick menu">
      <ul className="battle-menu" ref={listRef} onKeyDown={handleKeyDown}>
        {ITEMS.map((item, index) => {
          //onFocus keeps `active` in step with where focus really is, whether
          //it got there by arrow key, by Tab, or by a mouse click
          const shared = {
            "data-battle-item": "",
            tabIndex: index === active ? 0 : -1,
            onFocus: () => setActive(index),
          };
          const content = (
            <>
              <span className="battle-menu__cursor" aria-hidden="true">
                ▶
              </span>
              {item.label}
            </>
          );

          return (
            <li key={item.label}>
              {item.kind === "link" ? (
                <TransitionLink to={item.to} variant="secondary" {...shared}>
                  {content}
                </TransitionLink>
              ) : (
                <Button variant="secondary" onClick={focusSearch} {...shared}>
                  {content}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
