import "./CardsTeaser.css";
import { useId, useRef } from "react";
import { SectionHeading } from "../ui/SectionHeading";
import { HoloCard } from "./HoloCard";
import { TransitionLink } from "./TransitionLink";
import { useInView } from "../hooks/useInView";
import { useTCGLibrary } from "../hooks/useTCGLibrary";
import { pickHand, summarizeCards } from "../lib/tcg";
import { CARDS_LINK_TEXT, cardsTeaserText, seeAllCardsText } from "../lib/copy";

//where the three fanned cards sit, in pickHand's order (rarest first)
const SLOTS = ["center", "left", "right"] as const;

interface CardsTeaserProps {
  name: string;
}

//the cards teaser at the foot of the Pokémon page (spec 7.2). it waits
//until it scrolls into view before asking for cards, so the page never
//waits on the card proxy. two components, because a hook cannot be called
//"only once visible": the outer one watches, the inner one fetches, and it
//only exists once the outer one has seen the screen
export function CardsTeaser({ name }: CardsTeaserProps) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);

  return (
    <div ref={ref} className="cards-teaser-slot">
      {seen && <CardsTeaserContent name={name} />}
    </div>
  );
}

function CardsTeaserContent({ name }: CardsTeaserProps) {
  const headingId = useId();
  const { cards, status } = useTCGLibrary(name);

  //only when the Pokémon has cards: no "loading", no "none", no error.
  //the teaser is an extra; its absence says nothing is missing
  if (status !== "success" || cards.length === 0) return null;

  const fan = pickHand(cards);

  return (
    <section className="cards-teaser" aria-labelledby={headingId}>
      <SectionHeading level={3} id={headingId}>
        {CARDS_LINK_TEXT}
      </SectionHeading>
      <div className="cards-teaser__body">
        {/* the sentence and the link say it all; the fan is for the eye */}
        <ul className="cards-teaser__fan" aria-hidden="true">
          {fan.map((card, i) => (
            <li
              key={card.id}
              className="cards-teaser__card"
              data-slot={SLOTS[i]}
            >
              <HoloCard card={card} />
            </li>
          ))}
        </ul>
        <div className="cards-teaser__text">
          <p className="cards-teaser__sentence">
            {cardsTeaserText(name, summarizeCards(cards))}
          </p>
          <TransitionLink
            variant="dark"
            to={`/library/${encodeURIComponent(name)}`}
          >
            {seeAllCardsText(cards.length)}
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
