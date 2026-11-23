import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { PokemonActions } from "./PokemonActions";
import type { PokemonDetails } from "../lib/type";
import type { FavoritesContextValue } from "../hooks/useFavorites";
import type { TeamOutcome } from "../lib/type";
import { PreferencesProvider } from "../context/PreferencesContext";

const { toggleFavorite, teamAction } = vi.hoisted(() => ({
  toggleFavorite: vi.fn(),
  //a plain object the tests can change: the real TeamToggle and TeamStatus
  //render from it, only the hook (and so the team state) is faked
  teamAction: {
    onTeam: false,
    partyFull: false,
    celebrating: false,
    error: null as string | null,
    announcement: "",
    hintId: "team-hint",
    popKey: 0,
    //what the click reports back; each test can set what happened
    toggle: (): TeamOutcome => ({ kind: "joined", size: 5 }),
  },
}));

beforeEach(() => {
  teamAction.partyFull = false;
  teamAction.toggle = () => ({ kind: "joined", size: 5 });
});

vi.mock("../hooks/useFavorites", () => ({
  //typed as the real context value, so if the context gains a field the
  //compiler points here instead of a test failing for a confusing reason
  useFavorites: (): FavoritesContextValue => ({
    favorites: [],
    isFavorite: () => false,
    toggleFavorite,
    removeFavorite: () => {},
  }),
}));
vi.mock("../hooks/useTeamAction", () => ({
  useTeamAction: () => teamAction,
}));

function Probe() {
  const { pathname, search } = useLocation();
  return <p data-testid="where">{pathname + search}</p>;
}

//PokemonActions reads the animation preference (for the heart burst)
function renderActions(name = "pikachu") {
  return render(
    <PreferencesProvider>
      <MemoryRouter initialEntries={["/pokemon/x"]}>
        <PokemonActions pokemon={{ name } as PokemonDetails} />
        <Probe />
      </MemoryRouter>
    </PreferencesProvider>,
  );
}

const note = () =>
  screen.getByText(
    (_, el) => el?.tagName === "P" && el.getAttribute("aria-live") === "polite",
  );

describe("PokemonActions", () => {
  it("groups the collection buttons under 'Collect'", () => {
    renderActions();

    const collect = screen.getByRole("group", { name: "Collect" });
    expect(
      within(collect).getByRole("button", { name: /favorite/i }),
    ).toBeInTheDocument();
    expect(
      within(collect).getByRole("button", { name: "Team" }),
    ).toBeInTheDocument();
  });

  it("groups the links to other pages under 'explore'", () => {
    renderActions();

    const explore = screen.getByRole("group", { name: "Explore" });
    expect(
      within(explore).getByRole("link", { name: "Compare" }),
    ).toBeInTheDocument();
    expect(
      within(explore).getByRole("link", { name: "Cards" }),
    ).toBeInTheDocument();
  });

  it("draws the party-full hint under both groups, not inside one", () => {
    teamAction.partyFull = true;
    renderActions();

    const hint = screen.getByText(/party is full/i);
    expect(screen.getByRole("group", { name: "Collect" })).not.toContain(hint);
    expect(screen.getByRole("group", { name: "Explore" })).not.toContain(hint);
  });

  it("keeps the Team button described by the hint, wherever the hint sits", () => {
    teamAction.partyFull = true;
    renderActions();

    expect(
      screen.getByRole("button", { name: "Team" }),
    ).toHaveAccessibleDescription(/party is full/i);
  });

  it("no longer holds sprites switches (they live on the stage)", () => {
    renderActions();

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("calls toggleFavorite with the pokemon when Favorite is clicked", async () => {
    const user = userEvent.setup();
    renderActions();

    await user.click(screen.getByRole("button", { name: /favorite/i }));

    expect(toggleFavorite).toHaveBeenCalledWith({ name: "pikachu" });
  });

  //spec 6.2: one polite line under the actions, saying what the click did
  it("confirms a new favorite in words, in a polite live region", async () => {
    const user = userEvent.setup();
    renderActions();
    expect(note()).toBeEmptyDOMElement();

    await user.click(screen.getByRole("button", { name: /favorite/i }));

    //the mocked list was empty, so this was the very first favorite
    expect(note()).toHaveTextContent("First favorite!");
  });

  it("confirms a join with the party count", async () => {
    const user = userEvent.setup();
    renderActions("hydreigon");

    await user.click(screen.getByRole("button", { name: "Team" }));

    expect(note()).toHaveTextContent(
      "Hydreigon joined your party. 5 of 6 slots filled.",
    );
  });

  //replaced, not stacked: the newest sentence is the only one
  it("replaces the last confirmation instead of adding another", async () => {
    const user = userEvent.setup();
    renderActions("hydreigon");

    await user.click(screen.getByRole("button", { name: /favorite/i }));
    await user.click(screen.getByRole("button", { name: "Team" }));

    expect(note().children).toHaveLength(1);
    expect(note()).toHaveTextContent("Hydreigon joined your party.");
  });

  it("says nothing new when a full party refuses the add", async () => {
    teamAction.toggle = () => ({ kind: "rejected", size: 6 });
    const user = userEvent.setup();
    renderActions();

    await user.click(screen.getByRole("button", { name: "Team" }));

    expect(note()).toBeEmptyDOMElement();
  });

  //the burst belongs to the moment of adding (spec 6.2): never on arrival
  it("bursts only after a favorite is added", async () => {
    const user = userEvent.setup();
    const { container } = renderActions();
    expect(container.querySelector(".heart-burst")).toBeNull();

    await user.click(screen.getByRole("button", { name: /favorite/i }));

    expect(container.querySelector(".heart-burst")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("builds the destinations from the pokemon's name", () => {
    renderActions("pikachu");

    expect(screen.getByRole("link", { name: "Compare" })).toHaveAttribute(
      "href",
      "/compare?a=pikachu",
    );
    expect(screen.getByRole("link", { name: "Cards" })).toHaveAttribute(
      "href",
      "/library/pikachu",
    );
  });

  it("encodes names that are not URL-safe", () => {
    renderActions("mr mime");

    expect(screen.getByRole("link", { name: "Compare" })).toHaveAttribute(
      "href",
      "/compare?a=mr%20mime",
    );
  });

  it("navigates to the compare page when Compare is clicked", async () => {
    const user = userEvent.setup();
    renderActions();

    await user.click(screen.getByRole("link", { name: "Compare" }));

    expect(screen.getByTestId("where")).toHaveTextContent("/compare?a=pikachu");
  });
});
