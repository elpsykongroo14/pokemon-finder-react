//jsdom has no AnimationEvent. React decides ONCE, at the moment react-dom is
//first loaded, which event name onAnimationEnd listents to, and without an
//AnimationEvent it listens for old prefixed name, so animations events
//fired in tests never reach a component's handler (a real browser has it)
//
//this has to run BEFORE anything imports react-dom, so it lives in its own
//setup file, listed first in vitest.config.ts. (inside test-setup.ts it would
//be too late: that file's imports load React before its own code runs)
//a few test files run in plain Node (no window at all), so check first
if (typeof window !== "undefined" && !("AnimationEvent" in window)) {
  class AnimationEventStandIn extends Event {}
  Object.defineProperty(window, "AnimationEvent", {
    value: AnimationEventStandIn,
    configurable: true,
  });
}
