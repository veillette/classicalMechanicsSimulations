/**
 * ClassicalMechanicsPreferences.ts
 *
 * Global preferences for the Classical Mechanics Simulations.
 * Contains simulation-wide settings that users can configure.
 */

import { BooleanProperty } from "scenerystack/axon";
import classicalMechanics from "./ClassicalMechanicsNamespace.js";

/**
 * Preferences for the Classical Mechanics Simulations
 */
const ClassicalMechanicsPreferences = {
  /**
   * Whether to automatically pause the simulation when the browser tab is hidden.
   * When enabled, the simulation will pause when switching tabs or minimizing the browser,
   * preventing large dt jumps and maintaining smooth playback.
   */
  autoPauseWhenTabHiddenProperty: new BooleanProperty(true),
};

// Register the namespace
classicalMechanics.register(
  "ClassicalMechanicsPreferences",
  ClassicalMechanicsPreferences,
);

export default ClassicalMechanicsPreferences;
