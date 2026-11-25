//journey 3: browse cards. URL driven view state (?view=), a modal dialog,
//and focus management, working together in a real browser
import { test, expect } from "./fixtures";

test("switch to the table view, open a card, close it", async ({ page }) => {
  await page.goto("/library/pikachu");
  //B&W-7: the hero names the page after the Pokémon ("Pikachu cards");
  //"TCG Library" is the title of the featured page only
  await expect(
    page.getByRole("heading", { level: 2, name: "Pikachu cards" }),
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

//B&W-7 (D53): the dialog steps through the cards in the page's order, by
//button and by arrow key, and keeps focus inside when it reaches the end
test("flip through the cards in the dialog with the keyboard", async ({
  page,
}) => {
  await page.goto("/library/pikachu");

  const firstTile = page.locator(".card-grid .tcg-card").first();
  await firstTile.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Card 1 of 4")).toBeVisible();
  //focus starts on Close (spec 7.4)
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByText("Card 2 of 4")).toBeVisible();

  //Next card onto the last card disables it; focus moves to Previous card
  await dialog.getByRole("button", { name: "Next card" }).click();
  await dialog.getByRole("button", { name: "Next card" }).click();
  await expect(dialog.getByText("Card 4 of 4")).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Previous card" }),
  ).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(firstTile).toBeFocused();
});

//B&W-7 (D54): the binder shows two pages side by side on a wide screen;
//four cards fill part of page 1, and page 2 says the binder ends there
test("open the binder from the hero", async ({ page }) => {
  await page.goto("/library/pikachu");

  await page.getByRole("button", { name: "Open the binder" }).click();
  await expect(page).toHaveURL(/view=binder/);
  await expect(page.getByText("Page 1 of 1")).toBeVisible();
  await expect(page.getByText("That's all 4 cards.")).toBeVisible();
});
