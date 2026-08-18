//TeamSLots.tsx is the roster display
//mirroring FavoritesList.tsx
//this always renders exactly MAX_TEAM (6) <li>s, filled or empty, instead of team.map(...)
import { useTeam } from "../hooks/useTeam";
import { MAX_TEAM } from "../lib/teamReducer";

interface TeamSLotsProps {
  onSelect: (name: string) => void;
}

export function TeamSLots({ onSelect }: TeamSLotsProps) {
  const { team, removeFromTeam } = useTeam();

  return (
    <ul className="team-slots">
      {Array.from({ length: MAX_TEAM }).map((_, i) => {
        const member = team[i];

        if (!member) {
          return (
            <li key={`empty-${i}`} className="team-slot team-slot--empty">
              <span aria-hidden="true"></span>
            </li>
          );
        }

        return (
          <li key={member.name} className="team-slot team-slot--filled">
            <button type="button" onClick={() => onSelect(member.name)}>
              {member.name}
            </button>
            <button
              type="button"
              className="remove-team"
              onClick={(e) => {
                e.stopPropagation();
                removeFromTeam(member.name);
              }} //without e.stopPropagation() on the remove button,
              //a click on the x would also bubble up and could trigger the slot's own click handler (select this pokemon)
              //firing both actions from one click
              aria-label={`Remove ${member.name} from team`}
            >
              x
            </button>
          </li>
        );
      })}
    </ul>
  );
}
