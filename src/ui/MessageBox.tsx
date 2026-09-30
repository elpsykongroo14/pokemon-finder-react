import { usePreferences } from "../hooks/usePreferences";
import { usePrefersReduceMotion } from "../hooks/usePrefersReducedMotion";
import { useTypewriter } from "../hooks/useTypewriter";
import { Panel } from "./Panel";
import "./MessageBox.css";

export type MessageBoxVariant = "info" | "success" | "error";

interface MessageBoxProps {
  text: string;
  variant?: MessageBoxVariant;
}

export function MessageBox({ text, variant = "info" }: MessageBoxProps) {
  const { animationsEnabled } = usePreferences();
  const prefersReduceMotion = usePrefersReduceMotion();
  const animate =
    animationsEnabled && !prefersReduceMotion && variant !== "error";
  //animate combines three conditions:
  //animate only if the in app setting allows it, the OS hasnt asked for reduced motion, and this isnt an error. any "no" means the text appears instantly

  const typed = useTypewriter(text, animate);
  const rest = text.slice(typed.length);

  return (
    <Panel>
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
        </span>
      </div>
    </Panel>
  );
}
