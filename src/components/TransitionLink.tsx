import "../ui/Button.css";
import { Link, type LinkProps } from "react-router-dom";
import { useViewTransitionNavigate } from "../hooks/useViewTransitionNavigate";
import { isPlainLeftClick } from "../lib/clicks";
import type { ButtonVariant } from "../ui/Button";

interface TransitionLinkProps extends Omit<LinkProps, "to" | "className"> {
  to: string;
  //give it a variant and the link is drawn like a Button, it is still a
  //real <a href>, because it takes you somewhere
  variant?: ButtonVariant;
}

//a real link that animates plain clicks through the View Transitions
//wrapper, modified clicks (ctrl, cmd, shift, middle) are left to
//the browser, so "open in new tab" keeps working
export function TransitionLink({
  to,
  variant,
  onClick,
  children,
  ...rest
}: TransitionLinkProps) {
  const goTo = useViewTransitionNavigate();

  return (
    <Link
      {...rest}
      to={to}
      className={variant ? "btn" : undefined}
      data-variant={variant}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !isPlainLeftClick(event)) return;
        event.preventDefault();
        goTo(to);
      }}
    >
      {children}
    </Link>
  );
}
