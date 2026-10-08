import "./StageConsole.css";
import type { ReactNode } from "react";

interface StageConsoleProps {
  //the "top screen": the hero of the page
  stage: ReactNode;
  //childran are the "bottom screen": menus, tabs, details
  children: ReactNode;
}

//pure layout: two slots, no opinions about what goes in them
//stacked on phones and tablets, side by side on desktop
//the stage comes first in the DOM so reading order matches the visual order
export function StageConsole({ stage, children }: StageConsoleProps) {
  return (
    <div className="stage-console">
      <div className="stage-console__stage">{stage}</div>
      <div className="stage-console__console">{children}</div>
    </div>
  );
}
