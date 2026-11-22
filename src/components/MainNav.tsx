import "./MainNav.css";
import { NavLink } from "react-router-dom";
import { Icon, type IconName } from "./Icon";
import { useViewTransitionNavigate } from "../hooks/useViewTransitionNavigate";
import { isPlainLeftClick } from "../lib/clicks";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

//one list drives the links, so adding a fifth destination is one line
const NAV_ITEMS: NavItem[] = [
  //without end, NavLink to="/" would report active on every route, because
  //pokemon/pikachu technically starts with "/". end means 'exact match only"
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/compare", label: "Compare", icon: "compare" },
  { to: "/team", label: "Team", icon: "team" },
  { to: "/library", label: "Library", icon: "library" },
];

//D46: the current page sits on a slanted Ink plate drawn by CSS from
//.active, which NavLink sets together with aria-current, so the look and
//what a screen reader hears come from one fact. the ▶ cursor (and the
//matchPath bookkeeping that positioned it) is gone.
//on phones (<= 1000px) CSS moves this same <nav> to a bottom bar and shows
//the icons: one "Main" landmark, never two
export function MainNav() {
  const goTo = useViewTransitionNavigate();

  return (
    <nav className="main-nav" aria-label="Main">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => (isActive ? "active" : undefined)}
          onClick={(event) => {
            if (!isPlainLeftClick(event)) return;
            //we take over plain clicks so the page change can be animated.
            //the href stays on the link, so ctrl-click, new tabs and screen
            //readers all still work
            event.preventDefault();
            goTo(item.to);
          }}
        >
          <span className="main-nav__icon" aria-hidden="true">
            <Icon name={item.icon} />
          </span>
          <span className="main-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
