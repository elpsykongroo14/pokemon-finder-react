//TeamSLots.tsx is the party display
//it always renders exactly MAX_TEAM (6) <li>s, filled or empty, instead of team.map(...),
//so the screen's shape never depends on how many members there are.
//slot 1 is the "lead": the layout (CSS) makes it large
import "./TeamSlots.css";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";
import { BallOutline } from "../components/BallOutline";
import { TypeBadge } from "../components/TypeBadge";
import { useTeam } from "../hooks/useTeam";
import { MAX_TEAM } from "../lib/teamReducer";
import {
  LEAD_LABEL,
  PARTY_LABEL,
  emptySlotLabel,
  removeFromTeamLabel,
  removedFromTeamMessage,
} from "../lib/copy";

//if the exit animation never reports that it finished (it was cancelled, the
//tab was in the background, the stylesheet failed), remove the member anyway
const EXIT_FALLBACK_MS = 600;

export function TeamSLots() {
  const { team, removeFromTeam } = useTeam();

  //the name of the card currently playing its exit animation, if any.
  //React deletes an element the instant its state says so, which leaves
  //CSS no time to animate it out. so we split "remove" into two steps:
  //1) mark the card as leaving (it animates), 2) really remove it afterwards
  const [leaving, setLeaving] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const listRef = useRef<HTMLUListElement>(null);

  const finishRemoval = useCallback(
    (name: string) => {
      removeFromTeam(name);
      setLeaving(null);
      setAnnouncement(removedFromTeamMessage(name));
      //the focused remove button is about to vanish, which would drop keyboard
      //focus to the top of the page. park it on the list, which stays mounted
      listRef.current?.focus();
    },
    [removeFromTeam],
  );

  useEffect(() => {
    if (leaving === null) return;
    const timer = setTimeout(() => finishRemoval(leaving), EXIT_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [leaving, finishRemoval]);

  function startRemoval(name: string) {
    if (leaving !== null) return; //one exit at a time
    setAnnouncement("");
    setLeaving(name);
  }

  return (
    <>
      <ul
        className="team-slots"
        ref={listRef}
        tabIndex={-1}
        aria-label={PARTY_LABEL}
      >
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

          const isLeaving = leaving === member.name;

          return (
            <li
              key={member.name}
              className="team-slot team-slot--filled surface-window"
              data-lead={isLead || undefined}
              data-type={member.types?.[0]}
              data-leaving={isLeaving || undefined}
              style={{ "--slot-index": i } as CSSProperties}
              onAnimationEnd={(event) => {
                //the enter animation ends on this same element, and animations
                //on children bubble up: only the card's own EXIT counts
                if (event.target === event.currentTarget && isLeaving) {
                  finishRemoval(member.name);
                }
              }}
            >
              {isLead && <span className="team-slot__tag">{LEAD_LABEL}</span>}

              <Link
                className="team-slot__link"
                to={`/pokemon/${encodeURIComponent(member.name)}`}
              >
                {/* alt="" because the name right beside it already says who this is */}
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
                onClick={() => startRemoval(member.name)}
                aria-label={removeFromTeamLabel(member.name)}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>

      {/* always rendered, so a change in its text is announced */}
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </>
  );
}
