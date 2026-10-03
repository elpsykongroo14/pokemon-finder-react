import "./Icon.css";

export type IconName =
  | "bluesky"
  | "discord"
  | "documentation"
  | "github"
  | "social"
  | "x";

interface IconProps {
  name: IconName;
  size?: number;
  label?: string;
}

export function Icon({ name, size = 20, label }: IconProps) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
    >
      <use href={`/icons.svg#${name}-icon`} />
    </svg>
  );
}

//its real job is wrapping the existing social sprite consistently
//most of its uses will be inside something already interactive (a github link in a footer)
//which already carries its own accessible name
