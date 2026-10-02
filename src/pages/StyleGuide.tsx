import { useState } from "react";
import "./StyleGuide.css";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { Panel } from "../ui/Panel";
import { Cursor } from "../ui/Cursor";
import { Menu } from "../ui/Menu";
import { MenuItem } from "../ui/MenuItem";
import { Tabs } from "../ui/Tabs";
import { TabList } from "../ui/TabList";
import { Tab } from "../ui/Tab";
import { TabPanel } from "../ui/TabPanel";
import { MessageBox } from "../ui/MessageBox";
import { StatMeter } from "../ui/StatMeter";
import { Toggle } from "../ui/Toggle";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";

const TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

const NEUTRAL_RAMP = [
  "900",
  "800",
  "700",
  "600",
  "500",
  "400",
  "300",
  "100",
  "050",
];
const TEAL_RAMP = ["700", "600", "500"];
const GOLD_RAMP = ["600", "500", "400"];

/** Static because it documents a measurement, not app state — these are
 * the exact ratios computed while building type-themes.css (Part 4). */
const CONTRAST_ROWS: Array<[string, string, number]> = [
  ["normal", "dark", 7.46],
  ["fire", "dark", 6.47],
  ["water", "dark", 5.49],
  ["electric", "dark", 11.4],
  ["grass", "dark", 7.41],
  ["ice", "dark", 11.53],
  ["fighting", "light", 5.41],
  ["poison", "light", 5.35],
  ["ground", "dark", 10.41],
  ["flying", "dark", 6.92],
  ["psychic", "dark", 5.89],
  ["bug", "dark", 8.34],
  ["rock", "dark", 7.1],
  ["ghost", "light", 5.65],
  ["dragon", "light", 5.54],
  ["dark", "light", 6.29],
  ["steel", "dark", 9.44],
  ["fairy", "dark", 8.55],
];

