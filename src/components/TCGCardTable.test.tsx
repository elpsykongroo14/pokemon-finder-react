import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TCGCardTable } from "./TCGCardTable";
import type { TCGCard } from "../lib/type";
import { CARDS_LOADING_LABEL } from "../lib/copy";
import { PreferencesProvider } from "../context/PreferencesContext";

const CARDS: TCGCard[] = [
  {
    id: "1",
    name: "Charizard",
    rarity: "Rare Holo",
    set: { name: "Base Set", releaseDate: "1999/01/09" },
  },
  {
    id: "2",
    name: "Abra",
    rarity: "Common",
    set: { name: "Jungle", releaseDate: "1999/06/16" },
  },
  {
    id: "3",
    name: "Blastoise",
    rarity: "Rare",
    set: { name: "Aquapolis", releaseDate: "2003/01/15" },
  },
];

function renderTable(
  overrides: Partial<Parameters<typeof TCGCardTable>[0]> = {},
) {
  const props = {
    cards: CARDS,
    status: "success" as const,
    error: null,
    emptyMessage: "No cards",
    caption: "Featured Cards",
    onSelect: () => {},
    ...overrides,
  };
  //the provider: the error and empty sentences sit in the battle dialog,
  //which reads the animation preference (B&W-8)
  return render(
    <PreferencesProvider>
      <TCGCardTable {...props} />
    </PreferencesProvider>,
  );
}

//the card names in the order the rows are currently shown.
//changed in B&W-7: the row's header cell now holds the set under the name
//(spec 7.4), so the name is read from the cell's button
function shownNames(): (string | null)[] {
  return screen
    .getAllByRole("rowheader")
    .map((cell) => within(cell).getByRole("button").textContent);
}

describe("TCGCardTable", () => {
  it("is a real table, named by its caption, with a header and one row per card", () => {
    renderTable();

    expect(
      screen.getByRole("table", { name: "Featured Cards" }),
    ).toBeInTheDocument();
    //B&W-7: picture, Card, Number, Released, Rarity, Artist (spec 7.4)
    expect(screen.getAllByRole("columnheader")).toHaveLength(6);
    //one header row plus one row per card
    expect(screen.getAllByRole("row")).toHaveLength(CARDS.length + 1);
    expect(shownNames()).toEqual(["Charizard", "Abra", "Blastoise"]);
  });

  it("shows set, rarity and release date, with fallbacks for missing values", () => {
    renderTable({ cards: [{ id: "9", name: "Mystery" }] });

    expect(screen.getByText("Unknown set")).toBeInTheDocument();
    expect(screen.getByText("unknown")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("starts unsorted: no column announces a direction, rows keep their order", () => {
    renderTable();

    for (const name of ["Card", "Released", "Rarity"]) {
      expect(screen.getByRole("columnheader", { name })).toHaveAttribute(
        "aria-sort",
        "none",
      );
    }
    expect(shownNames()).toEqual(["Charizard", "Abra", "Blastoise"]);
  });

  it("cycles a column ascending, descending, then back to the original order", async () => {
    const user = userEvent.setup();
    renderTable();
    //B&W-7: the name column is headed "Card" now (spec 7.4)
    const nameButton = screen.getByRole("button", { name: "Card" });
    const nameHeader = screen.getByRole("columnheader", { name: "Card" });

    await user.click(nameButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(shownNames()).toEqual(["Abra", "Blastoise", "Charizard"]);

    await user.click(nameButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    expect(shownNames()).toEqual(["Charizard", "Blastoise", "Abra"]);

    await user.click(nameButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "none");
    expect(shownNames()).toEqual(["Charizard", "Abra", "Blastoise"]);
  });

  it("only one column is sorted at a time", async () => {
    const user = userEvent.setup();
    renderTable();

    //B&W-7: there is no Set column any more; Released stands in for it
    await user.click(screen.getByRole("button", { name: "Card" }));
    await user.click(screen.getByRole("button", { name: "Released" }));

    expect(
      screen.getByRole("columnheader", { name: "Released" }),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: "Card" })).toHaveAttribute(
      "aria-sort",
      "none",
    );
  });

  it("sorts the Rarity column by rank, not alphabetically", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: "Rarity" }));

    //Common < Rare < Rare Holo
    expect(shownNames()).toEqual(["Abra", "Blastoise", "Charizard"]);
  });

  it("opens a card with a real button, by click and by keyboard", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    renderTable({ onSelect: handleSelect });

    await user.click(screen.getByRole("button", { name: "Abra" }));
    expect(handleSelect).toHaveBeenCalledWith(CARDS[1]);

    screen.getByRole("button", { name: "Blastoise" }).focus();
    await user.keyboard("{Enter}");
    expect(handleSelect).toHaveBeenLastCalledWith(CARDS[2]);
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });

  it("tags each row with its rarity tier", () => {
    renderTable();

    expect(screen.getByRole("row", { name: /Charizard/ })).toHaveAttribute(
      "data-rarity",
      "holo",
    );
    expect(screen.getByRole("row", { name: /Abra/ })).toHaveAttribute(
      "data-rarity",
      "common",
    );
  });

  //B&W-7 (spec 7.4): the set under the name, the number, a readable date,
  //the tier mark, and the artist or "Not listed"
  it("shows the number, a readable date, the tier mark and the artist", () => {
    renderTable({
      cards: [
        {
          id: "sv8-240",
          name: "Hydreigon ex",
          number: "240",
          rarity: "Special Illustration Rare",
          artist: "Akira Egawa",
          set: {
            name: "Surging Sparks",
            printedTotal: 191,
            releaseDate: "2024/11/08",
          },
        },
      ],
    });

    const row = screen.getByRole("row", { name: /Hydreigon ex/ });
    expect(row).toHaveTextContent("Surging Sparks");
    expect(row).toHaveTextContent("240/191");
    expect(row).toHaveTextContent("8 Nov 2024");
    expect(row).toHaveTextContent("Akira Egawa");
    expect(row.querySelector(".tier-mark")).toHaveAttribute(
      "data-rarity",
      "ultra",
    );
  });

  it("says Not listed for a card without an artist", () => {
    renderTable({ cards: [{ id: "9", name: "Mystery", number: "1" }] });

    expect(screen.getByText("Not listed")).toBeInTheDocument();
  });

  it("names the picture column for screen readers, and keeps the picture itself silent", () => {
    renderTable({
      cards: [{ id: "9", name: "Mystery", images: { small: "m.png" } }],
    });

    expect(
      screen.getByRole("columnheader", { name: "Picture" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute("src", "m.png");
  });

  it("shows one loading status and no table while loading", () => {
    renderTable({ status: "loading", cards: [] });

    expect(
      screen.getByRole("status", { name: CARDS_LOADING_LABEL }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows the error text, or the empty message, instead of a table", () => {
    const { unmount } = renderTable({
      status: "error",
      error: "Could not load cards",
      cards: [],
    });
    //changed in B&W-8: the sentence sits in the battle dialog now (spec
    //7.6), which needs the preferences (it types) and speaks through a live
    //region, so it is found by its role instead of a bare paragraph
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load cards");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    unmount();

    renderTable({ status: "empty", cards: [], emptyMessage: "Nothing here" });
    expect(screen.getByRole("status")).toHaveTextContent("Nothing here");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
