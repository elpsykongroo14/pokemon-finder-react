import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchPokemon,
  fetchSpecies,
  fetchTCGCards,
  fetchEvolutionChain,
  fetchTCGCardsBatch,
  fetchAllpokemonNames,
  clearPokeCache,
  fetchPokemonIndex,
} from "./api.ts";
import { HttpError } from "./httpError.ts";

function fakeResponse(ok: boolean, body: unknown) {
  return { ok, status: ok ? 200 : 404, json: async () => body };
}

let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn()); //a fresh mock for every test - no leftover behavior
  mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
  clearPokeCache(); //a fresh cache for every test - no leftover data
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("fetchPokemon", () => {
  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValue(
      fakeResponse(true, { name: "pikachu", id: 25 }),
    );
    const data = await fetchPokemon("pikachu");
    expect(data).toEqual({ name: "pikachu", id: 25 });
  });

  it("calls the correct pokeAPI url, lowercased and trimmed", async () => {
    mockFetch.mockResolvedValue(fakeResponse(true, { name: "pikachu" }));
    await fetchPokemon(" PIKACHU ");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon/pikachu",
      {},
    );
  });

  it("throws when the response is not ok", async () => {
    mockFetch.mockResolvedValue(fakeResponse(false, {}));
    await expect(fetchPokemon("not-a-real-pokemon")).rejects.toThrow(
      /HTTP 404/,
    );
  });

  it("throws an HttpError that carries the status code", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

    const error = await fetchPokemon("pikachu").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(503);
  });

  it("does not call fetch twice for the same name (cache hit)", async () => {
    mockFetch.mockResolvedValue(
      fakeResponse(true, { name: "pikachu", id: 25 }),
    );
    await fetchPokemon("pikachu");
    await fetchPokemon("pikachu");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});

