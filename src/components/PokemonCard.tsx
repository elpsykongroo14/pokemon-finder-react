//the container

import "./PokemonCard.css";
import { Stage } from "./Stage";
import { StageConsole } from "../ui/StageConsole";
import { Tabs } from "../ui/Tabs";
import { TabList } from "../ui/TabList";
import { Tab } from "../ui/Tab";
import { TabPanel } from "../ui/TabPanel";
import { StatBarChart } from "./StatBarChart";
import { MetaInfo } from "./MetaInfo";
import { PokemonActions } from "./PokemonActions";
import type { PokemonDetails } from "../lib/type";
import { EvolutionSection } from "./EvolutionSection";

interface PokemonCardProps {
  pokemon: PokemonDetails;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <article className="pokemon-card">
      {/* key={pokemon.name}: a different key tells React "this is a different
          Stage", so it throws the old one away (and its shiny state with it)
          and starts a fresh one. moving pikachu -> charizard resets Shiny */}
      <StageConsole
        stage={<Stage key={pokemon.name} pokemon={pokemon} shinyToggle />}
      >
        <div className="pokemon-card__console">
          <PokemonActions pokemon={pokemon} />

          <Tabs defaultValue="info">
            <TabList aria-label="Pokémon details">
              <Tab value="info">Info</Tab>
              <Tab value="stats">Stats</Tab>
              <Tab value="evolution">Evolution</Tab>
            </TabList>

            <TabPanel value="info">
              <MetaInfo
                height={pokemon.height}
                weight={pokemon.weight}
                abilities={pokemon.abilities}
              />
            </TabPanel>

            {/* keepMounted={false}: the bars mount each time this tab opens,
              so their fill and count-up play when you can actually see them */}
            <TabPanel value="stats" keepMounted={false}>
              <StatBarChart stats={pokemon.stats} />
            </TabPanel>

            <TabPanel value="evolution">
              <EvolutionSection pokemon={pokemon} />
            </TabPanel>
          </Tabs>
        </div>
      </StageConsole>
    </article>
  );
}
