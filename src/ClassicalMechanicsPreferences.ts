/**
 * ClassicalMechanicsPreferences.ts
 *
 * Global preferences for the Classical Mechanics Simulations.
 * Contains simulation-wide settings that users can configure.
 */

import { BooleanProperty, EnumerationProperty } from "scenerystack/axon";
import classicalMechanics from "./ClassicalMechanicsNamespace.js";
import SolverType from "./common/model/SolverType.js";
import { SpringVisualizationType } from "./common/view/SpringVisualizationType.js";

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
   * The spring visualization type to use for rendering springs.
   * Options: Classic (simple coil pattern), Parametric (realistic 3D appearance)
   */
  springVisualizationTypeProperty: new EnumerationProperty(
    SpringVisualizationType.CLASSIC,
  ),

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

  /**
   * Voicing-specific preferences for simulation announcements
   */

  /**
   * Whether to announce parameter changes (mass, spring constant, damping, etc.)
   */
  announceParameterChangesProperty: new BooleanProperty(true),

  /**
   * Whether to announce state changes (play/pause, reset, step, speed changes)
   */
  announceStateChangesProperty: new BooleanProperty(true),

  /**
   * Whether to announce drag interactions (drag start, drag end, positions)
   */
  announceDragInteractionsProperty: new BooleanProperty(true),
};

// Register the namespace
classicalMechanics.register(
  "ClassicalMechanicsPreferences",
  ClassicalMechanicsPreferences,
);

export default ClassicalMechanicsPreferences;
