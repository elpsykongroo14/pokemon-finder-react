import { TeamSLots } from "../components/TeamSlots";
import { TeamBand } from "../components/TeamBand";
import { useTeamBackfill } from "../hooks/useTeamBackfill";

//the Team page (spec 7.5): the black title band edge to edge, then the
//party cards. page--bleed tells the shell to drop its column and gutters
//(Layout.css); the cards bring their own measure back
export function TeamPage() {
  //fills in types and stat totals for members saved before those existed
  useTeamBackfill();

  return (
    <section className="team-page page--bleed">
      <TeamBand />
      <TeamSLots />
    </section>
  );
}
