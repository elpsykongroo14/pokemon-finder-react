import { useState } from "react";
import "./StyleGuide.css";

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

  return (
    <div className="styleguide">
      <header className="styleguide__intro">
        <h1>R1 Style Guide (dev only)</h1>
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
