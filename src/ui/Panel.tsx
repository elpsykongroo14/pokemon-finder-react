import { type HTMLAttributes, type ReactNode } from "react";
import "./Panel.css";

export type PanelVariant = "raised" | "sunken" | "tinted";

interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  variant?: PanelVariant;
  children: ReactNode;
}

export function Panel({ variant = "raised", children, ...rest }: PanelProps) {
  return (
    <div {...rest} className="panel surface-window" data-variant={variant}>
      {children}
    </div>
  );
}
