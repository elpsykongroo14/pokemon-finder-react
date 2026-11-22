import "./HeaderSearch.css";
import { useEffect, useId, useState } from "react";
import { SearchBar } from "./SearchBar";
import { IconButton } from "../ui/IconButton";
import { Icon } from "./Icon";
import { SEARCH_INPUT_ID } from "../lib/ids";
import { SEARCH_TOGGLE_LABEL } from "../lib/copy";

interface HeaderSearchProps {
  onSubmit: (query: string) => void;
}

//the header's search. desktop: the field, always there. phones (spec 8):
//the top bar has no room, so the field hides behind a search icon button.
//
//a disclosure, the simplest ARIA pattern: a button with aria-expanded
//(open or not) and aria-controls (which element it opens). CSS does the
//hiding, and only below 1000 px; desktop never sees the button
export function HeaderSearch({ onSubmit }: HeaderSearchProps) {
  const [open, setOpen] = useState(false);
  const fieldId = useId();

  //opening is a request to type: put the cursor in the field. this is an
  //effect, not code in the click handler, because the field only becomes
  //visible (focusable) after React has rendered data-open onto it
  useEffect(() => {
    if (open) document.getElementById(SEARCH_INPUT_ID)?.focus();
  }, [open]);

  function handleSubmit(query: string) {
    onSubmit(query);
    setOpen(false); //the search took you somewhere: fold the field away
  }

  return (
    <div className="header-search">
      <div
        id={fieldId}
        className="header-search__field"
        data-open={open || undefined}
      >
        <SearchBar onSubmit={handleSubmit} />
      </div>
      <span className="header-search__toggle">
        <IconButton
          icon={<Icon name="search" />}
          aria-label={SEARCH_TOGGLE_LABEL}
          aria-expanded={open}
          aria-controls={fieldId}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        />
      </span>
    </div>
  );
}
