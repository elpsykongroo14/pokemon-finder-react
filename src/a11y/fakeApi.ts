//a fake network for page-level tests: replaces the global fetch with a
//small router that answers every URL the app calls with fixture data.
//
//why fake the network and not hooks/components (like the page tests
//do): an accessibility check is only worth something on the real markup.
//mocking PokemonCard to a <div> would hide every violation inside it,
//the network is the one boundary we cant use in tests, so its the only thing we replace
import { vi } from "vitest";
import type {
  EvolutionChain,
  NamedAPIResourceList,
  PokemonDetails,
  PokemonSpecies,
  TCGCard,
} from "../lib/type";

const API = "https://pokeapi.co/api/v2";

export function makePokemon(name: string, id: number): PokemonDetails {
  const img = `https://img.test/${id}`;
  return {
    name,
    id,
    height: 4,
    weight: 60,
    types: [
      { slot: 1, type: { name: "electric", url: "" } },
      { slot: 2, type: { name: "flying", url: "" } },
    ],
    sprites: {
      front_default: `${img}/pixel.png`,
      front_shiny: `${img}/pixel-shiny.png`,
      other: {
        "official-artwork": {
          front_default: `${img}/art.png`,
          front_shiny: `${img}/art-shiny.png`,
        },
      },
      versions: {
        "generation-v": {
          "black-white": {
            animated: {
              front_default: `${img}/anim.gif`,
              front_shiny: `${img}/anim-shiny.gif`,
            },
          },
        },
      },
    },
    abilities: [
      { is_hidden: false, slot: 1, ability: { name: "static", url: "" } },
      { is_hidden: true, slot: 3, ability: { name: "lightning-rod", url: "" } },
    ],
    stats: [
      ["hp", 35],
      ["attack", 55],
      ["defense", 40],
      ["special-attack", 50],
      ["special-defense", 50],
      ["speed", 90],
    ].map(([stat, base]) => ({
      base_stat: base as number,
      effort: 0,
      stat: { name: stat as string, url: "" },
    })),
    species: { name, url: `${API}/pokemon-species/${id}/` },
  };
}

const SPECIES: PokemonSpecies = {
  evolution_chain: { url: `${API}/evolution-chain/10/` },
  flavor_text_entries: [
    {
      flavor_text: "It keeps its tail raised to monitor its surroundings.",
      language: { name: "en", url: "" },
    },
  ],
};

const CHAIN: EvolutionChain = {
  id: 10,
  chain: {
    species: { name: "pichu", url: `${API}/pokemon-species/172/` },
    evolves_to: [
      {
        species: { name: "pikachu", url: `${API}/pokemon-species/25/` },
        evolves_to: [
          {
            species: { name: "raichu", url: `${API}/pokemon-species/26/` },
            evolves_to: [],
          },
        ],
      },
    ],
  },
};

const INDEX: NamedAPIResourceList = {
  count: 3,
  next: null,
  previous: null,
  results: [
    { name: "pichu", url: `${API}/pokemon/172/` },
    { name: "pikachu", url: `${API}/pokemon/25/` },
    { name: "raichu", url: `${API}/pokemon/26/` },
  ],
};

const IDS: Record<string, number> = { pichu: 172, pikachu: 25, raichu: 26 };

//one card per rarity tier, so the holo/tier styling is all on the page
const RARITIES = ["Common", "Rare Holo", "Rare Ultra", "Illustration Rare"];
const CARDS: TCGCard[] = RARITIES.map((rarity, i) => ({
  id: `sv1-${i + 1}`,
  name: "Pikachu",
  hp: "60",
  rarity,
  artist: "Test Artist",
  supertypes: ["Pokémon"],
  images: {
    small: `https://cards.test/${i}.png`,
    large: `https://cards.test/${i}_hires.png`,
  },
  set: { name: "Test Set", releaseDate: `2024/0${i + 1}/01` },
}));

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

//the order matters: most specific URL shapes first
function route(url: string): Response {
  if (url.startsWith(`${API}/pokemon?`)) return json(INDEX);
  if (url.startsWith(`${API}/pokemon-species/`)) return json(SPECIES);
  if (url.startsWith(`${API}/evolution-chain/`)) return json(CHAIN);
  const pokemon = url.match(/\/pokemon\/([^/?]+)/);
  if (pokemon) {
    //the random encounter asks by number; everything else asks by name.
    //each name keeps its own id, because compare rejects "the same pokemon twice"
    //and decides that by id
    const key = pokemon[1];
    const id = Number(key);
    if (!Number.isNaN(id)) return json(makePokemon("pikachu", id));
    return json(makePokemon(key, IDS[key] ?? 132));
  }
  //the TCG proxy (VITE_TCG_PROXY comes from .env.test)
  if (url.includes("?q=")) return json({ data: CARDS });
  //an unknown URL is a bug in the test, so say so loudly
  return new Response(`fakeApi: no route for ${url}`, { status: 599 });
}

//installs the fake; vi.unstubAllGlobals() in afterEach removes it
export function installFakeApi(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      return route(url);
    }),
  );
}
