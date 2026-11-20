# Release runbook

How a change reaches users, how to check it worked, and how to undo it.
Written to be followed step by step, under pressure, by someone who is not
thinking clearly. That someone is usually you, at night.

## 1. One-time setup

| Where (GitHub → Settings)                        | What                                                                 | Why                                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Secrets and variables → Actions → **Variables**  | `VITE_TCG_PROXY` = the Worker URL                                    | Configuration, not a secret: it ends up in the public JavaScript. The build fails if it is missing. |
| Secrets and variables → Actions → **Secrets**    | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`                      | Real secrets: whoever has the token can deploy. Never in code, never in logs.                       |
| Secrets → delete the old `VITE_TCG_PROXY` secret | (after the first green run)                                          | One source of truth for one value.                                                                  |
| Branches → protect `main`                        | Require a pull request; require status checks `test`, `build`, `e2e` | Nothing reaches production without the gates.                                                       |

## 2. Releasing

1. Open a pull request into `main`. The pipeline runs `test`, `build`, `e2e`.
2. Read the diff once more as a reviewer would. Merge only when all checks are green.
3. The push to `main` runs the pipeline again. `deploy-production` downloads the
   build, checks its fingerprint, deploys it, and runs `scripts/smoke.mjs`
   against the new deployment.
4. Tag the release: `git switch main && git pull && git tag -a vX.Y.Z -m "..." && git push origin vX.Y.Z`.
5. Human check on the real site (2 minutes, real network, nothing faked):
   - search a Pokémon, open its page, reload it (deep link)
   - open the Library: cards load (real Worker, real CORS from the production origin)
   - DevTools → Network, reload twice: hashed `/assets/*` files come from cache

## 3. Rolling back

**Rollback** = put the previous deployment back. Use it when production is
broken now. Fast, no code change, no build.

1. Cloudflare dashboard → Workers & Pages → `pokemon-finder-react` → **Deployments**.
2. In **All deployments**, find the last good _production_ deployment
   (each one shows the commit hash the pipeline attached).
3. Its `⋯` menu → **Rollback to this deployment** → confirm.
4. Run the smoke test against production: `node scripts/smoke.mjs https://<production-url>`.
5. Write down what happened, then fix forward (below).

Preview deployments are never rollback targets, only production ones.

**Roll forward** = fix the bug, or `git revert` the bad commit, and release
again through the pipeline. Always the second step after a rollback: until
then, `main` still contains the broken code and the next merge would ship it
again.

**Data caution:** a rollback swaps the code, not the users' data. If the new
version wrote something to `localStorage` that the old version cannot read,
rolling back can break things for the users who visited in between. Rule:
any change to a stored shape must be readable by the previous version, or
ship in two releases (first teach the old shape to read the new one, then
start writing it).

## 4. Practise it once

A rollback you have never done is a rollback you do not have. Once, on a calm
day: release a harmless change (a README line), roll back to the deployment
before it, run the smoke test, then roll forward to the newest one again.
Note how long each step took.
