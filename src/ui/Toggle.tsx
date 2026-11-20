import { type InputHTMLAttributes } from "react";
import "./Toggle.css";

interface ToggleProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "type" | "checked" | "onChange"
> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label, ...rest }: ToggleProps) {
  return (
    <label className="toggle">
      <input
        {...rest}
        type="checkbox"
        className="toggle__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle__label">{label}</span>
    </label>
  );
}
