import "./AppFooter.css";
import { FOOTER_DISCLAIMER, FOOTER_MADE_BY } from "../lib/copy";

//data, not markup: adding a credit is adding one line here, and the test
//can check every link without repeating the list. "what" is the one-word
//prefix that says what we took from the source
const CREDITS = [
  { what: "Data", label: "PokéAPI", href: "https://pokeapi.co" },
  { what: "Cards", label: "Pokémon TCG API", href: "https://pokemontcg.io" },
  {
    what: "Fonts",
    label: "Jersey 10 & Nunito",
    href: "https://fontsource.org",
  },
] as const;

const AUTHOR_URL = "https://github.com/elpsykongroo14";

//a <footer> that belongs to the whole page (not inside <main>, an article or
//a section) is the "contentinfo" landmark: screen readers list it as the
//place for credits, copyright and legal text, which is exactly this.
//two short lines: what this is (legal), then who made what (credits)
export function AppFooter() {
  return (
    <footer className="app-footer">
      <p>{FOOTER_DISCLAIMER}</p>
      <ul className="app-footer__credits">
        {CREDITS.map((credit) => (
          <li key={credit.href}>
            {credit.what} <a href={credit.href}>{credit.label}</a>
          </li>
        ))}
        <li>
          {FOOTER_MADE_BY} <a href={AUTHOR_URL}>elpsykongroo14</a>
        </li>
      </ul>
    </footer>
  );
}
