import "./SettingsDialog.css";
import { Dialog } from "../ui/Dialog";
import { SegmentedControl } from "../ui/SegmentedControl";
import { usePreferences } from "../hooks/usePreferences";
import type { AnimationMode } from "../lib/preferences";
import type { SpriteMode } from "../lib/sprites";
import {
  ANIMATIONS_LABEL,
  SETTINGS_LABEL,
  SETTINGS_NOTE,
  SPRITES_HINT,
  SPRITES_LABEL,
  animationsHint,
} from "../lib/copy";

//"as const satisfies ..." does two jobs: "as const" keeps the values as the
//literal types "auto" | "on" | "off" (not plain string), and "satisfies" makes
//the compiler check every value really is an AnimationMode, without widening
const ANIMATION_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
] as const satisfies readonly { value: AnimationMode; label: string }[];

const SPRITE_OPTIONS = [
  { value: "pixel", label: "Pixel" },
  { value: "artwork", label: "Artwork" },
] as const satisfies readonly { value: SpriteMode; label: string }[];

interface SettingsDialogProps {
  onClose: () => void;
}

//a pure "view" of PreferencesContext: it owns no state of its own. every
//control reads the context and writes back through the context's setters,
//which is why it can never disagree with the Stage's pixel switch
export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const {
    animations,
    animationsEnabled,
    spriteMode,
    setAnimations,
    setSpriteMode,
  } = usePreferences();

  return (
    <Dialog aria-label={SETTINGS_LABEL} onClose={onClose}>
      <div className="settings">
        <header className="settings__header">
          <h2 className="settings__title">{SETTINGS_LABEL}</h2>
          <p className="settings__note">{SETTINGS_NOTE}</p>
        </header>

        <div className="settings__rows">
          <SegmentedControl
            label={ANIMATIONS_LABEL}
            labelVisible
            options={ANIMATION_OPTIONS}
            value={animations}
            onChange={setAnimations}
            description={animationsHint(animations, animationsEnabled)}
          />
          <SegmentedControl
            label={SPRITES_LABEL}
            labelVisible
            options={SPRITE_OPTIONS}
            value={spriteMode}
            onChange={setSpriteMode}
            description={SPRITES_HINT}
          />
        </div>
      </div>
    </Dialog>
  );
}
