import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test-polyfills.ts", "./src/test-setup.ts"],
    //two test runners share this repo: vitest owns src/ and tests/,
    //playwright owns e2e/. vitest would otherwise pick up e2e/*.spec.ts
    //(its default pattern matches .spec files) and fail on them.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
