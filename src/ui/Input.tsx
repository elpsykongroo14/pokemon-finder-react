import { type InputHTMLAttributes } from "react";
import "./Input.css";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function Input(props: InputProps) {
  return <input {...props} className="input" />;
}
