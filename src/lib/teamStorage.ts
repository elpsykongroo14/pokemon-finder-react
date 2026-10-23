import { MAX_TEAM } from "./teamReducer";
import { parseTeamMember } from "./teamMember";
import type { TeamMember } from "./type";

//the disk is a second entrance into our state, so it enforces the same invariants the reducer does
export function parseStoredTeam(stored: string | null): TeamMember[] {
  if (stored === null) return [];

  let data: unknown;
  try {
    data = JSON.parse(stored);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const seen = new Set<string>();
  const members: TeamMember[] = [];

  for (const item of data) {
    const member = parseTeamMember(item);
    if (!member || seen.has(member.name)) continue;

    seen.add(member.name);
    members.push(member);
    if (members.length === MAX_TEAM) break;
  }

  return members;
}
