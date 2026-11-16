import { describe, expect, it } from "vitest";
import { APP_NAME, pageNameFromTitle, pageTitle } from "./pageTitle";

describe("pageNameFromTitle", () => {
  it("is the exact reverse of pageTitle", () => {
    expect(pageNameFromTitle(pageTitle("Your Team"))).toBe("Your Team");
  });

  it("calls Home 'Home', not the app name", () => {
    expect(pageNameFromTitle(APP_NAME)).toBe("Home");
  });

  it("keeps a title it does not recognise as it is", () => {
    expect(pageNameFromTitle("Something else")).toBe("Something else");
  });
});
