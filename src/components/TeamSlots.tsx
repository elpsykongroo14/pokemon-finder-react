//TeamSlots.tsx is the party display (spec 7.5)
//it always renders exactly MAX_TEAM (6) <li>s, filled or empty, instead of team.map(...),
//so the screen's shape never depends on how many members there are.
//slot 1 is the "lead": it says so with a tag next to its dex number
import "./TeamSlots.css";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { BrandMark } from "./BrandMark";
import { FieldSky } from "./EncounterField";
import { Icon } from "./Icon";
import { TransitionLink } from "./TransitionLink";
import { TypeBadge } from "./TypeBadge";
import { IconButton } from "../ui/IconButton";
import { useTeam } from "../hooks/useTeam";
import { usePreferences } from "../hooks/usePreferences";
import { MAX_TEAM } from "../lib/teamReducer";
import { formatDexNumber } from "../lib/dex";
import { MAX_STAT_TOTAL, percentOf } from "../lib/stats";
import { listSpriteUrl } from "../lib/sprites";
import {
  BASE_STAT_TOTAL_LABEL,
  DETAILS_LABEL,
  FIND_POKEMON_LABEL,
  LEAD_LABEL,
  PARTY_LABEL,
  emptySlotLabel,
  removeFromTeamLabel,
  removedFromTeamMessage,
} from "../lib/copy";
import type { TeamMember } from "../lib/type";

//if the exit animation never reports that it finished (it was cancelled, the
//tab was in the background, the stylesheet failed), remove the member anyway
const EXIT_FALLBACK_MS = 600;

export function TeamSlots() {
  const { team, removeFromTeam } = useTeam();
  const { animationsEnabled } = usePreferences();

  //the name of the card currently playing its exit animation, if any.
  //React deletes an element the instant its state says so, which leaves
  //CSS no time to animate it out. so we split "remove" into two steps:
  //1) mark the card as leaving (it animates), 2) really remove it afterwards
  const [leaving, setLeaving] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const listRef = useRef<HTMLOListElement>(null);

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
    //with animations off the slot-leave motion does not exist (its CSS
    //only applies while data-motion="on"), so no animationend would ever
    //come: the card would just sit there for the fallback's 600 ms.
    //skip step 1 and remove it now
    if (!animationsEnabled) {
      finishRemoval(name);
      return;
    }
    setLeaving(name);
  }

  return (
    <>
      {/* an <ol>: the order means something (slot 1 is the lead) */}
      <ol
        className="team-slots"
        ref={listRef}
        tabIndex={-1}
        aria-label={PARTY_LABEL}
      >
        {Array.from({ length: MAX_TEAM }).map((_, i) => {
          const member = team[i];
          const isLead = i === 0;
          //every slot rises in on load, one after another (CSS reads this)
          const style = { "--slot-index": i } as CSSProperties;

          if (!member) {
            return (
              <li
                key={`empty-${i}`}
                className="team-slot team-slot--empty"
                data-lead={isLead || undefined}
                style={style}
              >
                <BrandMark size={56} />
                <p className="team-slot__open">{emptySlotLabel(i + 1)}</p>
                <TransitionLink to="/" variant="dark" size="sm">
                  <Icon name="plus" size={16} />
                  {FIND_POKEMON_LABEL}
                </TransitionLink>
              </li>
            );
          }

          const isLeaving = leaving === member.name;

          return (
            <li
              key={member.name}
              className="team-slot team-slot--filled"
              data-lead={isLead || undefined}
              //the theme engine: data-type colors the sky, the bar and the
              //chips' neighbors; data-type2 colors the field's stripes
              data-type={member.types?.[0]}
              data-type2={member.types?.[1]}
              data-leaving={isLeaving || undefined}
              style={style}
              onAnimationEnd={(event) => {
                //the enter animation ends on this same element, and animations
                //on children bubble up: only the card's own EXIT counts
                if (event.target === event.currentTarget && isLeaving) {
                  finishRemoval(member.name);
                }
              }}
            >
              <PartyCard
                member={member}
                isLead={isLead}
                onRemove={() => startRemoval(member.name)}
              />
            </li>
          );
        })}
      </ol>

      {/* always rendered, so a change in its text is announced */}
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </>
  );
}

interface PartyCardProps {
  member: TeamMember;
  isLead: boolean;
  onRemove: () => void;
}

//what a filled slot shows (spec 7.5): a mini field with the sprite on its
//platform, then the dex number, the name, the chips, the base stat total
//and the actions. the <li> around it owns the theme (data-type) and the
//exit animation; this only draws
function PartyCard({ member, isLead, onRemove }: PartyCardProps) {
  //the sprite setting the Pokémon page follows (B&W-8, left open by D65):
  //pixel sprites come from the dex number, so even a member saved
  //without one has a picture; artwork is the image saved with the member
  const { spriteMode } = usePreferences();
  const sprite = listSpriteUrl(spriteMode, member);

  return (
    <>
      {/* scenery only: the name below already says who this is */}
      <div className="team-slot__field" aria-hidden="true">
        <FieldSky />
        <span className="team-slot__platform" />
        {sprite && (
          <img
            className="team-slot__sprite"
            data-mode={spriteMode}
            src={sprite}
            alt=""
            width={96}
            height={96}
            loading="lazy"
          />
        )}
      </div>

      <div className="team-slot__info">
        <p className="team-slot__dex">
          {formatDexNumber(member.id)}
          {isLead && (
            //the plate leans, its text stands up straight (spec 4.3)
            <span className="team-slot__tag">
              <span>{LEAD_LABEL}</span>
            </span>
          )}
        </p>

        {/* the card's one link, its hit area stretched over the whole card
            by CSS. the heading gives a screen reader a way to jump from
            card to card */}
        <h3 className="team-slot__name">
          <TransitionLink
            className="team-slot__link"
            to={`/pokemon/${encodeURIComponent(member.name)}`}
          >
            {member.name}
          </TransitionLink>
        </h3>

        {/* types are optional: teams saved before they existed simply show none until backfilled */}
        <div className="team-slot__types">
          {member.types?.map((typeName) => (
            <TypeBadge key={typeName} typeName={typeName} size="sm" />
          ))}
        </div>

        {/* D49: likewise, no total until the backfill brings one. showing
            "0" meanwhile would be a wrong number, not a missing one */}
        {member.statTotal !== undefined && (
          <div className="team-slot__total">
            <p className="team-slot__total-row">
              <span>{BASE_STAT_TOTAL_LABEL}</span>
              <strong>{member.statTotal}</strong>
            </p>
            <span className="team-slot__bar" aria-hidden="true">
              <span
                className="team-slot__fill"
                style={
                  {
                    "--fill": percentOf(member.statTotal, MAX_STAT_TOTAL) / 100,
                  } as CSSProperties
                }
              />
            </span>
          </div>
        )}

        <div className="team-slot__actions">
          {/* drawn like a small line button, but it is the card's link
              (stretched underneath) that answers a click. a real second
              link would be a second tab stop to the same page, named
              "Details" instead of the Pokémon, so this is for the eye only */}
          <span
            className="btn team-slot__details"
            data-variant="line"
            data-size="sm"
            aria-hidden="true"
          >
            {DETAILS_LABEL}
          </span>
          {/* above the stretched link, so it stays its own target */}
          <span className="team-slot__remove">
            <IconButton
              icon="×"
              aria-label={removeFromTeamLabel(member.name)}
              onClick={onRemove}
            />
          </span>
        </div>
      </div>
    </>
  );
}
