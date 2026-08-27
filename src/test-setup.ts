import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

//runs after every single test in every file:
//unmouts anything render() mounted, so test never leak DOM into each other
afterEach(() => {
  cleanup();
});
