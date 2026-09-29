import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";
import { TabList } from "./TabList";
import { Tab } from "./Tab";
import { TabPanel } from "./TabPanel";
import { describe, expect, it } from "vitest";

function renderTabs() {
  render(
    <Tabs defaultValue="info">
      <TabList aria-label="Pokémon details">
        <Tab value="info">Info</Tab>
        <Tab value="stats">Stats</Tab>
        <Tab value="evolution">Evolution</Tab>
      </TabList>
      <TabPanel value="info">Info content</TabPanel>
      <TabPanel value="stats">Stats content</TabPanel>
      <TabPanel value="evolution">Evolution content</TabPanel>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("shows the default tab's panel, named by its tab", () => {
    renderTabs();
    expect(screen.getByRole("tab", { name: "Info" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Info");
    expect(screen.getByText("Stats content")).not.toBeVisible();
  });

  it("puts only the selected tab in the Tab order", () => {
    renderTabs();
    expect(screen.getByRole("tab", { name: "Info" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("tab", { name: "Stats" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("selects and show a tab when arrowed onto it, wrapping at the ends", async () => {
    renderTabs();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Stats" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Stats" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Stats content");

    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Info" })).toHaveFocus();
  });

  it("Home and End jump to the first and last tab", async () => {
    renderTabs();
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Evolution" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Info" })).toHaveFocus();
  });

  it("switches panels on click", async () => {
    renderTabs();
    await userEvent.click(screen.getByRole("tab", { name: "Evolution" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Evolution content");
  });
});
