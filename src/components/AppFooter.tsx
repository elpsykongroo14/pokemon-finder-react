import "./AppFooter.css";
import {
  FOOTER_DISCLAIMER,
  FOOTER_MADE_BY,
  FOOTER_SOURCES_LABEL,
} from "../lib/copy";

//data, not markup: adding a credit is adding one line here, and the test
//can check every link without repeating the list
const CREDITS = [
  {
    label: "PokéAPI",
    role: "Pokémon data and sprites",
    href: "https://pokeapi.co",
  },
  {
    label: "Pokémon TCG API",
    role: "card data and images",
    href: "https://pokemontcg.io",
  },
  {
    label: "Jersey 10 & Nunito",
    role: "fonts, SIL Open Font License",
    href: "https://fontsource.org",
  },
] as const;

const AUTHOR_URL = "https://github.com/elpsykongroo14";

//a <footer> that belongs to the whole page (not inside <main>, an article or section)
//is the "contentinfo" landmark: screen readers list it as the
//place for credits, copyright and legal text, which is exactly  this
export function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="app-footer__disclaimer">{FOOTER_DISCLAIMER}</p>

      <div className="app-footer__credits">
        <span className="app-footer__label">{FOOTER_SOURCES_LABEL}</span>
        <ul className="app-footer__list">
          {CREDITS.map((credit) => (
            <li key={credit.href}>
              <a href={credit.href}>{credit.label}</a>
              <span className="app-footer__role">({credit.role})</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="app-footer__author">
        {FOOTER_MADE_BY} <a href={AUTHOR_URL}>elpsykongroo14</a>
      </p>
    </footer>
  );
}
