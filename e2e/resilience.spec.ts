//journey 4: the network fails, then recovers. not a happy path, but the
//one that decides whether users trust the app: an outage must produce a
//clear message and a way back, never a blank screen
import { test, expect } from "./fixtures";

test("an API outage shows an alert, and Retry recovers once it is back", async ({
  page,
  network,
}) => {
  //every PokéAPI request answers 503 Service Unavailable
  network.outage(/pokeapi\.co/);
  await page.goto("/pokemon/pikachu");

  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();
  const retry = page.getByRole("button", { name: "Retry" });
  await expect(retry).toBeVisible();

  //the API comes back; one click should be all the user needs
  network.restore();
  await retry.click();

  await expect(
    page.getByRole("heading", { level: 2, name: /pikachu/i }),
  ).toBeVisible();
  await expect(alert).toHaveCount(0);
});
