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
      setData(null);
      setError(null);
      return;
    }

    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchPokemon(name, { signal: controller.signal })
      .then((result) => {
        setData(result);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [name]);

  return { data, loading, error };
}
