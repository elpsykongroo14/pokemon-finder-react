import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./PageHeader";

describe("pageHeader", () => {
  it("names the page with an h2", () => {
    render(<PageHeader title="Your Team" />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Your Team" }),
    ).toBeInTheDocument();
  });

  it("shows the subtitle only when there is one", () => {
    const { rerender, container } = render(
      <PageHeader title="Your Team" subtitle="Build a party." />,
    );
    expect(screen.getByText("Build a party.")).toBeInTheDocument();

    rerender(<PageHeader title="Your Team" />);
    expect(container.querySelector(".page-header__subtitle")).toBeNull();
  });

  it("renders page-wide actions next to the title", () => {
    render(
      <PageHeader
        title="TCG Library"
        actions={<a href="/library">Featured</a>}
      />,
    );

    expect(screen.getByRole("link", { name: "Featured" })).toBeInTheDocument();
  });
});

//NOT tested here, on purpose: "a <header> inside <main> is not a banner".
//the HTML spec and real browsers agree (checked in Chromium: one banner on
//the Team page), but Testing Library's role engine treats EVERY <header> as
//a banner, so a jsdom test would fail on correct code. when a test tool and
//the real browser disagree, trust the browser and leave the tool's blind
//spot written down, instead of bending the code to please the tool
