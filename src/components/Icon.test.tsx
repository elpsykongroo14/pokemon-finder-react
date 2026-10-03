import { describe, it, expect } from "vitest";
import { Icon } from "./Icon";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";

describe("Icon", () => {
  it("is decorative by default", () => {
    const { container } = render(<Icon name="github" />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("announces itself when given a label", () => {
    render(<Icon name="github" label="Github" />);
    expect(screen.getByRole("img", { name: "Github" })).toBeInTheDocument();
  });
});
