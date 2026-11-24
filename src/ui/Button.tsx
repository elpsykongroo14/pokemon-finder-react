import { type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";
import "./Button.css";
import { Spinner } from "./Spinner";

//four looks, named after the surface they sit on (spec 5.2):
//  dark  Ink plate, on white      line   white plate + Ink ring, on white
//  light white plate, on black    ghost  white ring only, on black
//each one inverts on hover, so the four are really two pairs
export type ButtonVariant = "dark" | "line" | "light" | "ghost";
export type ButtonSize = "md" | "sm";

interface ButtonProps
  //ButtonHTMLAttributes<HTMLButtonElement> is a type React ships that describes every prop a real <button> DOM element accepts
  //(onClick expects a MouseEventHandler<HTMLButtonElement>, not just any function, for instance)
  //By extending it (minus className, per Decision B above), our ButtonProps interface automatically includes all of that,
  // and we only need to declare the props that are new variant, pressed, loading. children we declare explicitly and make required
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressed?: boolean;
  loading?: boolean;
  //React 19 passes ref as an ordinary prop; ...rest hands it to <button>.
  //declared so a caller can move focus to a Button (B&W-8)
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

export function Button({
  variant = "dark",
  size = "md",
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
      data-size={size}
      disabled={disabled || loading} //a loading button shouldn't be clickable
      aria-pressed={isToggle ? pressed : undefined}
      aria-busy={loading || undefined}
    >
      {loading && <Spinner decorative size="sm" />}
      {children}
    </button>
  );
}
