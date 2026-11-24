import "./SearchBar.css";
import {
  useId,
  useState,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useAutocomplete } from "../hooks/useAutocomplete";
import { spriteUrlFromId } from "../lib/sprites";
import { formatDexNumber } from "../lib/dex";
import {
  SEARCH_INPUT_LABEL,
  SEARCH_PLACEHOLDER,
  SEARCH_TOGGLE_LABEL,
} from "../lib/copy";
import { Icon } from "./Icon";

interface SearchBarProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
  //names the search landmark, only needed when a page  has more than one search form
  label?: string;
  //names the field itself ("Search Pokémon" unless told otherwise)
  inputLabel?: string;
  //true: that name is shown on screen as a real <label> next to the field
  //(Compare's "First" and "Second", spec 7.3) instead of an aria-label
  labelVisible?: boolean;
  //the input's id. only the header search passes one (SEARCH_INPUT_ID),
  //because other code finds that field by id to focus it. every other
  //search bar gets a unique id of its own from useId
  inputId?: string;
  //true: the field empties after a submit. for pickers whose choice shows
  //up elsewhere on the page (the identity band shows the picked name)
  clearOnSubmit?: boolean;
  //true: the submit button shows its word ("Search") instead of the
  //magnifier (the Library hero, spec 7.4)
  submitText?: boolean;
}

export function SearchBar({
  onSubmit,
  placeholder = SEARCH_PLACEHOLDER,
  label,
  inputLabel = SEARCH_INPUT_LABEL,
  labelVisible = false,
  inputId,
  clearOnSubmit = false,
  submitText = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  //one id "stem" per search bar. Compare shows three search bars at once
  //(header, First, Second); fixed ids like "autocomplete-list" would exist
  //three times, and a duplicated id is invalid HTML that can point
  //aria-controls at the wrong list. useId is unique per component instance
  //and stays the same on every render
  const baseId = useId();
  const fieldId = inputId ?? `${baseId}-input`;
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const {
    matches,
    highlightedIndex,
    setHighlightedIndex,
    isOpen,
    dismiss,
    notifyQueryEdited,
  } = useAutocomplete(query);

  function submit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    dismiss();
    if (clearOnSubmit) setQuery("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit(query);
  }

  function selectMatch(index: number) {
    const name = matches[index]?.name;
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
    highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined;

  return (
    <div className="search-bar-wrapper">
      <form
        className="search-bar"
        onSubmit={handleSubmit}
        role="search"
        aria-label={label}
      >
        {labelVisible && (
          <label className="search-bar__label" htmlFor={fieldId}>
            {inputLabel}
          </label>
        )}
        <input
          ref={inputRef}
          id={fieldId}
          className="search-bar__input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            notifyQueryEdited();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          //a visible <label> already names the field; an aria-label would
          //override it, and the two could drift apart
          aria-label={labelVisible ? undefined : inputLabel}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
        />
        {/* the magnifier IS the submit button: a visible, clickable way to
            search for people who do not press Enter. it comes after the
            input in the DOM (type, then submit, for Tab) and CSS draws it
            at the start of the field, where the spec puts the icon */}
        <button
          type="submit"
          className="search-bar__submit"
          data-text={submitText || undefined}
          //the word, when shown, IS the name; the magnifier needs one
          aria-label={submitText ? undefined : SEARCH_TOGGLE_LABEL}
        >
          {submitText ? SEARCH_TOGGLE_LABEL : <Icon name="search" />}
        </button>
      </form>

      {isOpen && (
        //on-light: the panel is always white, even when the search bar
        //sits on a black plate (Compare's pickers), so it takes the light
        //roles back for everything inside it
        <div className="autocomplete-panel on-light">
          <ul id={listId} role="listbox">
            {matches.map((entry, index) => {
              //null when the entry has no usable number: then no <img> at
              //all, rather than a request for a broken address
              const sprite = spriteUrlFromId(entry.id ?? 0);
              return (
                <li
                  key={entry.name}
                  id={optionId(index)}
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
                  {/* sprite and number are for the eyes only: the option's
                    accessible name stays just the Pokémon's name, so a screen
                    reader is not read "number zero two five" forty times
                    while someone types. the sprite comes from the dex number
                    alone (D51), lazy so a long list loads what is on screen */}
                  {sprite && (
                    <img
                      className="autocomplete-item__sprite"
                      src={sprite}
                      alt=""
                      width={48}
                      height={48}
                      loading="lazy"
                    />
                  )}
                  <span className="autocomplete-item__name">{entry.name}</span>
                  <span className="autocomplete-item__id" aria-hidden="true">
                    {formatDexNumber(entry.id ?? 0)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
