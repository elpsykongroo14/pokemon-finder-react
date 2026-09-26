import { type ButtonHTMLAttributes, type ReactNode } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps
  //ButtonHTMLAttributes<HTMLButtonElement> is a type React ships that describes every prop a real <button> DOM element accepts
  //(onClick expects a MouseEventHandler<HTMLButtonElement>, not just any function, for instance)
  //By extending it (minus className, per Decision B above), our ButtonProps interface automatically includes all of that,
  // and we only need to declare the props that are new variant, pressed, loading. children we declare explicitly and make required
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant;
  pressed?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  pressed,
  loading = false,
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const isToggle = pressed !== undefined;

  return (
    <button
      {...rest}
      type={type}
      className="btn"
      data-variant={variant}
      disabled={disabled || loading} //a loading button shouldn't be clickable
      aria-pressed={isToggle ? pressed : undefined}
      aria-busy={loading || undefined}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
