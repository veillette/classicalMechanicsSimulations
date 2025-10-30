/**
 * ClassicalMechanicsPreferences.ts
 *
 * Global preferences for the Classical Mechanics Simulations.
 * Contains simulation-wide settings that users can configure.
 */

import { BooleanProperty, EnumerationProperty } from "scenerystack/axon";
import classicalMechanics from "./ClassicalMechanicsNamespace.js";
import SolverType from "./common/model/SolverType.js";

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

  /**
   * The ODE solver method to use for numerical integration.
   * Options: RK4, Adaptive RK45, Adaptive Euler, Modified Midpoint
   */
  solverTypeProperty: new EnumerationProperty(SolverType.RK4),

  /**
   * Whether to respect the user's prefers-reduced-motion setting.
   * When enabled, animations will be reduced or eliminated for users who have
   * indicated they prefer reduced motion in their operating system settings.
   * This is checked automatically from the browser's media query.
   */
  reducedMotionProperty: new BooleanProperty(
    typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ),

  /**
   * Whether to enable high contrast mode for better visibility.
   * When enabled, uses higher contrast colors and thicker focus indicators.
   */
  highContrastModeProperty: new BooleanProperty(false),
};

// Register the namespace
classicalMechanics.register(
  "ClassicalMechanicsPreferences",
  ClassicalMechanicsPreferences,
);

export default ClassicalMechanicsPreferences;
