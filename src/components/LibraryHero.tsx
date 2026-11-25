import "./LibraryHero.css";
import { useId, useRef } from "react";
import { Link } from "react-router-dom";
import { FieldSky } from "./EncounterField";
import { HoloCard } from "./HoloCard";
import { Icon } from "./Icon";
import { SearchBar } from "./SearchBar";
import { TransitionLink } from "./TransitionLink";
import { Button } from "../ui/Button";
import { PageTitle } from "../ui/PageTitle";
import { useHoloPointer } from "../hooks/useHoloPointer";
import { describeCard, pickHand, summarizeCards } from "../lib/tcg";
import { formatDexNumber } from "../lib/dex";
import type { libraryStatus } from "../lib/tcgLibraryReducer";
import type { PokemonDetails, TCGCard } from "../lib/type";
import {
  FEATURED_CARDS_LINK,
  LIBRARY_HAND_LABEL,
  LIBRARY_HEADING,
  LIBRARY_SEARCH_LABEL,
  LIBRARY_SEARCH_PLACEHOLDER,
  LIBRARY_SUBTITLE,
  OPEN_BINDER_TEXT,
  libraryEntryText,
  libraryLead,
  libraryTitle,
} from "../lib/copy";

//where each of the three cards sits in the fan, in the order pickHand
//gives them: the rarest in the middle, then left, then right
const SLOTS = ["center", "left", "right"] as const;

interface LibraryHeroProps {
  //the Pokémon in the URL; undefined on the featured page
  name: string | undefined;
  //its details, for the dex number and the theme; null while loading,
  //on the featured page, or if the lookup failed (the cards still show)
  pokemon: PokemonDetails | null;
  cards: TCGCard[];
  status: libraryStatus;
  //the way back to the featured cards, with the view kept (the page builds it)
  featuredHref: string;
  onSearch: (query: string) => void;
  onSelect: (card: TCGCard) => void;
  onOpenBinder: () => void;
}

//the Library's hero (spec 7.4): a 560 px field in the searched Pokémon's
//colors, with "the hand" of its three rarest cards fanned on the left and
//the black plate on the right. without a Pokémon (the featured cards) the
//same layout in Graphite with the existing title and sentence
export function LibraryHero({
  name,
  pokemon,
  cards,
  status,
  featuredHref,
  onSearch,
  onSelect,
  onOpenBinder,
}: LibraryHeroProps) {
  const titleId = useId();
  const hand = status === "success" ? pickHand(cards) : [];
  const title = name ? libraryTitle(name) : LIBRARY_HEADING;
  const lead =
    status === "success"
      ? libraryLead(summarizeCards(cards))
      : name
        ? null
        : LIBRARY_SUBTITLE;

  return (
    <section
      className="library-hero"
      aria-labelledby={titleId}
      //the type-theme engine colors the field: no attribute = Graphite
      data-type={pokemon?.types[0]?.type.name}
      data-type2={pokemon?.types[1]?.type.name}
    >
      <PageTitle
        page={name ? `${LIBRARY_HEADING}: ${name}` : LIBRARY_HEADING}
      />
      <div className="library-hero__field">
        <FieldSky />
        <span className="library-hero__shadow" aria-hidden="true" />
        {hand.length > 0 && (
          //keyed by the Pokémon: a new search deals a new hand, so the
          //deal plays again; the same search never re-deals
          <ul
            key={name ?? "featured"}
            className="library-hero__hand"
            aria-label={LIBRARY_HAND_LABEL}
          >
            {hand.map((card, i) => (
              <li
                key={card.id}
                className="library-hero__slot"
                data-slot={SLOTS[i]}
              >
                <HandCard card={card} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="library-hero__plate on-dark">
        <div className="library-hero__plate-inner">
          {pokemon && (
            <p className="library-hero__dex">{formatDexNumber(pokemon.id)}</p>
          )}
          <h2 id={titleId} className="library-hero__title">
            {title}
          </h2>
          {lead && <p className="library-hero__lead">{lead}</p>}

          <div className="library-hero__search">
            <SearchBar
              onSubmit={onSearch}
              label={LIBRARY_SEARCH_LABEL}
              inputLabel={LIBRARY_SEARCH_LABEL}
              labelVisible
              placeholder={LIBRARY_SEARCH_PLACEHOLDER}
              clearOnSubmit
              submitText
            />
          </div>

          <div className="library-hero__actions">
            <Button variant="light" onClick={onOpenBinder}>
              <Icon name="binder" size={18} />
              {OPEN_BINDER_TEXT}
            </Button>
            {name && (
              <TransitionLink
                variant="ghost"
                to={`/pokemon/${encodeURIComponent(name)}`}
              >
                {libraryEntryText(name)}
              </TransitionLink>
            )}
          </div>
          {name && (
            <Link to={featuredHref} className="library-hero__featured">
              {/* the arrow is decoration; the name is "Featured cards" */}
              <span aria-hidden="true">←</span> {FEATURED_CARDS_LINK}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

//one card of the hand: a real button that opens the dialog, tilting
//toward the pointer like every card. the slot (li) does the fanning, the
//lift inside it rises on hover, the card itself tilts
function HandCard({
  card,
  onSelect,
}: {
  card: TCGCard;
  onSelect: (card: TCGCard) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const holoHandlers = useHoloPointer(ref, true);

  return (
    <button
      ref={ref}
      {...holoHandlers}
      type="button"
      className="library-hero__card holo-target"
      aria-label={describeCard(card)}
      onClick={() => onSelect(card)}
    >
      <span className="library-hero__lift">
        <HoloCard card={card} eager />
      </span>
    </button>
  );
}
