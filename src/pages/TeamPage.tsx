import { TeamSLots } from "../context/TeamSlots";
import { useTeamBackfill } from "../hooks/useTeamBackfill";
import { PageHeader } from "../ui/PageHeader";
import { TEAM_HEADING, TEAM_SUBTITLE } from "../lib/copy";

export function TeamPage() {
  useTeamBackfill();

  return (
    <section>
      <PageHeader title={TEAM_HEADING} subtitle={TEAM_SUBTITLE} />
      <TeamSLots />
    </section>
  );
}
