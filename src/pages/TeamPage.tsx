import { TeamSLots } from "../context/TeamSlots";
import { useTeamBackfil } from "../hooks/useTeamBackfill";

export function TeamPage() {
  useTeamBackfil();

  return (
    <section>
      <h2>Your Team</h2>
      <TeamSLots />
    </section>
  );
}
