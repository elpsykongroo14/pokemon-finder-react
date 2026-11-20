import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StageConsole } from "./StageConsole";

function renderDemo() {
  return render(
    <StageConsole stage={<p>The stage</p>}>
      <p>The console</p>
    </StageConsole>,
  );
}

describe("StageConsole", () => {
  it("renders the stage and the console", () => {
    renderDemo();

    expect(screen.getByText("The stage")).toBeInTheDocument();
    expect(screen.getByText("The console")).toBeInTheDocument();
  });

  it("puts each piece of content in its own slot", () => {
    renderDemo();

    expect(
      screen.getByText("The stage").closest(".stage-console__stage"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The console").closest(".stage-console__console"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The stage").closest(".stage-console__console"),
    ).toBeNull();
  });

  it("comes before the console in reading order, so a screen reader hears the stage first", () => {
    renderDemo();

    const position = screen
      .getByText("The stage")
      .compareDocumentPosition(screen.getByText("The console"));

    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("adds no landmarks of its own", () => {
    renderDemo();

    for (const role of ["region", "complementary", "main", "navigation"]) {
      expect(screen.queryByRole(role)).not.toBeInTheDocument();
    }
  });
});
