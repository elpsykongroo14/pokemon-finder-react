import { type SelectHTMLAttributes, type ReactNode } from "react";
import "./Select.css";

interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "className"
> {
  children: ReactNode;
}

export function Select({ children, ...rest }: SelectProps) {
  return (
    <div className="select">
      <select {...rest} className="select__control">
        {children}
      </select>
      <span className="select__chevron" aria-hidden="true">
        ▾
      </span>
    </div>
  );
}
