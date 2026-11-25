import { useState } from "react";
import "./StyleGuide.css";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { Tabs } from "../ui/Tabs";
import { TabList } from "../ui/TabList";
import { Tab } from "../ui/Tab";
import { TabPanel } from "../ui/TabPanel";
import { MessageBox } from "../ui/MessageBox";
import { StatMeter } from "../ui/StatMeter";
import { Select } from "../ui/Select";
import { Dialog } from "../ui/Dialog";
import { Spinner } from "../ui/Spinner";
import { Skeleton } from "../ui/Skeleton";
import { TypeBadge } from "../components/TypeBadge";
import { Icon } from "../components/Icon";
import { SegmentedControl } from "../ui/SegmentedControl";
import { SectionHeading } from "../ui/SectionHeading";
import { TierMark } from "../components/TierMark";

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

//the five neutrals of the Black & White base (D41). Every other color on
//screen comes from a Pokémon type, shown in the chips below
const NEUTRALS = [
  ["ink", "Text, plates, primary buttons"],
  ["paper", "The page"],
  ["mist", "Inputs, tracks, hover fills"],
  ["line", "Hairlines, inactive pips"],
  ["graphite", "Secondary text"],
] as const;

const SECTION_DEMO = "Base stats";
const VIEW_OPTIONS = [
  { value: "grid", label: "Grid" },
  { value: "table", label: "Table" },
  { value: "binder", label: "Binder" },
] as const;
const MATCHUPS = [
  ["ground", 4],
  ["fire", 2],
  ["grass", 0.5],
  ["bug", 0.25],
  ["electric", 0],
] as const;

