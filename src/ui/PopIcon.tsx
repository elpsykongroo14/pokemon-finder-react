import "./PopIcon.css";
import type { ReactNode } from "react";

interface PopIconProps {
  //a counter, not a boolean: it goes up by one each time the moment happens
  //(a heart added, a pokemon joining the team). 0 means "not yet"
  popKey: number;
  children: ReactNode;
}

//the icon inside a button, which pops each time popKey changes.
//key={popKey}: a new key makes React replace the span with a fresh one, and a
//freshly inserted element plays its CSS animation from the start. that is how
//one CSS rule can be replayed on demand, as many times as needed
export function PopIcon({ popKey, children }: PopIconProps) {
  return (
    <span
      key={popKey}
      className="pop-icon"
      //no pop on the very first render: a pokemon that is already a favorite
      //when the page opens did not just become one
      data-pop={popKey > 0 ? "" : undefined}
    >
      {children}
    </span>
  );
}
