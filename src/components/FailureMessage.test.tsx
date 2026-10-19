import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesProvider } from "../context/PreferencesContext";
import { FailureMessage } from "./FailureMessage";
import type { FetchFailureKind } from "../lib/fetchErrors";

//MessageBox reads the animation preference, so it needs the provider
function renderFailure(
  kind: FetchFailureKind,
  query: string,
  onRetry = vi.fn(),
) {
  return render(
    <PreferencesProvider>
      <FailureMessage kind={kind} query={query} onRetry={onRetry} />
    </PreferencesProvider>,
  );
}

describe("FailureMessage", () => {
  it("shows an alert with Retry button when unreachable", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    renderFailure("unreachable", "pikachu", onRetry);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't reach the Pokédex. Check your connection and try again.",
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows a polite status and no Retry button when not found", () => {
    renderFailure("not-found", "missingno");

    expect(screen.getByRole("status")).toHaveTextContent(
      'No Pokémon named "missingno" was found.',
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
