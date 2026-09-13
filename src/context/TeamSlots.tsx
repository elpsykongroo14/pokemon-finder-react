//TeamSLots.tsx is the roster display
//mirroring FavoritesList.tsx
//this always renders exactly MAX_TEAM (6) <li>s, filled or empty, instead of team.map(...)
import { Link } from "react-router-dom";
import { useTeam } from "../hooks/useTeam";
import { MAX_TEAM } from "../lib/teamReducer";

export function TeamSLots() {
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
            <Link to={`/pokemon/${encodeURIComponent(member.name)}`}>
              {member.name}
            </Link>
            <button
              type="button"
              className="remove-team"
              onClick={(e) => {
                e.stopPropagation();
                removeFromTeam(member.name);
              }}
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
