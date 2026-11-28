import "./PokemonReadout.css";
import { useId, type ReactNode } from "react";
import { StatBarChart } from "./StatBarChart";
import { MetaInfo } from "./MetaInfo";
import { EvolutionSection } from "./EvolutionSection";
import { TypeMatchups } from "./TypeMatchups";
import { SectionHeading } from "../ui/SectionHeading";
import { Tabs } from "../ui/Tabs";
import { TabList } from "../ui/TabList";
import { Tab } from "../ui/Tab";
import { TabPanel } from "../ui/TabPanel";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { STACKED_QUERY } from "../lib/breakpoints";
import {
  EVOLUTION_HEADING,
  MATCHUPS_HEADING,
  MATCHUPS_TAB,
  PROFILE_HEADING,
  READOUT_LABEL,
  STATS_HEADING,
  STATS_TAB,
} from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

interface PokemonReadoutProps {
  pokemon: PokemonDetails;
}

//a headed section of the desktop grid. h3: the Pokémon's name (h2, on the
//plate) is what these sections are about. aria-labelledby turns each one
//into a named region a screen reader can jump to
function ReadoutSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section className="readout__section" aria-labelledby={headingId}>
      <SectionHeading level={3} id={headingId}>
        {heading}
      </SectionHeading>
      {children}
    </section>
  );
}

//everything below the field (spec 7.2, D57). desktop shows all four
//sections at once in a grid; phones keep one panel at a time behind tabs.
//
//why JS (useMediaQuery) and not just CSS: the two layouts are different
//MARKUP, not different looks. tabs have ARIA roles (tablist, tab, tabpanel)
//that promise "one of these is shown, the others are hidden". if CSS
//showed all four panels on desktop, those roles would describe something
//that is not on screen. so each width renders the structure that is true
export function PokemonReadout({ pokemon }: PokemonReadoutProps) {
  const stacked = useMediaQuery(STACKED_QUERY);
  const types = pokemon.types.map((t) => t.type.name);

  //each section's content is built once, and placed by either layout
  const stats = <StatBarChart stats={pokemon.stats} />;
  const profile = (
    <MetaInfo
      height={pokemon.height}
      weight={pokemon.weight}
      abilities={pokemon.abilities}
    />
  );
  //phones keep it in a hidden tab: its sprites load up front, so the
  //panel is ready when the tab opens (a lazy image in a hidden panel
  //waits for the tab)
  const evolution = (
    <EvolutionSection pokemon={pokemon} lazySprites={!stacked} />
  );
  const matchups = <TypeMatchups types={types} />;

  if (stacked) {
    return (
      <div className="readout" data-layout="tabs">
        <Tabs defaultValue="stats">
          <TabList aria-label={READOUT_LABEL}>
            <Tab value="stats">{STATS_TAB}</Tab>
            <Tab value="profile">{PROFILE_HEADING}</Tab>
            <Tab value="evolution">{EVOLUTION_HEADING}</Tab>
            <Tab value="matchups">{MATCHUPS_TAB}</Tab>
          </TabList>
          {/* keepMounted={false}: the bars mount each time this tab opens,
              so they grow when you can actually see them */}
          <TabPanel value="stats" keepMounted={false}>
            {stats}
          </TabPanel>
          <TabPanel value="profile">{profile}</TabPanel>
          <TabPanel value="evolution">{evolution}</TabPanel>
          <TabPanel value="matchups">{matchups}</TabPanel>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="readout" data-layout="grid">
      <ReadoutSection heading={STATS_HEADING}>{stats}</ReadoutSection>
      <ReadoutSection heading={PROFILE_HEADING}>{profile}</ReadoutSection>
      <ReadoutSection heading={EVOLUTION_HEADING}>{evolution}</ReadoutSection>
      <ReadoutSection heading={MATCHUPS_HEADING}>{matchups}</ReadoutSection>
    </div>
  );
}
