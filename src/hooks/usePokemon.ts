import { useState, useEffect } from "react";
import { fetchPokemon } from "../lib/api";
import type { PokemonDetails } from "../lib/type";

interface UsePokemonResult {
  data: PokemonDetails | null;
  loading: boolean;
  error: string | null;
}

export function usePokemon(name: string): UsePokemonResult {
  const [data, setData] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name.trim()) {
      return;
    }

    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPokemon(name, { signal: controller.signal });
        setData(result);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    run();

    return () => {
      controller.abort();
    };
  }, [name]);

  return { data, loading, error };
}
