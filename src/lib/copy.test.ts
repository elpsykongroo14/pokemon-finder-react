import { describe, it, expect } from "vitest";
import {
  encounterMessage,
  failureMessage,
  multiplierText,
  multiplierSpoken,
  partyCountText,
  favoriteNote,
  teamNote,
  teamCommandHint,
  compareVerdict,
  statLeadText,
  teamBandText,
  emptySlotLabel,
  FIRST_FAVORITE,
} from "./copy";

describe("EncounterMessage", () => {
  it("announces the wild pokemon in capitals, then ask what to do", () => {
    expect(encounterMessage("pikachu")).toBe(
      "A wild PIKACHU appeared!\nWhat will you do?",
    );
  });
});

describe("failureMessage", () => {
  it("names the query and says what to try when nothing was found", () => {
    expect(failureMessage("not-found", "missingno")).toBe(
      'No Pokémon named "missingno" was found. Check the spelling or try its Pokédex number.',
    );
  });

  it("blames the connection, not the user, when Pokedex is unreachable", () => {
    expect(failureMessage("unreachable", "pikachu")).toBe(
      "Couldn't reach the Pokédex. Check your connection and try again.",
    );
  });

  it("does not leak the query into the unreachable message", () => {
    expect(failureMessage("unreachable", "pikachu")).not.toContain("pikachu");
  });
});

describe("multiplierText", () => {
  //the badge inside a type chip is one glyph wide, so halves and quarters
  //use the fraction characters instead of "0.5"
  it.each([
    [4, "×4"],
    [2, "×2"],
    [1, "×1"],
    [0.5, "×½"],
    [0.25, "×¼"],
    [0, "×0"],
  ])("writes %s as %s", (multiplier, text) => {
    expect(multiplierText(multiplier)).toBe(text);
  });
});

describe("multiplierSpoken", () => {
  //what a screen reader hears instead of "times one half"
  it.each([
    [4, "4 times damage"],
    [2, "2 times damage"],
    [1, "normal damage"],
    [0.5, "half damage"],
    [0.25, "quarter damage"],
    [0, "no damage"],
  ])("says %s as %s", (multiplier, words) => {
    expect(multiplierSpoken(multiplier)).toBe(words);
  });
});

//the Team page's title band (spec 7.5): how full the party is, and the
//reassurance that it is kept; a full party gets its own line
describe("teamBandText", () => {
  it("counts the filled slots and says where the team is saved", () => {
    expect(teamBandText(4)).toBe(
      "4 of 6 slots filled. Your team is saved in this browser.",
    );
    expect(teamBandText(0)).toBe(
      "0 of 6 slots filled. Your team is saved in this browser.",
    );
  });

  it("says the party is ready when all six slots are filled", () => {
    expect(teamBandText(6)).toBe("Six of six. Your party is ready.");
  });
});

//changed in B&W-6: this used to be a hidden "Empty slot 5". the slot now
//says it on screen (spec 7.5), so the eye and the ear get the same words
describe("emptySlotLabel", () => {
  it("names the open slot by its position", () => {
    expect(emptySlotLabel(5)).toBe("Slot 5 is open");
  });
});

describe("partyCountText", () => {
  //read right after the visible word "Party", so the link is named
  //"Party, 4 of 6": the name starts with what the eye sees (D45, WCAG 2.5.3)
  it("counts the party out of the maximum", () => {
    expect(partyCountText(4, 6)).toBe(", 4 of 6");
    expect(partyCountText(0, 6)).toBe(", 0 of 6");
  });
});

//the inline confirmation under the Pokémon page actions (spec 6.2): one
//sentence about what the last click did
describe("favoriteNote", () => {
  it("confirms a save", () => {
    expect(favoriteNote({ added: true, first: false })).toBe(
      "Saved to your favorites.",
    );
  });

  it("confirms a removal", () => {
    expect(favoriteNote({ added: false, first: false })).toBe(
      "Removed from favorites.",
    );
  });

  it("celebrates the very first favorite instead", () => {
    expect(favoriteNote({ added: true, first: true })).toBe(FIRST_FAVORITE);
  });
});

describe("teamNote", () => {
  it("says who joined and how full the party is now", () => {
    expect(teamNote("hydreigon", { kind: "joined", size: 5 })).toBe(
      "Hydreigon joined your party. 5 of 6 slots filled.",
    );
  });

  it("says who left", () => {
    expect(teamNote("hydreigon", { kind: "left", size: 4 })).toBe(
      "Hydreigon left your party. 4 of 6 slots filled.",
    );
  });

  //a full party refuses the add; the party-full hint already explains it,
  //so the confirmation line has nothing to confirm
  it("has nothing to say when the add was refused", () => {
    expect(teamNote("hydreigon", { kind: "rejected", size: 6 })).toBeNull();
  });

  it("writes slugged names as words", () => {
    expect(teamNote("mr-mime", { kind: "joined", size: 1 })).toBe(
      "Mr Mime joined your party. 1 of 6 slots filled.",
    );
  });
});

//Home's "Add to team" command (spec 7.1): the line under its title says
//what selecting it will do, given the party right now
describe("teamCommandHint", () => {
  it("says how much room is left", () => {
    expect(
      teamCommandHint({ name: "zoroark", onTeam: false, partySize: 4 }),
    ).toBe("Your party has room for 2 more");
  });

  it("says how to undo it once the Pokémon is on the team", () => {
    expect(
      teamCommandHint({ name: "zoroark", onTeam: true, partySize: 5 }),
    ).toBe("Zoroark joined your party. Select again to release it");
  });

  it("says where to make room when the party is full", () => {
    expect(
      teamCommandHint({ name: "zoroark", onTeam: false, partySize: 6 }),
    ).toBe("Your party is full. Release one on the Team page");
  });

  it("talks about the Pokémon, not the party, when it is the sixth member", () => {
    expect(
      teamCommandHint({ name: "mr-mime", onTeam: true, partySize: 6 }),
    ).toBe("Mr Mime joined your party. Select again to release it");
  });
});

//Compare's verdict line (spec 7.3)
describe("compareVerdict", () => {
  it("names the winner and the margin", () => {
    expect(
      compareVerdict(
        { name: "samurott", total: 528 },
        { name: "volcarona", total: 550 },
      ),
    ).toBe("Volcarona has the higher base stat total, by 22.");
  });

  it("works whichever side wins", () => {
    expect(
      compareVerdict(
        { name: "volcarona", total: 550 },
        { name: "samurott", total: 528 },
      ),
    ).toBe("Volcarona has the higher base stat total, by 22.");
  });

  it("says when the totals are the same", () => {
    expect(
      compareVerdict(
        { name: "mr-mime", total: 460 },
        { name: "lucario", total: 460 },
      ),
    ).toBe("Mr Mime and Lucario have the same base stat total.");
  });
});

describe("statLeadText", () => {
  it("writes the winning margin with a plus sign", () => {
    expect(statLeadText(23)).toBe("+23");
  });
});
