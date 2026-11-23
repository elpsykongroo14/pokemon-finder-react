import { describe, it, expect } from "vitest";
import { pickForSide, swapPair } from "./comparePair";

//the two Compare slots live in the URL (?a=…&b=…). these rules decide what
//the URL becomes when someone picks a Pokémon in the identity band or
//presses Swap (spec 7.3, D52)
describe("swapPair", () => {
  it("puts each Pokémon on the other side", () => {
    expect(swapPair({ a: "samurott", b: "volcarona" })).toEqual({
      a: "volcarona",
      b: "samurott",
    });
  });
});

describe("pickForSide", () => {
  const pair = { a: "samurott", b: "volcarona" };

  it("replaces the first Pokémon when First is picked", () => {
    expect(pickForSide(pair, "a", "zoroark")).toEqual({
      a: "zoroark",
      b: "volcarona",
    });
  });

  it("replaces the second Pokémon when Second is picked", () => {
    expect(pickForSide(pair, "b", "zoroark")).toEqual({
      a: "samurott",
      b: "zoroark",
    });
  });

  it("swaps the sides when the Pokémon already on the other side is picked", () => {
    expect(pickForSide(pair, "b", "samurott")).toEqual({
      a: "volcarona",
      b: "samurott",
    });
    expect(pickForSide(pair, "a", "volcarona")).toEqual({
      a: "volcarona",
      b: "samurott",
    });
  });

  it("recognizes the other side's Pokémon whatever the case and spacing", () => {
    expect(pickForSide(pair, "b", "  Samurott ")).toEqual({
      a: "volcarona",
      b: "samurott",
    });
  });

  it("trims what was typed before it goes into the URL", () => {
    expect(pickForSide(pair, "b", "  zoroark ")).toEqual({
      a: "samurott",
      b: "zoroark",
    });
  });

  it("fills an empty side without swapping anything", () => {
    expect(pickForSide({ a: "samurott", b: "" }, "b", "zoroark")).toEqual({
      a: "samurott",
      b: "zoroark",
    });
  });
});
