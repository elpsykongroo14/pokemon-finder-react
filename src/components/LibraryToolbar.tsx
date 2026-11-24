import "./LibraryToolbar.css";
import { useId } from "react";
import { SegmentedControl } from "../ui/SegmentedControl";
import { Select } from "../ui/Select";
import { Icon } from "./Icon";
import { TierSwatch } from "./TierMark";
import { countTiers, type RarityTier, type SortMode } from "../lib/tcg";
import type { LibraryView } from "../lib/libraryView";
import type { libraryStatus } from "../lib/tcgLibraryReducer";
import type { TCGCard } from "../lib/type";
import {
  LIBRARY_VIEW_LABEL,
  RARITY_LEGEND_LABEL,
  SORT_LABEL,
  SORT_OPTION_LABELS,
  TIER_LABELS,
  cardCountText,
} from "../lib/copy";

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid", icon: <Icon name="grid" size={16} /> },
  { value: "table", label: "Table", icon: <Icon name="list" size={16} /> },
  { value: "binder", label: "Binder", icon: <Icon name="binder" size={16} /> },
] as const satisfies readonly {
  value: LibraryView;
  label: string;
  icon: React.ReactNode;
}[];

const TIERS: RarityTier[] = ["ultra", "holo", "rare", "common"];
const SORT_MODES: SortMode[] = ["newest", "oldest", "rarity"];

interface LibraryToolbarProps {
  cards: TCGCard[];
  status: libraryStatus;
  view: LibraryView;
  onViewChange: (view: LibraryView) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
}

//the Library's sticky toolbar (spec 7.4): how many cards, how many in each
//tier, which view, which order. it stays at the top while the cards scroll
export function LibraryToolbar({
  cards,
  status,
  view,
  onViewChange,
  sortMode,
  onSortChange,
}: LibraryToolbarProps) {
  const sortId = useId();
  const ready = status === "success";
  const tiers = countTiers(cards);

  return (
    <div className="library-toolbar">
      <div className="library-toolbar__inner">
        {/* always in the page, so a change of count is announced; empty
            while loading rather than a misleading "0 cards" */}
        <p className="library-toolbar__count" aria-live="polite">
          {ready ? cardCountText(cards.length) : ""}
        </p>

        {ready && (
          <ul
            className="library-toolbar__legend"
            aria-label={RARITY_LEGEND_LABEL}
          >
            {TIERS.map((tier) => (
              <li key={tier}>
                <TierSwatch tier={tier} />
                {`${TIER_LABELS[tier]} ${tiers[tier]}`}
              </li>
            ))}
          </ul>
        )}

        <div className="library-toolbar__end">
          <SegmentedControl
            label={LIBRARY_VIEW_LABEL}
            options={VIEW_OPTIONS}
            value={view}
            onChange={onViewChange}
          />
          <div className="library-toolbar__sort">
            <label htmlFor={sortId}>{SORT_LABEL}</label>
            <Select
              id={sortId}
              value={sortMode}
              onChange={(event) => onSortChange(event.target.value as SortMode)}
            >
              {SORT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {SORT_OPTION_LABELS[mode]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
