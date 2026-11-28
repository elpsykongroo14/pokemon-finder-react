import "./PokemonActions.css";
import { useId, useState } from "react";
import { FavoriteButton } from "./FavoriteButton";
import { HeartBurst } from "./HeartBurst";
import { Icon } from "./Icon";
import { TeamStatus, TeamToggle } from "./TeamButton";
import { useTeamAction } from "../hooks/useTeamAction";
import { useFavoriteAction } from "../hooks/useFavoriteAction";
import { usePreferences } from "../hooks/usePreferences";
import { TransitionLink } from "./TransitionLink";
import {
  ACTIONS_COLLECT_LABEL,
  ACTIONS_EXPLORE_LABEL,
  CARDS_LINK_TEXT,
  COMPARE_LINK_TEXT,
  favoriteNote,
  teamNote,
} from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

interface PokemonActionsProps {
  pokemon: PokemonDetails;
}

//one confirmation at a time. id goes up with every new sentence, and is
//used as the line's key: a new key means a new element, so the slide-in
//plays again even when the sentence is the same as the last one
interface Note {
  text: string;
  id: number;
}

//the 2 x 2 action grid on the name plate (spec 7.2). two labelled groups,
//one per row, sorted by what each control acts on:
//  Collect  = buttons that change our collection (favorites, team)
//  Explore  = links that take us to another page (compare, cards)
//the captions are for screen readers only ("Collect, group"): the design
//draws the grid without them
export function PokemonActions({ pokemon }: PokemonActionsProps) {
  const favoriteAction = useFavoriteAction(pokemon);
  const teamAction = useTeamAction(pokemon);
  const { animationsEnabled } = usePreferences();
  const name = encodeURIComponent(pokemon.name);
  const collectId = useId();
  const exploreId = useId();

  //the inline confirmation (spec 6.2). an EVENT ("this click did that"), so
  //it is set in the click handlers, from what each toggle reports it did
  const [note, setNote] = useState<Note | null>(null);

  function confirm(text: string | null) {
    if (text === null) return; //nothing happened worth confirming
    setNote((previous) => ({ text, id: (previous?.id ?? 0) + 1 }));
  }

  return (
    <div className="pokemon-actions">
      <div
        className="pokemon-actions__group"
        role="group"
        aria-labelledby={collectId}
      >
        <span id={collectId} className="visually-hidden">
          {ACTIONS_COLLECT_LABEL}
        </span>
        <div className="pokemon-actions__favorite">
          <FavoriteButton
            isFavorite={favoriteAction.isFavorite}
            onToggle={() => confirm(favoriteNote(favoriteAction.toggle()))}
            popKey={favoriteAction.popKey}
          />
          {/* same gates as the shiny sparkle: JS (not rendered with motion
              off) and a new key per add, so every add bursts afresh */}
          {animationsEnabled && favoriteAction.popKey > 0 && (
            <HeartBurst key={favoriteAction.popKey} />
          )}
        </div>
        <TeamToggle
          action={teamAction}
          onToggle={() => confirm(teamNote(pokemon.name, teamAction.toggle()))}
        />
      </div>

      <div
        className="pokemon-actions__group"
        role="group"
        aria-labelledby={exploreId}
      >
        <span id={exploreId} className="visually-hidden">
          {ACTIONS_EXPLORE_LABEL}
        </span>
        <TransitionLink to={`/compare?a=${name}`} variant="ghost">
          <Icon name="compare" size={18} />
          {COMPARE_LINK_TEXT}
        </TransitionLink>
        <TransitionLink to={`/library/${name}`} variant="ghost">
          <Icon name="library" size={18} />
          {CARDS_LINK_TEXT}
        </TransitionLink>
      </div>

      {/* polite: it waits for the screen reader to finish, then reads the
          new line. the region itself is always there (a live region that
          appears together with its text is often not announced); only the
          line inside it is replaced */}
      <p className="pokemon-actions__note" aria-live="polite">
        {note && (
          <span key={note.id} className="pokemon-actions__note-line">
            <Icon name="check" size={16} />
            {note.text}
          </span>
        )}
      </p>

      {/* the party's own messages: the party-full hint (which the Team button
          is described by), the six-of-six celebration, errors */}
      <TeamStatus action={teamAction} />
    </div>
  );
}
