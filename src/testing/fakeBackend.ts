//the fake back end shared by BOTH test runners: Vitest (jsdom, via a fake
//fetch in src/a11y/fakeApi.ts) and Playwright (a real browser, via request
//interception in e2e/fixtures.ts). it is plain TypeScript with no test
//library imports, which is what lets both use it.
//
//design: the knowledge "which URL gets which answer" lives here ONCE; each
//runner only adds a small adapter that plugs it into its own network layer
//(sometimes called ports and adapters). change a fixture here and every
//test, unit or end-to-end, sees the same world
import type {
  EvolutionChain,
  NamedAPIResourceList,
  PokemonDetails,
  PokemonSpecies,
  TCGCard,
} from "../lib/type";

export const API = "https://pokeapi.co/api/v2";

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

//what the fake back end sends back, independent of any network library
export interface FakeResponse {
  status: number;
  contentType: string;
  body: string;
}

function json(body: unknown): FakeResponse {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body),
  };
}

//answers a URL the app calls, or returns undefined for a URL that is not
//one of our APIs (each adapter decides what "unknown" means for it).
//the order matters: most specific URL shapes first
export function fakeBackend(url: string): FakeResponse | undefined {
  if (url.startsWith(`${API}/pokemon?`)) return json(INDEX);
  if (url.startsWith(`${API}/pokemon-species/`)) return json(SPECIES);
  if (url.startsWith(`${API}/evolution-chain/`)) return json(CHAIN);
  const pokemon = url.match(/pokeapi\.co\/api\/v2\/pokemon\/([^/?]+)/);
  if (pokemon) {
    //the random encounter asks by number; everything else asks by name.
    //each name keeps its own id, because Compare rejects "the same Pokémon
    //twice" and decides that by id
    const key = decodeURIComponent(pokemon[1]);
    const id = Number(key);
    if (!Number.isNaN(id)) return json(makePokemon("pikachu", id));
    if (!(key in IDS)) {
      //an unknown name answers like the real PokéAPI: 404, "Not Found"
      return { status: 404, contentType: "text/plain", body: "Not Found" };
    }
    return json(makePokemon(key, IDS[key]));
  }
  //the TCG proxy: whatever its address (VITE_TCG_PROXY), it is called with ?q=
  if (url.includes("?q=")) return json({ data: CARDS });
  return undefined;
}
