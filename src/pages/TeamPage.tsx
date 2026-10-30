import { TeamSLots } from "../context/TeamSlots";
import { useTeamBackfill } from "../hooks/useTeamBackfill";

export function TeamPage() {
  useTeamBackfill();

  return (
    <section>
      <h2>Your Team</h2>
      <TeamSLots />
    </section>
  );
}