describe("fetchSpecies", () => {
  it("forwards the given url as-is", async () => {
    mockFetch.mockResolvedValue(fakeResponse(true, { flavor: "text" }));
    await fetchSpecies("https://pokeapi.co/api/v2/pokemon-species/25/");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon-species/25/",
      {},
    );
  });

  it("does not call fetch twice for the same url (cache hit)", async () => {
    mockFetch.mockResolvedValue(fakeResponse(true, { flavor: "text" }));
    const url = "https://pokeapi.co/api/v2/pokemon-species/25/";
    await fetchSpecies(url);
    await fetchSpecies(url);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});

describe("fetchTCGCards", () => {
  it("returns the data array from the response", async () => {
    mockFetch.mockResolvedValue(
      fakeResponse(true, { data: [{ id: "card-1" }] }),
    );
    const cards = await fetchTCGCards("pikachu");
    expect(cards).toEqual([{ id: "card-1" }]);
  });

  it("turns a raw rarity code into a name before anyone sees it", async () => {
    mockFetch.mockResolvedValue(
      fakeResponse(true, {
        data: [
          { id: "card-1", rarity: "MEGA_ATTACK_RARE" },
          { id: "card-2", rarity: "Rare Holo" },
        ],
      }),
    );
    const cards = await fetchTCGCards("froslass");
    expect(cards.map((card) => card.rarity)).toEqual([
      "Mega Attack Rare",
      "Rare Holo",
    ]);
  });

  it("returns an empty array when the response has no data field", async () => {
    mockFetch.mockResolvedValue(fakeResponse(true, {}));
    const cards = await fetchTCGCards("pikachu");
    expect(cards).toEqual([]);
  });

  it("percent-encodes special characters instead of injecting new params", async () => {
    mockFetch.mockResolvedValue(fakeResponse(true, { data: [] }));
    await fetchTCGCards("pikachu&pageSize=1");
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).not.toContain("&pageSize=1");
    expect(calledUrl).toContain("pikachu%26pageSize%3D1");
  });

  //reported after B&W-8: the card proxy answers 500 now and then (the API
  //behind it sends an empty body), and the Pokémon page's teaser simply
  //hid. one quiet second try, after a short pause, usually gets the cards
  it("tries once more after a server error, and returns the second answer", async () => {
    vi.useFakeTimers();
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce(fakeResponse(true, { data: [{ id: "card-1" }] }));

    const pending = fetchTCGCards("eevee");
    await vi.runAllTimersAsync();

    await expect(pending).resolves.toEqual([{ id: "card-1" }]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("gives up after the second server error", async () => {
    vi.useFakeTimers();
    mockFetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    });

    const pending = fetchTCGCards("eevee");
    const check = expect(pending).rejects.toBeInstanceOf(HttpError);
    await vi.runAllTimersAsync();

    await check;
    expect(mockFetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  //a 404 or 429 will not change by asking again at once
  it("does not retry an answer that is not a server error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    });

    await expect(fetchTCGCards("eevee")).rejects.toBeInstanceOf(HttpError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  //the Pokémon page's teaser and the Library ask for the same cards: the
  //second asks the memory, not the proxy (which limits requests per minute)
  it("does not call the proxy twice for the same search (cache hit)", async () => {
    mockFetch.mockResolvedValue(
      fakeResponse(true, { data: [{ id: "card-1" }] }),
    );

    await fetchTCGCards("pikachu");
    const again = await fetchTCGCards("pikachu");

    expect(again).toEqual([{ id: "card-1" }]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("throws a clear, actionable error when VITE_TCG_PROXY is not configured", async () => {
    //TCG_PROXY is captured once at module import time into a module-level const -
    //stubbing the env after api.ts is already loaded wouldnt do anything,
    //since nothing re-reads import.meta.env after that first read.
    //vi.resetModules() + a dynamic import gives us a *fresh* evaluation of api.ts
    //one that picks up the stubbed (empty) env value from scratch.
    vi.stubEnv("VITE_TCG_PROXY", "");
    vi.resetModules();
    const freshApi = await import("./api.ts");

    await expect(freshApi.fetchTCGCards("pikachu")).rejects.toThrow(
      /VITE_TCG_PROXY is not set/,
    );

    vi.unstubAllEnvs(); //dont leak this stub into later tests
  });
});

describe("fetchTCGCardsBatch", () => {
  it("flattens results from multiple names into one array", async () => {
    mockFetch
      .mockResolvedValueOnce(fakeResponse(true, { data: [{ id: "pika-1" }] }))
      .mockResolvedValueOnce(fakeResponse(true, { data: [{ id: "char-1" }] }));
    const cards = await fetchTCGCardsBatch(["pikachu", "charmander"]);
    expect(cards).toEqual([{ id: "pika-1" }, { id: "char-1" }]);
  });

  it("swallows a single failed name instead of rejecting the whole batch", async () => {
    mockFetch
      .mockResolvedValueOnce(fakeResponse(true, { data: [{ id: "pika-1" }] }))
      .mockResolvedValueOnce(fakeResponse(false, {}));
    const cards = await fetchTCGCardsBatch(["pikachu", "charmander"]);
    expect(cards).toEqual([{ id: "pika-1" }]);
  });
});

describe("fetchEvolutionChain", () => {
  it("forwards the given url as-is", async () => {
    mockFetch.mockResolvedValue(fakeResponse(true, { chain: {} }));
    await fetchEvolutionChain("https://pokeapi.co/api/v2/evolution-chain/10/");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/evolution-chain/10/",
      {},
    );
  });

  it("does not call fetch twice for the same url (cache hit)", async () => {
    mockFetch.mockResolvedValue(fakeResponse(true, { chain: {} }));
    const url = "https://pokeapi.co/api/v2/evolution-chain/10/";
    await fetchEvolutionChain(url);
    await fetchEvolutionChain(url);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});

describe("fetchAllpokemonNames", () => {
  it("returns just the names from the api's {results} shape", async () => {
    mockFetch.mockResolvedValue(
      fakeResponse(true, {
        results: [
          { name: "bulbasaur", url: "..." },
          { name: "ivysaur", url: "..." },
        ],
      }),
    );
    const names = await fetchAllpokemonNames();
    expect(names).toEqual(["bulbasaur", "ivysaur"]);
  });

  it("does not call fetch twice across calls (cache hit)", async () => {
    mockFetch.mockResolvedValue(
      fakeResponse(true, { results: [{ name: "bulbasaur", url: "..." }] }),
    );
    await fetchAllpokemonNames();
    await fetchAllpokemonNames();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});

describe("fetchPokemonIndex", () => {
  it("pairs each name with the number found in its url", async () => {
    mockFetch.mockResolvedValue(
      fakeResponse(true, {
        results: [
          { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
          { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon/25/" },
        ],
      }),
    );

    expect(await fetchPokemonIndex()).toEqual([
      { name: "bulbasaur", id: 1 },
      { name: "pikachu", id: 25 },
    ]);
  });

  it("shares one request and one cache with fetchAllpokemonNames", async () => {
    mockFetch.mockResolvedValue(
      fakeResponse(true, {
        results: [
          { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
        ],
      }),
    );

    await fetchPokemonIndex();
    const names = await fetchAllpokemonNames();

    expect(names).toEqual(["bulbasaur"]);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
