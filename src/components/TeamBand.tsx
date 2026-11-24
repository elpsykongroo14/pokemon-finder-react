import "./TeamBand.css";
import { useTeam } from "../hooks/useTeam";
import { MAX_TEAM } from "../lib/teamReducer";
import { TEAM_HEADING, teamBandText } from "../lib/copy";
import { PageTitle } from "../ui/PageTitle";

//the Team page's title band (spec 7.5): a black plate with the page's
//name, one sentence about the party, and six big pips on the right.
//
//it takes the place of PageHeader on this page, so it also does
//PageHeader's other job: the browser-tab title (<PageTitle>). the heading
//is an h2 for the same reason as PageHeader's: the h1 is the app's name
export function TeamBand() {
  const { team } = useTeam();
  //one entry per slot, the member or undefined, exactly like PartyCounter
  const slots = Array.from({ length: MAX_TEAM }, (_, i) => team[i]);

  return (
    <header className="team-band on-dark">
      <PageTitle page={TEAM_HEADING} />
      <div className="team-band__text">
        <h2 className="team-band__title">{TEAM_HEADING}</h2>
        <p className="team-band__count">{teamBandText(team.length)}</p>
      </div>
      {/* the sentence already says the count: the pips are for the eye */}
      <span className="team-band__pips" aria-hidden="true">
        {slots.map((member, i) => (
          <span
            //slots never reorder on their own; a removal re-renders them all
            key={i}
            className="team-band__pip"
            data-filled={member !== undefined}
            //type-themes.css gives any [data-type] element its own
            //--theme-accent, so the pip needs no color logic here
            data-type={member?.types?.[0]}
          />
        ))}
      </span>
    </header>
  );
}
