import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NotFoundPage } from "./NotFoundPage";
import { PreferencesProvider } from "../context/PreferencesContext";
import {
  NOT_FOUND_SUBTITLE,
  NOT_FOUND_ENCOUNTER,
  NOT_FOUND_LINK,
  NOT_FOUND_SCENE_LABEL,
} from "../lib/copy";

//animations off, so the message box shows its whole line at once
function renderNotFound() {
  localStorage.setItem(
    "pokemon_preferences",
    JSON.stringify({ animations: "off", spriteMode: "pixel" }),
  );
  render(
    <MemoryRouter>
      <PreferencesProvider>
        <NotFoundPage />
      </PreferencesProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());

describe("NotFoundPage", () => {
  it("opens with  page header like every other page", () => {
    renderNotFound();

    expect(
      screen.getByRole("heading", { level: 2, name: "Page not found" }),
    ).toBeInTheDocument();
    expect(screen.getByText(NOT_FOUND_SUBTITLE)).toBeInTheDocument();
  });

  it("shows the lost-route scene as one described image", () => {
    renderNotFound();

    expect(
      screen.getByRole("img", { name: NOT_FOUND_SCENE_LABEL }),
    ).toBeInTheDocument();
  });

  it("tells the 404 as a wild encounter", () => {
    renderNotFound();

    //MessageBox writes the line twice on purpose (a live region for screen
    //reader, a typed copy for the eye),so ask for the one that is announced
    expect(screen.getByRole("status")).toHaveTextContent(NOT_FOUND_ENCOUNTER);
  });

  it("offers a way back to search", () => {
    renderNotFound();

    expect(screen.getByRole("link", { name: NOT_FOUND_LINK })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

//this file is a small but complete file, justifies by being the sole check on the router's fallback path
