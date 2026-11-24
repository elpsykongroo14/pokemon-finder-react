import { describe, it, expect } from "vitest";
import {
  getHoloPose,
  MAX_TILT_X_DEG,
  MAX_TILT_Y_DEG,
  SMALL_CARD_DAMPING,
} from "./holo";

//changed in B&W-7: the tilt follows spec 7.4 now. it used to be one
//maximum (8deg) both ways; the spec tips the card further sideways (10deg)
//than up and down (8deg), and tips cards under 300 px wide only 70 % as far

//a 400 x 200 card (a "big" card) whose top-left corner is at (10, 20)
const BOX = { left: 10, top: 20, width: 400, height: 200 };
//the same shape at 200 x 100: under 300 px wide, so it tilts less
const SMALL = { left: 10, top: 20, width: 200, height: 100 };

describe("getHoloPose", () => {
  it("the middle of the card is shine centered and no tilt", () => {
    expect(getHoloPose(BOX, 210, 120)).toEqual({
      mx: 50,
      my: 50,
      rx: 0,
      ry: 0,
    });
  });

  it("the top-left corner tilts the top and left edges away", () => {
    expect(getHoloPose(BOX, 10, 20)).toEqual({
      mx: 0,
      my: 0,
      rx: MAX_TILT_X_DEG,
      ry: -MAX_TILT_Y_DEG,
    });
  });

  it("the bottom-right corner tilts the opposite way", () => {
    expect(getHoloPose(BOX, 410, 220)).toEqual({
      mx: 100,
      my: 100,
      rx: -MAX_TILT_X_DEG,
      ry: MAX_TILT_Y_DEG,
    });
  });

  it("tips further sideways than up and down, as the spec draws it", () => {
    expect(MAX_TILT_X_DEG).toBe(8);
    expect(MAX_TILT_Y_DEG).toBe(10);
  });

  it("only horizontal movement changes ry, only vertical changes rx", () => {
    const rightMiddle = getHoloPose(BOX, 410, 120);
    expect(rightMiddle.ry).toBe(MAX_TILT_Y_DEG);
    expect(rightMiddle.rx).toBe(0);

    const bottomCenter = getHoloPose(BOX, 210, 220);
    expect(bottomCenter.rx).toBe(-MAX_TILT_X_DEG);
    expect(bottomCenter.ry).toBe(0);
  });

  it("tilts a card under 300 px wide only 70 % as far", () => {
    expect(SMALL_CARD_DAMPING).toBe(0.7);
    expect(getHoloPose(SMALL, 210, 120)).toEqual({
      mx: 100,
      my: 100,
      rx: -5.6,
      ry: 7,
    });
  });

  it("a pointer outside the card is held at the nearest edge", () => {
    expect(getHoloPose(BOX, -5000, 99999)).toEqual({
      mx: 0,
      my: 100,
      rx: -MAX_TILT_X_DEG,
      ry: -MAX_TILT_Y_DEG,
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
});
