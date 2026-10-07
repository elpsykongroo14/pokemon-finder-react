import "./MainNav.css";
import { NavLink, matchPath, useLocation } from "react-router-dom";
import type { CSSProperties } from "react";
import { Cursor } from "../ui/Cursor";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

//one list drives the links, the cell count cursor position
//so adding a fifth destination is a one line change
const NAV_ITEMS: NavItem[] = [
  //without end, NavLink to="/" would report active on every route, because
  //pokemon/pikachu technically starts with "/". end means 'exact match only"
  { to: "/", label: "Home", end: true },
  { to: "/compare", label: "Compare" },
  { to: "/team", label: "Team" },
  { to: "library", label: "Library" },
];

export function MainNav() {
  const { pathname } = useLocation();

  //derived every render from the URL, nothing to keep in sync:
  //same idea as ComparePage's isSelfCompare.
  //macthpath applies the same rule NavLink uses, so the cursor and aria-current always agree.
  //-1 means "no nav is active", eg on /pokemon/pikachu
  const activeIndex = NAV_ITEMS.findIndex((item) =>
    matchPath({ path: item.to, end: item.end ?? false }, pathname),
  );

  return (
    <nav
      className="main-nav"
      aria-label="Main"
      style={{ "--nav-count": NAV_ITEMS.length } as CSSProperties}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => (isActive ? "active" : undefined)}
        >
          {item.label}
        </NavLink>
      ))}
      {activeIndex >= 0 && <Cursor axis="x" offset={`${activeIndex * 100}%`} />}
    </nav>
  );
}
