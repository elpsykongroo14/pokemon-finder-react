//TeamSLots.tsx is the roster display
//this always renders exactly MAX_TEAM (6) <li>s, filled or empty, instead of team.map(...)
//so the screen's shape never depends on how many members there are
//slot 1 is the "lead": the layout (css) makes it large
import "./TeamSlots.css";
import { Link } from "react-router-dom";
import { BallOutline } from "../components/BallOutline";
import { TypeBadge } from "../components/TypeBadge";
import { useTeam } from "../hooks/useTeam";
import { MAX_TEAM } from "../lib/teamReducer";
import { LEAD_LABEL, emptySlotLabel, removeFromTeamLabel } from "../lib/copy";

export function TeamSLots() {
  const { team, removeFromTeam } = useTeam();

  return (
    <ul className="team-slots">
      {Array.from({ length: MAX_TEAM }).map((_, i) => {
        const member = team[i];
        const isLead = i === 0;

        if (!member) {
          return (
            <li
              key={`empty-${i}`}
              className="team-slot team-slot--empty"
              data-lead={isLead || undefined}
            >
              <BallOutline />
              <span className="visually-hidden">{emptySlotLabel(i + 1)}</span>
            </li>
          );
        }

        return (
          <li
            key={member.name}
            className="team-slot team-slot--filled surface-window"
            data-lead={isLead || undefined}
            data-type={member.types?.[0]}
          >
            {isLead && <span className="team-slot__tag">{LEAD_LABEL}</span>}
            <Link
              className="team-slot__link"
              to={`/pokemon/${encodeURIComponent(member.name)}`}
            >
              {member.sprite && (
                <img
                  className="team-slot__sprite"
                  src={member.sprite}
                  alt=""
                  width={96}
                  height={96}
                  loading="lazy"
                />
              )}
              <span className="team-slot__name">{member.name}</span>
            </Link>

            {/* types are optional: teams saved before they existed simply show none until backfilled */}
            <div className="team-slot__types">
              {member.types?.map((typeName) => (
                <TypeBadge key={typeName} typeName={typeName} />
              ))}
            </div>

            <button
              type="button"
              className="remove-team"
              onClick={() => removeFromTeam(member.name)}
              aria-label={removeFromTeamLabel(member.name)}
            >
              ×
            </button>
          </li>
        );
      })}
    </ul>
  );
}
