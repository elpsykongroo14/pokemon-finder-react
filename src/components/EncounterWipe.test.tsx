import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EncounterWipe } from "./EncounterWipe";

describe("EncounterWipe", () => {
  //decoration only: two slabs, the black one first, nothing for a screen
  //reader, and no wrapper element (it lies over the parent's box)
  it("draws a black slab and then a white one, hidden from assistive tech", () => {
    const { container } = render(<EncounterWipe />);

    const slabs = container.querySelectorAll(".encounter__wipe");
    expect(slabs).toHaveLength(2);
    expect(container.childElementCount).toBe(2);
    expect(slabs[0]).not.toHaveAttribute("data-white");
    expect(slabs[1]).toHaveAttribute("data-white");
    slabs.forEach((slab) =>
      expect(slab).toHaveAttribute("aria-hidden", "true"),
    );
  });
});
