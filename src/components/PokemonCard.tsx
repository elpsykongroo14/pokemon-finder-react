//the container

import "./PokemonCard.css";
import { useState } from "react";
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
  //shiny lives here, not in Stage: the checkbox (Console) and the
  //sprite (Stage) both need it, so their closest shared parent owns it
  const [shiny, setShiny] = useState(false);

  return (
    <article className="pokemon-card">
      <StageConsole stage={<Stage pokemon={pokemon} shiny={shiny} />}>
        <PokemonActions
          pokemon={pokemon}
          shiny={shiny}
          onShinyChange={setShiny}
        />

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
      </StageConsole>
    </article>
  );
}
