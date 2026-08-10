{
  /*
    why two components?
    StatBar draws one row (a label, a number).
    StatBarChart decides which stats to show, in what order
*/
}

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  isHighest: boolean;
}

export function StatBar({ label, value, maxValue, isHighest }: StatBarProps) {
  const percent = (value / maxValue) * 100;

  return (
    //StatBar doesn't know or care how isHighest was decided. It just receives a boolean and reacts to it.
    //push decisions up, keep leaves dumb.
    //StatBar's only job is "given these facts, render a bar." That makes it trivially testable and reusable
    <div className={`stat-row${isHighest ? " stat-row--highest" : ""}`}>
      <span className="stat-label">{label}</span>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${percent}%` }}></div>
      </div>
      <span className="stat-value">{value}</span>
    </div>
  );
}
