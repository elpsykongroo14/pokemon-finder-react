interface CompareButtonProps {
  active: boolean;
  onToggle: () => void;
}

export function CompareButton({ active, onToggle }: CompareButtonProps) {
  return (
    <button
      type="button"
      className="compare-button"
      onClick={onToggle}
      aria-pressed={active}
    >
      {active ? "⚔️ Comparing" : "⚔️ Compare"}
    </button>
  );
}
