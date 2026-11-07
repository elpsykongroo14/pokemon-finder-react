import { useState } from "react";
import { IconButton } from "../ui/IconButton";
import { Icon } from "./Icon";
import { SettingsDialog } from "./SettingsDialog";
import { SETTINGS_LABEL } from "../lib/copy";

//owns exactly one piece of state: "is the dialog open?". that state is UI
//state (nobody else cares, it should not survive a reload), so it lives in
//plain useState here, not in a context and not in localStorage
export function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        variant="ghost"
        icon={<Icon name="settings" />}
        aria-label={SETTINGS_LABEL}
        onClick={() => setOpen(true)}
      />
      {/* mounting = opening. Dialog moves focus in when it mounts and gives
          it back to whatever had it (this button) when it unmounts */}
      {open && <SettingsDialog onClose={() => setOpen(false)} />}
    </>
  );
}
