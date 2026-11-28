import "./BattleMenu.css";
import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { TransitionLink } from "./TransitionLink";
import { Icon, type IconName } from "./Icon";
import { PopIcon } from "../ui/PopIcon";
import { useTeam } from "../hooks/useTeam";
import { useTeamAction } from "../hooks/useTeamAction";
import { moveInGrid } from "../lib/gridNav";
import {
  COMPARE_COMMAND_HINT,
  COMPARE_LINK_TEXT,
  ENTRY_COMMAND,
  ENTRY_COMMAND_HINT,
  MENU_PROMPT,
  REROLL_COMMAND,
  REROLL_COMMAND_HINT,
  TEAM_FULL_ATTEMPT,
  TEAM_OFF_TEXT,
  TEAM_ON_TEXT,
  TEAM_TOGGLE_LABEL,
  teamCommandHint,
  teamNote,
} from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

//one column of commands: Up and Down move, and wrap at the ends
const COLUMNS = 1;

//the props every command gets from the menu, for the roving tabindex:
//only the remembered command is in the Tab order (tabIndex 0), and
//focusing any command makes it the remembered one
interface RovingProps {
  "data-battle-item": string;
  tabIndex: number;
  onFocus: () => void;
}

//what a command row shows: a title, the line under it, an icon on the
//right. the title NAMES the control and the line DESCRIBES it
//(aria-labelledby / aria-describedby point at the two spans), so a screen
//reader says "Compare, link, Size it up against another Pokémon"
function CommandBody({
  titleId,
  hintId,
  title,
  hint,
  icon,
}: {
  //left out when the control is named some other way (the team command)
  titleId?: string;
  hintId: string;
  title: ReactNode;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <span className="command__body">
      <span className="command__text">
        <span id={titleId} className="command__title">
          {title}
        </span>
        <span id={hintId} className="command__hint">
          {hint}
        </span>
      </span>
      <span className="command__icon">{icon}</span>
    </span>
  );
}

//a command that goes somewhere is a real link (it has an address you can
//open in a new tab); one that does something here is a button
function LinkCommand({
  to,
  title,
  hint,
  icon,
  primary,
  roving,
}: {
  to: string;
  title: string;
  hint: string;
  icon: IconName;
  primary: boolean;
  roving: RovingProps;
}) {
  const titleId = useId();
  const hintId = useId();
  return (
    <TransitionLink
      to={to}
      className="command"
      data-primary={primary || undefined}
      aria-labelledby={titleId}
      aria-describedby={hintId}
      {...roving}
    >
      <CommandBody
        titleId={titleId}
        hintId={hintId}
        title={title}
        hint={hint}
        icon={<Icon name={icon} size={18} />}
      />
    </TransitionLink>
  );
}

//a command that does something here (not a link). "Look for another"
//passes onClick. a row that needs a Pokémon while there is none yet (the
//next wild one is loading) passes none: it keeps its row, its words and
//its place, so the plate never reflows and the primary row stays first.
//aria-disabled, not disabled: a disabled button leaves the Tab order,
//and in a roving list every row has to stay reachable (APG)
function ButtonCommand({
  title,
  hint,
  icon,
  label,
  onClick,
  primary,
  roving,
}: {
  title: string;
  hint: string;
  icon: ReactNode;
  //the accessible name when it differs from the title (the team command)
  label?: string;
  onClick?: () => void;
  primary: boolean;
  roving: RovingProps;
}) {
  const titleId = useId();
  const hintId = useId();
  return (
    <button
      type="button"
      className="command"
      data-primary={primary || undefined}
      aria-disabled={onClick ? undefined : true}
      aria-labelledby={label ? undefined : titleId}
      aria-label={label}
      aria-describedby={hintId}
      onClick={onClick}
      {...roving}
    >
      <CommandBody
        titleId={titleId}
        hintId={hintId}
        title={title}
        hint={hint}
        icon={icon}
      />
    </button>
  );
}

//"Add to team" / "On your team". a component of its own because it calls
//hooks (useTeamAction, useTeam), and hooks need a Pokémon: this is only
//rendered when there is one, so the hooks never run with nothing to act on.
//
//D44: one accessible name, "Team", in both states; aria-pressed says which
function TeamCommand({
  pokemon,
  primary,
  roving,
  onNote,
}: {
  pokemon: PokemonDetails;
  primary: boolean;
  roving: RovingProps;
  onNote: (sentence: string) => void;
}) {
  const action = useTeamAction(pokemon);
  const { team } = useTeam();
  const hintId = useId();

  //an event: what THIS click did, reported by the toggle itself and put
  //into words once, in the handler (the same idea as the Pokémon page's
  //confirmation line)
  function handleClick() {
    const outcome = action.toggle();
    onNote(
      outcome.kind === "rejected"
        ? TEAM_FULL_ATTEMPT
        : (teamNote(pokemon.name, outcome) ?? ""),
    );
  }

  return (
    <button
      type="button"
      className="command"
      data-primary={primary || undefined}
      aria-pressed={action.onTeam}
      aria-label={TEAM_TOGGLE_LABEL}
      aria-describedby={hintId}
      onClick={handleClick}
      {...roving}
    >
      {/* aria-label above names this one (D44), so its title has no id */}
      <CommandBody
        hintId={hintId}
        title={action.onTeam ? TEAM_ON_TEXT : TEAM_OFF_TEXT}
        hint={teamCommandHint({
          name: pokemon.name,
          onTeam: action.onTeam,
          partySize: team.length,
        })}
        icon={
          <PopIcon popKey={action.popKey}>
            <Icon name={action.onTeam ? "check" : "plus"} size={16} />
          </PopIcon>
        }
      />
    </button>
  );
}

