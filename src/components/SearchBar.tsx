import { useState, type FormEvent } from "react";
interface SearchBarProps {
  onSubmit: (query: string) => void;
}

export function SearchBar({ onSubmit }: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} role="search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Pokémon by name or ID..."
        aria-label="Search Pokémon"
      />
      <button type="submit">Search</button>
    </form>
  );
}
