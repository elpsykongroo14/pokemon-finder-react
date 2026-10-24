import { useEffect, useState } from "react";
import { fetchPokemon } from "../lib/api";
import { useTeam } from "./useTeam";

//lazily fills in 'types' for team members saved before that field existed
//each effect run does exactly one job (fetch next member who needs it)
//finishing it changes the team, which changes 'next', which re-runs the effect
export function useTeamBackfil(): void {
  const { team, backfillMember } = useTeam();
  //names that failed to load this visit, so one bad member cannot block the rest
  const [failed, setFailed] = useState<string[]>([]);

  const next = team.find(
    (member) => member.types === undefined && !failed.includes(member.name),
  )?.name;

  useEffect(() => {
    if (next === undefined) return;

    const controller = new AbortController();

    fetchPokemon(next, { signal: controller.signal })
      .then((pokemon) => {
        //fetchPokemon returns cached datat without looking at the signal
        //so an aborted run can still get an answer. ignore it
        if (controller.signal.aborted) return;
        backfillMember(pokemon);
      })
      .catch((err: unknown) => {
        //an abort is us cancelling on purpose, not a failure
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFailed((previous) => [...previous, next]);
      });

    return () => {
      controller.abort();
    };
  }, [next, backfillMember]);
}
