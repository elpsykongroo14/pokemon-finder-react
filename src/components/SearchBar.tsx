import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { useAutocomplete } from "../hooks/useAutocomplete";
import { getSpriteUrl } from "../lib/sprites";

interface SearchBarProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  onSubmit,
  placeholder = "Search Pokémon by name or ID...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    matches,
    highlightedIndex,
    setHighlightedIndex,
    preview,
    isOpen,
    dismiss,
  } = useAutocomplete(query);

  function submit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    dismiss();
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit(query);
  }

  function selectMatch(index: number) {
    const name = matches[index];
    if (!name) return;
    setQuery(name);
    submit(name);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0) {
        e.preventDefault();
        selectMatch(highlightedIndex);
      }
      //otherwise let the form's normal onSubmit handle it
      return;
    }

    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(Math.min(highlightedIndex + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(Math.max(highlightedIndex - 1, 0));
    } else if (e.key === "Escape") {
      dismiss();
    }
  }

  const activeId =
    highlightedIndex >= 0
      ? `autocomplete-option-${highlightedIndex}`
      : undefined;

  return (
    <div className="search-bar-wrapper">
      <form onSubmit={handleSubmit} role="search">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search Pokémon"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="autocomplete-list"
          aria-autocomplete="list"
          aria-activedescendant={activeId}
        />
        <button type="submit">Search</button>
      </form>

      {isOpen && (
        <div className="autocomplete-panel">
          {preview && (
            <div className="autocomplete-preview">
              <img
                src={getSpriteUrl(preview.sprites) ?? ""}
                alt={preview.name}
              />
              <div className="autocomplete-preview-name">{preview.name}</div>
              <div className="autocomplete-preview-id">
                #{String(preview.id).padStart(3, "0")}
              </div>
            </div>
          )}

          <ul id="autocomplete-list" role="listbox">
            {matches.map((name, index) => (
              <li
                key={name}
                id={`autocomplete-option-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                className={
                  index === highlightedIndex
                    ? "autocomplete-item autocomplete-item--active"
                    : "autocomplete-item"
                }
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                //on each <li>.
                //the fix for the focus loss bug, mousedown fires before click, if we let the default mousdown behavior happen
                //the browser blurs the <input> first, calling preventDefault() on mousedown stops the browser from shifting focus at all so the <input> will never actually lose focus during the click
                //and onClick fires normally
                onClick={() => selectMatch(index)}
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