interface BattleMenuProps {
  //the wild Pokémon, or null while it loads or when it could not load
  pokemon: PokemonDetails | null;
  onReroll: () => void;
}

//one entry per command, in screen order. "render" receives the roving
//props for its position, so the list (not each command) decides who is
//first, second and so on
interface Command {
  key: string;
  render: (roving: RovingProps, primary: boolean) => ReactNode;
}

//the command plate (spec 7.1): the black plate on the right of Home's
//field, four slanted rows. keyboard model: a roving tabindex, so Tab enters
//the list once and the next Tab leaves it, while Up / Down / Home / End
//move inside it (moveInGrid, one column wide).
//
//the plate is NOT inside the keyed encounter layer: "Look for another"
//lives here, and a keyed plate would be thrown away by its own click,
//taking keyboard focus with it. it stays mounted; only the field behind it
//replays the encounter
export function BattleMenu({ pokemon, onReroll }: BattleMenuProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const headingId = useId();
  const [active, setActive] = useState(0);
  //what the last team click did, for screen readers (the visible words are
  //in the command itself). a live region: always rendered, text replaced
  const [note, setNote] = useState("");

  const { team } = useTeam();

  const name = pokemon ? encodeURIComponent(pokemon.name) : null;

  //always the same four rows. the two that need a Pokémon stand in as
  //ButtonCommand without an action while the next one loads: the list used to drop them,
  //and the plate jumped (Compare turned primary, the stack re-centred)
  const commands: Command[] = [];
  commands.push({
    key: "entry",
    render: (roving, primary) =>
      pokemon && name ? (
        <LinkCommand
          to={`/pokemon/${name}`}
          title={ENTRY_COMMAND}
          hint={ENTRY_COMMAND_HINT}
          icon="library"
          primary={primary}
          roving={roving}
        />
      ) : (
        <ButtonCommand
          title={ENTRY_COMMAND}
          hint={ENTRY_COMMAND_HINT}
          icon={<Icon name="library" size={18} />}
          primary={primary}
          roving={roving}
        />
      ),
  });
  commands.push({
    key: "compare",
    render: (roving, primary) => (
      <LinkCommand
        to={name ? `/compare?a=${name}` : "/compare"}
        title={COMPARE_LINK_TEXT}
        hint={COMPARE_COMMAND_HINT}
        icon="compare"
        primary={primary}
        roving={roving}
      />
    ),
  });
  commands.push({
    key: "team",
    render: (roving, primary) =>
      pokemon ? (
        <TeamCommand
          pokemon={pokemon}
          primary={primary}
          roving={roving}
          onNote={setNote}
        />
      ) : (
        <ButtonCommand
          title={TEAM_OFF_TEXT}
          hint={teamCommandHint({
            name: "",
            onTeam: false,
            partySize: team.length,
          })}
          icon={<Icon name="plus" size={16} />}
          label={TEAM_TOGGLE_LABEL}
          primary={primary}
          roving={roving}
        />
      ),
  });
  commands.push({
    key: "reroll",
    render: (roving, primary) => (
      <ButtonCommand
        title={REROLL_COMMAND}
        hint={REROLL_COMMAND_HINT}
        icon={<Icon name="shuffle" size={18} />}
        onClick={onReroll}
        primary={primary}
        roving={roving}
      />
    ),
  });

  //the list is always four rows now, but the clamp costs nothing and keeps
  //the remembered position in range if a command is ever added or removed.
  //derived, not stored: clamping on every render means it can never be out
  //of range
  const current = Math.min(active, commands.length - 1);

  function focusItem(index: number) {
    const items =
      listRef.current?.querySelectorAll<HTMLElement>("[data-battle-item]");
    items?.[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    //alt+left is the browser's Back, ctrl/cmd+arrows belong to the OS. leave them alone
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const next = moveInGrid(current, event.key, COLUMNS, commands.length);
    if (next === null) return;

    event.preventDefault();
    focusItem(next);
  }

  return (
    <section className="battle-menu on-dark" aria-labelledby={headingId}>
      <div className="battle-menu__inner">
        {/* the dialog box already asks "What will you do?" out loud, so
            the plate's heading only names the region (spec 7.1) */}
        <h2 id={headingId} className="visually-hidden">
          {MENU_PROMPT}
        </h2>
        <ul
          className="battle-menu__list"
          ref={listRef}
          onKeyDown={handleKeyDown}
        >
          {commands.map((command, index) => (
            <li key={command.key}>
              {command.render(
                {
                  "data-battle-item": "",
                  tabIndex: index === current ? 0 : -1,
                  //onFocus keeps the position in step with where focus
                  //really is: arrow key, Tab or mouse click
                  onFocus: () => setActive(index),
                },
                index === 0,
              )}
            </li>
          ))}
        </ul>
        <p className="visually-hidden" aria-live="polite">
          {note}
        </p>
      </div>
    </section>
  );
}
