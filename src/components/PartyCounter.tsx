import "./PartyCounter.css";
import { Link } from "react-router-dom";
import { useTeam } from "../hooks/useTeam";
import { MAX_TEAM } from "../lib/teamReducer";

export function PartyCounter() {
  const { team } = useTeam();

  //one entry per slot: true = occupied, false = empty
  //MAX_team comes from the reducer, so the counter can never disagree
  //with the rule that actually limits the team
  const slots = Array.from({ length: MAX_TEAM }, (_, i) => i < team.length);

  return (
    <Link to="/team" className="party-counter">
      <span>Party</span>{" "}
      <span className="party-counter__pips" aria-hidden="true">
        {slots.map((filled, i) => (
          //index keys are fine here: the slots never reorder, they only fill
          <span key={i} className="party-counter__pip" data-filled={filled} />
        ))}
      </span>{" "}
      <span>
        {team.length}/{MAX_TEAM}
      </span>
    </Link>
  );
}
