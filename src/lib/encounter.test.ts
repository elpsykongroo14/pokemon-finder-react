import { describe, it, expect, vi } from "vitest";
import {
  ENCOUNTER_KEY,
  getSessionEncounterId,
  pickEncounterId,
  type StorageLike,
} from "./encounter";
import { POKEDEX_SIZE } from "./dex";

//a real, tiny Storage stand-in: a Map behind the two methods we use
function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    map,
  };
}

describe("pickEncounterId", () => {
  it("maps the lowest random value to #1", () => {
    expect(pickEncounterId(() => 0)).toBe(1);
  });

  it("maps the highest random value to the last pokemon", () => {
    expect(pickEncounterId(() => 0.999999)).toBe(POKEDEX_SIZE);
  });

  it("maps the middle of the range to the middle of the pokedex", () => {
    expect(pickEncounterId(() => 0.5)).toBe(513);
  });

  it("always returns a whole number inside 1...POKEDEX_SIZE", () => {
    for (let i = 0; i < 2000; i++) {
      const id = pickEncounterId(Math.random);
      expect(Number.isInteger(id)).toBe(true);
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(POKEDEX_SIZE);
    }
  });
});

describe("getSessionEncounterId", () => {
  it("picks and saves an encounter the first time", () => {
    const storage = fakeStorage();

    const id = getSessionEncounterId(storage, () => 0.5);

    expect(id).toBe(513);
    expect(storage.map.get(ENCOUNTER_KEY)).toBe("513");
  });

  it("returns the saved encounter without rolling the dice again", () => {
    const storage = fakeStorage({ [ENCOUNTER_KEY]: "25" });
    const random = vi.fn(() => 0.9);

    expect(getSessionEncounterId(storage, random)).toBe(25);
    expect(random).not.toHaveBeenCalled();
  });

  it("gives the same answer when called twice, even with different dice", () => {
    const storage = fakeStorage();

    const first = getSessionEncounterId(storage, () => 0.1);
    const second = getSessionEncounterId(storage, () => 0.9);

    expect(second).toBe(first);
  });

  it.each(["abc", "", "0", "-5", "3.5", String(POKEDEX_SIZE + 1)])(
    "ignores and replaces a bad saved value (%j)",
    (bad) => {
      const storage = fakeStorage({ [ENCOUNTER_KEY]: bad });

      expect(getSessionEncounterId(storage, () => 0)).toBe(1);
      expect(storage.map.get(ENCOUNTER_KEY)).toBe("1");
    },
  );

  it("still works when storage is blocked entirely", () => {
    expect(getSessionEncounterId(null, () => 0.5)).toBe(513);
  });

  it("still works when reading or writing storage throws", () => {
    const hostile: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("full");
      },
    };

    expect(getSessionEncounterId(hostile, () => 0.5)).toBe(513);
  });
});
