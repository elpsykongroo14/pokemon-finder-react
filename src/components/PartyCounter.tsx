import "./PartyCounter.css";
import { Link } from "react-router-dom";
import { useTeam } from "../hooks/useTeam";
import { usePartyArrival } from "../hooks/usePartyArrival";
import { MAX_TEAM } from "../lib/teamReducer";
import { PARTY_WORD, partyCountText } from "../lib/copy";

//the header's party counter (spec 5.1): the word "Party" and six slanted
//pips, each filled with its member's primary type color
export function PartyCounter() {
  const { team } = useTeam();
  const arrival = usePartyArrival(team);

  //one entry per slot: the member in it, or undefined for an empty slot.
  //MAX_TEAM comes from the reducer, so the counter can never disagree with
  //the rule that actually limits the team
  const slots = Array.from({ length: MAX_TEAM }, (_, i) => team[i]);

  return (
    <Link
      to="/team"
      className="party-counter"
      //one aria-label, "Party, 4 of 6" (D45), rather than the visible word
      //plus a visually hidden count: browsers add a space before a hidden
      //span that is positioned absolutely ("Party , 4 of 6"), so the name
      //is written out whole. it still starts with the visible word
      aria-label={`${PARTY_WORD}${partyCountText(team.length, MAX_TEAM)}`}
    >
      {/* the word stays in the DOM on phones too; CSS hides it there */}
      <span className="party-counter__word">{PARTY_WORD}</span>
      <span className="party-counter__pips" aria-hidden="true">
        {slots.map((member, i) => (
          <span
            //a member's pip is keyed by its name, so the pip of someone who
            //joins is a NEW element and its CSS animation plays from the
            //start. empty slots key by position: they never reorder
            key={member?.name ?? `empty-${i}`}
            className="party-counter__pip"
            data-filled={member !== undefined}
            //[data-type] makes type-themes.css give this pip its own
            //--theme-accent. no stored types: no attribute, an Ink pip (D50)
            data-type={member?.types?.[0]}
            data-joined={
              member !== undefined && member.name === arrival ? true : undefined
            }
          />
        ))}
      </span>
    </Link>
  );
}
