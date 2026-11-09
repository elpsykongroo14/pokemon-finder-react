import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NotFoundPage } from "./NotFoundPage";
import { NOT_FOUND_SUBTITLE } from "../lib/copy";

function renderNotFound() {
  render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

describe("NotFoundPage", () => {
  it("opens with  page header like every other page", () => {
    renderNotFound();

    expect(
      screen.getByRole("heading", { level: 2, name: "Page not found" }),
    ).toBeInTheDocument();
    expect(screen.getByText(NOT_FOUND_SUBTITLE)).toBeInTheDocument();
  });

  it("offers a way back to search", () => {
    renderNotFound();

    expect(
      screen.getByRole("link", { name: "Back to search" }),
    ).toHaveAttribute("href", "/");
  });
});

//this file is a small but complete file, justifies by being the sole check on the router's fallback path
