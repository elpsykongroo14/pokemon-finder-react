import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchPokemon,
  fetchSpecies,
  fetchTCGCards,
  fetchEvolutionChain,
  fetchTCGCardsBatch,
  fetchAllpokemonNames,
  clearPokeCache,
} from "./api.ts";

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
