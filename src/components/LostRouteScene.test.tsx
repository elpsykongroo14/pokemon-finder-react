import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LostRouteScene } from "./LostRouteScene";
import { LOST_ROUTE_PALETTE } from "./lostRouteArt";

//the 404's picture (spec 7.6: "keep the pixel-art lost-route scene,
//re-colored to the Graphite theme")
describe("LostRouteScene", () => {
  it("is one image, described in words", () => {
    render(<LostRouteScene />);

    expect(
      screen.getByRole("img", { name: /route sign reading "404"/ }),
    ).toBeInTheDocument();
  });

  //B&W-8: the wrapper's class was misspelled ("lost-rout"), so none of the
  //scene's own styles, its frame or its two small motions, ever applied
  it("wears the class its stylesheet is written for", () => {
    const { container } = render(<LostRouteScene />);

    expect(container.firstElementChild).toHaveClass("lost-route");
  });

  //the Graphite theme: no color but greys, black and white
  it("is drawn in greys only", () => {
    for (const hex of Object.values(LOST_ROUTE_PALETTE)) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      //a grey has its three channels within a few steps of each other
      expect(Math.max(r!, g!, b!) - Math.min(r!, g!, b!)).toBeLessThanOrEqual(
        24,
      );
    }
  });
});
