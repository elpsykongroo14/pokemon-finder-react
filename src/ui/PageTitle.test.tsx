import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { APP_NAME, pageTitle } from "../lib/pageTitle";
import { PageTitle } from "./PageTitle";

describe("pageTitle", () => {
  it("puts the page first and the app name last", () => {
    expect(pageTitle("Your Team")).toBe(`Your Team · ${APP_NAME}`);
  });

  it("is just the app name when there is no page part", () => {
    expect(pageTitle()).toBe(APP_NAME);
  });
});

describe("PageTitle", () => {
  it("sets the document title while it is rendered", () => {
    render(<PageTitle page="Compare Pokémon " />);
    expect(document.title).toBe(`Compare Pokémon · ${APP_NAME}`);
  });

  it("gives the title back when it unmounts", () => {
    const { unmount } = render(<PageTitle page="Your Team" />);
    unmount();
    expect(document.title).not.toContain("Your Tean");
  });
});
