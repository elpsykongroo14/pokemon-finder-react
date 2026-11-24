import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryNotice } from "./LibraryNotice";
import { PreferencesProvider } from "../context/PreferencesContext";

//B&W-8 (spec 7.6): the sentence sits in the battle dialog, and a failure
//is an alert with a dark Retry, like every other failed lookup
function renderNotice(props: Partial<Parameters<typeof LibraryNotice>[0]>) {
  return render(
    <PreferencesProvider>
      <LibraryNotice
        status="error"
        error="Could not load"
        emptyMessage="Nothing"
        {...props}
      />
    </PreferencesProvider>,
  );
}

describe("LibraryNotice", () => {
  it("shows the error text for the error state", () => {
    renderNotice({});
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load");
    expect(screen.queryByText("Nothing")).not.toBeInTheDocument();
  });

  it("shows the empty message for the empty state", () => {
    renderNotice({ status: "empty", error: null });
    expect(screen.getByRole("status")).toHaveTextContent("Nothing");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("offers a dark Retry on an error, which asks for the cards again", async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    renderNotice({ onRetry: handleRetry });

    const retry = screen.getByRole("button", { name: "Retry" });
    expect(retry).toHaveAttribute("data-variant", "dark");
    await user.click(retry);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  //asking again cannot find cards that do not exist
  it("offers no Retry when there are simply no cards", () => {
    renderNotice({ status: "empty", error: null, onRetry: () => {} });
    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
  });
});
