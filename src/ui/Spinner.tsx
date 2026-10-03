import "./Spinner.css";

export type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  decorative?: boolean;
}

export function Spinner({
  size = "md",
  label = "loading",
  decorative = false,
}: SpinnerProps) {
  return (
    <span
      className="spinner"
      data-size={size}
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? "true" : undefined}
    />
  );
}

//decorative flips between two complete, mutually exclusive accessibility treatments, not a partial tweak
//with it, Spinner is purely visual (aria-hidden, no role)
//without it, it fully owns announcing itself (role="status", labelled)
