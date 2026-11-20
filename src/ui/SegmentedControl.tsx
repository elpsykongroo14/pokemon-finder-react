import { useId, type ReactNode } from "react";
import "./SegmentedControl.css";

interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  //both new props are optional and default to the old behavior, so every
  //existing caller (the library view switch) keeps working untouched
  labelVisible?: boolean;
  description?: ReactNode;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  labelVisible = false,
  description,
}: SegmentedControlProps<T>) {
  const name = useId();
  const descriptionId = useId();

  return (
    <fieldset
      className="segmented"
      //aria-describeby makes a screen reader read react the hint when focus enters
      //the group, right after its name. only point at the hint when it exists
      aria-describedby={description ? descriptionId : undefined}
    >
      <legend
        className={labelVisible ? "segmented__legend" : "visually-hidden"}
      >
        {label}
      </legend>
      <div className="segmented__options">
        {options.map((option) => (
          <label key={option.value} className="segmented__option">
            <input
              type="radio"
              className="visually-hidden"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className="segmented__label">{option.label}</span>
          </label>
        ))}
      </div>
      {description && (
        <p id={descriptionId} className="segmented__description">
          {description}
        </p>
      )}
    </fieldset>
  );
}
