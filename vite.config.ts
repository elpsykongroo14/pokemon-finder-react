import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

//configuration is checked when it is read (at build time), not when it is first used
//(when someone opens the library in roduction). a missing or
//malformed value then fails the build in CI, with a message that says what
//to fix, instead of shipping an app that breaks for users later
function requireHttpsUrl(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} is not set. Locally: copy .env.example to .env. ` +
        `In CI: add it as a repository variable (Settings → Secrets and ` +
        `variables → Actions → Variables).`,
    );
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} is not a valid URL: "${value}"`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`${name} must use https://, got "${value}"`);
  }
  return value;
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  //only a build needs the proxy address; `vite` (dev) and `vitest` do not
  //(tests use .env.test, and the dev server should start even without it)
  //loadEnv reads .env files and real environment variables (CI sets it as
  //an enviroment variable, locally it comes from .env)
  if (command === "build") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    requireHttpsUrl("VITE_TCG_PROXY", env.VITE_TCG_PROXY);
  }

  return {
    plugins: [
      react(),
      //bundle map, only when asked for: `npm run analyze` builds in a mode
      //called "analyze". a normal `npm run build` skips it, so CI and
      //deploys never pay for it
      mode === "analyze" &&
        visualizer({
          filename: "stats.html",
          template: "treemap",
          gzipSize: true,
          open: false,
        }),
    ],
  };
});
