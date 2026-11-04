//one definition of "are animations off right now?", shared by everything
//written in javascript (css reads the same switch through motion.css)

const REDUCED_QUERY = "prefers-reduced-motion: reduce";

//the app's own setting (written by PreferencesProvider onto <html>) wins when
//it exists, the same rule motion.css follows. before it exists, the OS decides
export function animationsAreOff(): boolean {
  const setting = document.documentElement.dataset.motion;
  if (setting === "reduced") return true;
  if (setting === "on") return false;
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_QUERY).matches
  );
}
