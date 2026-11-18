//journey 1: find a pokemon. the most important path in the app: if this
//breaks, nothing else matters
import { test, expect } from "./fixtures";

test("search from the header and land on a shareable page", async ({
  page,
}) => {
  await page.goto("./team");

  //the header's search box, found the way a uer (or screen reader) finds
  //it: by role and name, not by CSS class
  const search = page.getByRole("combobox", { name: "Search Pokémon" });
  await search.fill("pika");

  //the autocomplete is debounced and fetches the pokedex index: playwright's
  //assertions retry until they pass (default 5 s), so no manual sleeps
  await page.getByRole("option", { name: "pikachu" }).click();

  await expect(page).toHaveURL(/\/pokemon\/pikachu$/);
  await expect(
    page.getByRole("heading", { level: 2, name: /pikachu/i }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Pikachu · Pokémon Finder");

  //the URL is the state: a fresh load of the same adress must
  //rebuild the same page with no in memory history
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 2, name: /pikachu/i }),
  ).toBeVisible();
});

test("an unknown name i a polite 'not found', not an error", async ({
  page,
}) => {
  await page.goto("pokemon/missingno");

  //not found is an ordinary outcome: a status message and no retry button,
  //becaue asking again cannot help
  await expect(
    page.getByRole("status").filter({ hasText: /missingno/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
});
