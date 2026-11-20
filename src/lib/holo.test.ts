import { describe, it, expect } from "vitest";
import { getHoloPose, MAX_TILT_DEG } from "./holo";

//a 200 x 100 card whose top-left corner is at (10, 20)
const BOX = { left: 10, top: 20, width: 200, height: 100 };

describe("getHoloPose", () => {
  it("the middle of the card is shine centered and no tilt", () => {
    expect(getHoloPose(BOX, 110, 70)).toEqual({ mx: 50, my: 50, rx: 0, ry: 0 });
  });

  it("the top-left corner titlts the top and left edges away", () => {
    expect(getHoloPose(BOX, 10, 20)).toEqual({
      mx: 0,
      my: 0,
      rx: MAX_TILT_DEG,
      ry: -MAX_TILT_DEG,
    });
  });

  it("the bottom-right corner tilts the opposite way", () => {
    expect(getHoloPose(BOX, 210, 120)).toEqual({
      mx: 100,
      my: 100,
      rx: -MAX_TILT_DEG,
      ry: MAX_TILT_DEG,
    });
  });

  it("only horizontal movement changes ry, only vertical changes rx", () => {
    const rightMiddle = getHoloPose(BOX, 210, 70);
    expect(rightMiddle.ry).toBe(MAX_TILT_DEG);
    expect(rightMiddle.rx).toBe(0);

    const bottomCenter = getHoloPose(BOX, 110, 120);
    expect(bottomCenter.rx).toBe(-MAX_TILT_DEG);
    expect(bottomCenter.ry).toBe(0);
  });

  it("a pointer outside the card is held at the nearest edge", () => {
    const far = getHoloPose(BOX, -5000, 99999);
    expect(far).toEqual({
      mx: 0,
      my: 100,
      rx: -MAX_TILT_DEG,
      ry: -MAX_TILT_DEG,
    });
  });

  it("a card with no size, or a pointer that is not a number, counts as centered", () => {
    const flat = { left: 0, top: 0, width: 0, height: 0 };
    expect(getHoloPose(flat, 30, 30)).toEqual({ mx: 50, my: 50, rx: 0, ry: 0 });
    expect(getHoloPose(BOX, Number.NaN, Number.NaN)).toEqual({
      mx: 50,
      my: 50,
      rx: 0,
      ry: 0,
    });
  });

  it("rounds to two decimals", () => {
    const narrow = { left: 0, top: 0, width: 3, height: 3 };
    expect(getHoloPose(narrow, 1, 1).mx).toBe(33.33);
  });

  it("accepts a different maximum tilt", () => {
    expect(getHoloPose(BOX, 210, 70, 20).ry).toBe(20);
  });
});
