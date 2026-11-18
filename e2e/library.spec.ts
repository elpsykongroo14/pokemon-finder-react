//journey 3: browse cards. URL driven view state (?view=), a modal dialog,
//and focus management, working together in a real browser
import { test, expect } from "./fixtures";

test("switch to the table view, open a card, close it", async ({ page }) => {
  await page.goto("/library/pikachu");
  await expect(
    page.getByRole("heading", { level: 2, name: "TCG Library" }),
  ).toBeVisible();

  //the view lives in the url, so it can be linked and survives a reload,
  //the switcher's real radio input is visually hidden under a style label,
  //and Playwright refuses to click what a user cannot see (that is its
  //"actionability" check, and a feature). so we do what a user does: click
  //the visible label. the radio is still how we check the result
  await page.getByText("Table", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Table" })).toBeChecked();
  await expect(page).toHaveURL(/view=table/);
  await expect(page.getByRole("table")).toBeVisible();

  const opener = page
    .getByRole("table")
    .getByRole("button", { name: /pikachu/i })
    .first();
  await opener.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleName(/pikachu/i);

  //escape closes it, and focus goes back to the button that opened it
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});
