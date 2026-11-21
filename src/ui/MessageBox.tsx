import { usePreferences } from "../hooks/usePreferences";
import { useTypewriter } from "../hooks/useTypewriter";
import "./MessageBox.css";
import type { ReactNode } from "react";

export type MessageBoxVariant = "info" | "success" | "error";

interface MessageBoxProps {
  text: string;
  variant?: MessageBoxVariant;
  //optional extra controls under the text, e.g a Retry button
  children?: ReactNode;
}

//the battle dialog (spec 7.1): a white box with a heavy Ink frame and an
//inner ring in the Pokémon's color, game text in Jersey 10. it used to sit
//inside a Panel; the frame is now its own, so the Panel wrapper is gone
export function MessageBox({
  text,
  variant = "info",
  children,
}: MessageBoxProps) {
  const { animationsEnabled } = usePreferences();
  const animate = animationsEnabled && variant !== "error";
  //animationsEnabled is already the final answer (the person's choice, with
  //"auto" resolved against the OS PreferencesProvider), so this component
  //no longer asks the OS itself, errors always appear instantly

  const typed = useTypewriter(text, animate);
  const rest = text.slice(typed.length);

  //derived, not stored: "finished typing" is just "nothing left to type".
  //a useState flag set from an effect would be a second copy of the same
  //fact, one render late. errors get no caret: an error is not "your move"
  const showCaret = rest.length === 0 && variant !== "error";

  return (
    <div className="message-box" data-variant={variant}>
      <span
        className="visually-hidden"
        role={variant === "error" ? "alert" : "status"}
      >
        {text}
      </span>
      <span className="message-box__text" aria-hidden="true">
        <span className="message-box__typed">{typed}</span>
        <span className="message-box__rest">{rest}</span>
        {showCaret && (
          <span className="message-box__caret" aria-hidden="true" />
        )}
      </span>
      {children && <div className="message-box__actions">{children}</div>}
    </div>
  );
}
