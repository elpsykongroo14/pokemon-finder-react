import { type ReactNode } from "react";
import { Button, type ButtonVariant } from "./Button";
import "./IconButton.css";

interface IconButtonProps {
  icon: ReactNode;
  variant?: ButtonVariant;
  pressed?: boolean;
  loading?: boolean;
  "aria-label": string;
  onClick?: () => void;
}

export function IconButton({
  icon,
  "aria-label": arialabel,
  ...rest
}: IconButtonProps) {
  return (
    <Button aria-label={arialabel} {...rest}>
      <span aria-hidden="true">{icon}</span>
    </Button>
  );
}