export function StyleGuide() {
  const [activeType, setActiveType] = useState<(typeof TYPES)[number]>("fire");
  const [lastSelected, setLastSelected] = useState<string | null>(null);
  const [shinyDemo, setShinyDemo] = useState(false);
  const [sortDemo, setSortDemo] = useState("newest");

  return (
    <div className="styleguide">
      <header className="styleguide__intro">
        <h1>Style Guide (dev only)</h1>
        <p>
          Every token from Parts 1–4, rendered so they can be checked by eye
          instead of by reading CSS.
        </p>
      </header>

      <section className="styleguide__section">
        <h2>Palette</h2>
        <SwatchRow label="Slate (chrome)" prefix="slate" steps={NEUTRAL_RAMP} />
        <SwatchRow
          label="Teal (border-line / accent)"
          prefix="teal"
          steps={TEAL_RAMP}
        />
        <SwatchRow
          label="Gold (selection accent)"
          prefix="gold"
          steps={GOLD_RAMP}
        />
      </section>

      <section className="styleguide__section">
        <h2>Type badges (base fill + ink text)</h2>
        <div className="type-grid">
          {TYPES.map((t) => (
            <span
              key={t}
              className="type-badge"
              style={{
                background: `var(--type-${t})`,
                color: `var(--type-${t}-ink)`,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="styleguide__section">
        <h2>Type theme (data-type mechanism)</h2>
        <div className="type-picker">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              aria-pressed={t === activeType}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="theme-demo" data-type={activeType}>
          <div className="theme-demo__header">
            Themed header — data-type="{activeType}"
          </div>
          <div className="theme-demo__body">
            <p>--theme-accent drives the border and this button.</p>
            <button className="theme-demo__button">Themed action</button>
          </div>
        </div>
      </section>

      <section className="styleguide__section">
        <h2>Panel</h2>
        <div className="primitives-row">
          <Panel variant="raised">Raised</Panel>
          <Panel variant="sunken">Sunken</Panel>
          <div data-type={activeType}>
            <Panel variant="tinted">Tinted ({activeType})</Panel>
          </div>
        </div>
      </section>

      <section className="styleguide__section">
        <h2>Elevation (D14)</h2>
        <p className="styleguide__note">
          Press and hold each box — the hard shadow collapses instead of fading.
        </p>
        <div className="elevation-row">
          <div className="elevation-box elevation-box--frame">On frame</div>
          <div className="surface-window elevation-box elevation-box--window">
            On window
          </div>
        </div>
      </section>

      <section className="styleguide__section">
        <h2>Motion tokens</h2>
        <p className="styleguide__note">
          Hover for --dur-fast / --ease-standard, click for --dur-instant /
          --ease-snap.
        </p>
        <button className="motion-demo">Hover, then click me</button>
      </section>

      <section className="styleguide__section">
        <h2>Typography</h2>
        <p style={{ font: "400 var(--text-display)/1.1 var(--font-display)" }}>
          CHARIZARD #006
        </p>
        <p style={{ font: "400 var(--text-xl)/1.2 var(--font-body)" }}>
          Charizard flies around the sky in search of powerful opponents.
        </p>
        <p
          style={{
            font: "400 var(--text-sm)/1.4 var(--font-body)",
            color: "var(--text-secondary)",
          }}
        >
          Height 1.7 m · Weight 90.5 kg · 0123456789
        </p>
      </section>

      <section className="styleguide__section">
        <h2>Contrast table (Part 4 measurements)</h2>
        <table className="contrast-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Ink</th>
              <th>Ratio</th>
              <th>AA (4.5:1)</th>
            </tr>
          </thead>
          <tbody>
            {CONTRAST_ROWS.map(([type, ink, ratio]) => (
              <tr key={type}>
                <td>{type}</td>
                <td>{ink}</td>
                <td>{ratio.toFixed(2)}:1</td>
                <td>{ratio >= 4.5 ? "pass" : "FAIL"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="styleguide__section">
        <h2>Button / IconButton</h2>
        <div className="primitives-row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button pressed>Pressed toggle</Button>
          <Button loading>Saving</Button>
          <IconButton icon="♥" aria-label="Favorite" />
        </div>
      </section>

      <section className="styleguide__section">
        <h2>Cursor</h2>
        <div className="cursor-demo">
          <Cursor offset={0} />
          <div className="cursor-demo__row">Fight</div>
          <div className="cursor-demo__row">Bag</div>
        </div>
      </section>

      <section className="styleguide__section">
        <h2>Menu / MenuItem</h2>
        <p className="styleguide__note">
          Click in, then use arrow keys, Home and End.
        </p>
        <Menu aria-label="Battle menu demo">
          <MenuItem index={0} onSelect={() => setLastSelected("Fight")}>
            Fight
          </MenuItem>
          <MenuItem index={1} onSelect={() => setLastSelected("Bag")}>
            Bag
          </MenuItem>
          <MenuItem index={2} onSelect={() => setLastSelected("Pokémon")}>
            Pokémon
          </MenuItem>
          <MenuItem index={3} onSelect={() => setLastSelected("Run")}>
            Run
          </MenuItem>
        </Menu>
        <p className="styleguide__note">
          Last selected: {lastSelected ?? "none yet"}
        </p>
      </section>

      <section className="styleguide__section">
        <h2>Tabs</h2>
        <Tabs defaultValue="info">
          <TabList aria-label="Pokémon details demo">
            <Tab value="info">Info</Tab>
            <Tab value="stats">Stats</Tab>
            <Tab value="evolution">Evolution</Tab>
          </TabList>
          <TabPanel value="info">Info content goes here.</TabPanel>
          <TabPanel value="stats">Stats content goes here.</TabPanel>
          <TabPanel value="evolution">Evolution content goes here.</TabPanel>
        </Tabs>
      </section>
      <section className="styleguide__section">
        <h2>MessageBox</h2>
        <div className="primitives-column">
          <MessageBox text="A wild PIKACHU appeared!" />
          <MessageBox text="Added to your team!" variant="success" />
          <MessageBox text="Pokémon not found." variant="error" />
        </div>
      </section>

      <section className="styleguide__section">
        <h2>StatMeter</h2>
        <div className="primitives-column">
          <StatMeter label="Attack" value={80} max={255} />
          <StatMeter label="Speed" value={130} max={255} variant="highest" />
          <StatMeter label="HP (low)" value={15} max={100} variant="tiered" />
          <StatMeter label="HP (mid)" value={35} max={100} variant="tiered" />
          <StatMeter label="HP (high)" value={80} max={100} variant="tiered" />
        </div>
      </section>

      <section className="styleguide__section">
        <h2>Toggle / Select / Input</h2>
        <div className="primitives-row">
          <Toggle checked={shinyDemo} onChange={setShinyDemo} label="Shiny" />
          <Select
            aria-label="Sort demo"
            value={sortDemo}
            onChange={(e) => setSortDemo(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rarity">Rarity</option>
          </Select>
          <Input aria-label="Text input demo" placeholder="Type here" />
        </div>
      </section>
    </div>
  );
}

function SwatchRow({
  label,
  prefix,
  steps,
}: {
  label: string;
  prefix: string;
  steps: string[];
}) {
  return (
    <div className="swatch-row">
      <p className="swatch-row__label">{label}</p>
      <div className="swatch-row__swatches">
        {steps.map((step) => (
          <div
            key={step}
            className="swatch"
            style={{ background: `var(--${prefix}-${step})` }}
          >
            <span>
              {prefix}-{step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
