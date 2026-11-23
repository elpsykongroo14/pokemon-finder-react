import { usePreferences } from "../hooks/usePreferences";
import { useTypewriter } from "../hooks/useTypewriter";
import "./MessageBox.css";
import type { CSSProperties, ReactNode } from "react";

export type MessageBoxVariant = "info" | "success" | "error";

//how the visible text appears:
//  letters  a script types it one letter at a time, as soon as it changes
//  lines    every line is in the page at once and CSS reveals each one on
//           a fixed clock (Home's encounter dialog, spec 6.1: line one at
//           950 ms, line two at 2050 ms, timed against the sprite's arrival)
export type MessageBoxTyping = "letters" | "lines";

interface MessageBoxProps {
  text: string;
  variant?: MessageBoxVariant;
  typing?: MessageBoxTyping;
  //optional extra controls under the text, e.g a Retry button
  children?: ReactNode;
}

//the battle dialog (spec 7.1): a white box with a heavy Ink frame and an
//inner ring in the Pokémon's color, game text in Jersey 10. it used to sit
//inside a Panel; the frame is now its own, so the Panel wrapper is gone
export function MessageBox({
  text,
  variant = "info",
  typing = "letters",
  children,
}: MessageBoxProps) {
  const { animationsEnabled } = usePreferences();
  const animate =
    animationsEnabled && variant !== "error" && typing === "letters";
  //animationsEnabled is already the final answer (the person's choice, with
  //"auto" resolved against the OS PreferencesProvider), so this component
  //no longer asks the OS itself, errors always appear instantly.
  //"lines" never runs the script: CSS does the revealing, and only while
  //motion is on, so with motion off the text is simply there

  const typed = useTypewriter(text, animate);
  const rest = text.slice(typed.length);

  //derived, not stored: "finished typing" is just "nothing left to type".
  //a useState flag set from an effect would be a second copy of the same
  //fact, one render late. errors get no caret: an error is not "your move"
  const showCaret = rest.length === 0 && variant !== "error";
  const caret = showCaret && (
    <span className="message-box__caret" aria-hidden="true" />
  );

  return (
    <div className="message-box" data-variant={variant} data-typing={typing}>
      {/* the live region stays the same element for the box's whole life;
          only its text changes, which is what makes a screen reader read
          the new sentence */}
      <span
        className="visually-hidden"
        role={variant === "error" ? "alert" : "status"}
      >
        {text}
      </span>
      {typing === "lines" ? (
        //key={text}: new text = new elements, and new elements start their
        //CSS animations from the beginning (the same trick as the
        //encounter layer's key). the live region above is NOT keyed
        <span key={text} className="message-box__text" aria-hidden="true">
          <span className="message-box__typed">
            {text.split("\n").map((line, index, lines) => (
              <span
                key={index}
                className="message-box__line"
                data-line={index + 1}
                //the line's length, so CSS can type it in that many steps
                style={{ "--chars": line.length } as CSSProperties}
              >
                <span className="message-box__clip">{line}</span>
                {index === lines.length - 1 && caret}
              </span>
            ))}
          </span>
        </span>
      ) : (
        <span className="message-box__text" aria-hidden="true">
          <span className="message-box__typed">{typed}</span>
          <span className="message-box__rest">{rest}</span>
          {caret}
        </span>
      )}
      {children && <div className="message-box__actions">{children}</div>}
    </div>
  );
}
