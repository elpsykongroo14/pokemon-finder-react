//journey 2: build a team. state that must outlive the page: a click  →
//TeamContext's reducer → its effect writes localStorage → a reload reads it
//back → the same team. (the team saves itself in TeamContext; only
//favorites goes through useLocalStorage hook)
import { test, expect } from "./fixtures";

test("a team member survives a reload and can be removed", async ({ page }) => {
  await page.goto("/pokemon/pikachu");

  //matched by role + aria-pressed, not by its exact label, so this test
  //decribes behaviour and does not care how the button is worded
  const teamToggle = page.getByRole("button", {
    name: /team/i,
    pressed: false,
  });
  await teamToggle.click();
  await expect(
    page.getByRole("button", { name: /team/i, pressed: true }),
  ).toBeVisible();

  //go to the team page the way a use does: the main navigation
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Team" })
    .click();
  await expect(page).toHaveURL(/\/team$/);
  const remove = page.getByRole("button", { name: "Remove pikachu from team" });
  await expect(remove).toBeVisible();

  //the real test of persistence: throw away the page's memory entirely
  await page.reload();
  await expect(remove).toBeVisible();

  await remove.click();
  await expect(remove).toHaveCount(0);
  //and the removal is persisted too
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove pikachu from team" }),
  ).toHaveCount(0);
});