export function StyleGuide() {
  const [activeType, setActiveType] = useState<(typeof TYPES)[number]>("fire");
  const [sortDemo, setSortDemo] = useState("newest");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDemo, setViewDemo] =
    useState<(typeof VIEW_OPTIONS)[number]["value"]>("grid");

  return (
    <div className="styleguide">
      <header className="styleguide__intro">
        <h1>Style Guide (dev only)</h1>
        <p>
          The Black & White primitives (R10B), rendered so they can be checked
          by eye. The picked type below themes every section marked "themed".
        </p>
      </header>

      <section className="styleguide__section">
        <h2>Palette</h2>
        <div className="swatch-row__swatches">
          {NEUTRALS.map(([name, role]) => (
            <div key={name} className="swatch-row">
              <div
                className="swatch"
                style={{ background: `var(--${name})` }}
              />
              <p className="swatch-row__label">
                <strong>{name}</strong> {role}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="styleguide__section">
        <h2>TypeBadge</h2>
        <div className="type-grid">
          {TYPES.map((t) => (
            <TypeBadge key={t} typeName={t} />
          ))}
        </div>
        <p className="styleguide__note">Sizes: sm, md, lg</p>
        <div className="primitives-row">
          <TypeBadge typeName="dragon" size="sm" />
          <TypeBadge typeName="dragon" />
          <TypeBadge typeName="dragon" size="lg" />
        </div>
        <p className="styleguide__note">With a matchup multiplier</p>
        <div className="primitives-row">
          {MATCHUPS.map(([t, m]) => (
            <TypeBadge key={t} typeName={t} multiplier={m} />
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
        <h2>Contrast</h2>
        <p className="styleguide__note">
          Enforced by tests, not by a table: semantic.test.ts (every text role
          on every surface, the focus ring) and type-themes.test.ts (each type's
          ink on its color).
        </p>
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
        <p className="type-sample type-sample--display">Hydreigon</p>
        <SectionHeading>Type matchups</SectionHeading>
        <p>Build a party of up to six. It stays saved in this browser.</p>
        <p className="type-sample type-sample--game">
          A wild HYDREIGON appeared!
        </p>
        <p className="type-sample type-sample--game">No. 635</p>
      </section>

      <section className="styleguide__section">
        <h2>Button / IconButton</h2>
        <p className="styleguide__note">On white: dark and line</p>
        <div className="primitives-row">
          <Button>Find a Pokémon</Button>
          <Button variant="line">Details</Button>
          <Button variant="line" size="sm">
            Small
          </Button>
          <Button variant="line" pressed>
            Pressed toggle
          </Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
          <IconButton icon={<Icon name="settings" />} aria-label="Settings" />
        </div>
        <p className="styleguide__note">On a black plate: light and ghost</p>
        <div className="primitives-row on-dark styleguide__plate">
          <Button variant="light">Favorited</Button>
          <Button variant="ghost">Compare</Button>
          <Button variant="ghost" pressed>
            Pressed toggle
          </Button>
          <TypeBadge typeName="bug" />
        </div>
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
        <h2>SegmentedControl</h2>
        <SegmentedControl
          label="Library view"
          labelVisible
          options={VIEW_OPTIONS}
          value={viewDemo}
          onChange={setViewDemo}
          description="Arrow keys move between options."
        />
      </section>

      <section className="styleguide__section">
        <h2>SectionHeading</h2>
        <section aria-labelledby="styleguide-section-demo">
          <SectionHeading id="styleguide-section-demo">
            {SECTION_DEMO}
          </SectionHeading>
          <p>A 2 px Ink rule, 16 px, the heading, 20 px, then the content.</p>
        </section>
      </section>

      <section className="styleguide__section">
        <h2>MessageBox (themed)</h2>
        <div className="primitives-column" data-type={activeType}>
          <MessageBox text="A wild PIKACHU appeared!" />
          <MessageBox text="Added to your team!" variant="success" />
          <MessageBox text="Pokémon not found." variant="error" />
        </div>
      </section>

      <section className="styleguide__section">
        <h2>StatMeter (themed)</h2>
        <div className="primitives-column" data-type={activeType}>
          <StatMeter label="Attack" value={80} max={255} />
          <StatMeter label="Speed" value={130} max={255} variant="highest" />
          <StatMeter label="HP (low)" value={15} max={100} variant="tiered" />
          <StatMeter label="HP (mid)" value={35} max={100} variant="tiered" />
          <StatMeter label="HP (high)" value={80} max={100} variant="tiered" />
        </div>
      </section>

      <section className="styleguide__section">
        <h2>Select</h2>
        <div className="primitives-row">
          <Select
            aria-label="Sort demo"
            value={sortDemo}
            onChange={(e) => setSortDemo(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rarity">Rarity</option>
          </Select>
        </div>
      </section>

      <section className="styleguide__section">
        <h2>TierMark</h2>
        <p className="styleguide__note">
          One mark in four strengths (spec 7.4); the words are the card's own
          rarity
        </p>
        <div className="primitives-row">
          <TierMark rarity="Common" />
          <TierMark rarity="Rare" />
          <TierMark rarity="Rare Holo" />
          <TierMark rarity="Special Illustration Rare" />
        </div>
      </section>

      <section className="styleguide__section">
        <h2>Dialog</h2>
        <Button onClick={() => setDialogOpen(true)}>Open demo dialog</Button>
        {dialogOpen && (
          <Dialog aria-label="Demo dialog" onClose={() => setDialogOpen(false)}>
            <h2>Demo dialog</h2>
            <p>Tab around, then try Escape.</p>
          </Dialog>
        )}
      </section>

      <section className="styleguide__section">
        <h2>Spinner / Skeleton</h2>
        <div className="primitives-row">
          <Spinner size="sm" label="Loading, small" />
          <Spinner label="Loading, medium" />
          <Spinner size="lg" label="Loading, large" />
          <Skeleton width={64} height={64} label="Sprite loading" />
          <Skeleton width={140} height={16} label="Text loading" />
        </div>
      </section>

      <section className="styleguide__section">
        <h2>Icon</h2>
        <div className="primitives-row">
          <Icon name="github" label="GitHub" />
          <Icon name="discord" label="Discord" />
          <Icon name="bluesky" label="Bluesky" />
          <Icon name="x" label="X" />
        </div>
      </section>
    </div>
  );
}
