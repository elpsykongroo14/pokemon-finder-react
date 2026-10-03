//this one only needs to know which type its rendering,
//everything else (the color) it can look up itself
import "./TypeBadge.css";

interface TypeBadgeProps {
  typeName: string;
}

export function TypeBadge({ typeName }: TypeBadgeProps) {
  return (
    <span className="type-badge" data-type={typeName}>
      {typeName}
    </span>
  );
}
