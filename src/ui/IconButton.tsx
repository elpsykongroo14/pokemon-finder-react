import { type ButtonHTMLAttributes, type ReactNode } from "react";
import "./IconButton.css";

//a calm utility (spec 4.3 rule 2: square, 4 px corners, never leans):
//settings, close. it used to be a Button with an icon inside, but a
//slanted plate around a lone gear reads as an action on the Pokémon,
//which is exactly what this is not. so it is its own small element now
interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "children" | "aria-label"
> {
  icon: ReactNode;
  //required: an icon has no text, so this is the button's only name
  "aria-label": string;
}

export function IconButton({
  icon,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button {...rest} type={type} className="icon-btn">
      <span className="icon-btn__icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
