/**
 * Preset configurations for the Pendulum simulation.
 * Each preset demonstrates different aspects of pendulum motion.
 */

import { Preset } from "../../common/model/Preset.js";
import { StringManager } from "../../i18n/StringManager.js";

export class PendulumPresets {
  public static getPresets(): Preset[] {
    const stringManager = StringManager.getInstance();
    const presetStrings = stringManager.getPendulumPresets();

    return [
      {
        nameProperty: presetStrings.shortAndFastStringProperty,
        descriptionProperty: presetStrings.shortAndFastDescStringProperty,
        configuration: {
          length: 0.5,            // Short pendulum (m)
          mass: 1.0,              // Mass (kg)
          gravity: 9.8,           // Earth gravity (m/s²)
          damping: 0.05,          // Light damping (N·m·s)
          angle: Math.PI / 6,     // 30 degrees initial angle (rad)
        },
      },
      {
        nameProperty: presetStrings.longAndSlowStringProperty,
        descriptionProperty: presetStrings.longAndSlowDescStringProperty,
        configuration: {
          length: 3.0,            // Long pendulum (m)
          mass: 1.0,              // Mass (kg)
          gravity: 9.8,           // Earth gravity (m/s²)
          damping: 0.1,           // Light damping (N·m·s)
          angle: Math.PI / 6,     // 30 degrees initial angle (rad)
        },
      },
      {
        nameProperty: presetStrings.smallAngleStringProperty,
        descriptionProperty: presetStrings.smallAngleDescStringProperty,
        configuration: {
          length: 2.0,            // Medium pendulum (m)
          mass: 1.0,              // Mass (kg)
          gravity: 9.8,           // Earth gravity (m/s²)
          damping: 0.02,          // Very light damping (N·m·s)
          angle: Math.PI / 18,    // 10 degrees (small angle, ~SHM) (rad)
        },
      },
      {
        nameProperty: presetStrings.largeAmplitudeStringProperty,
        descriptionProperty: presetStrings.largeAmplitudeDescStringProperty,
        configuration: {
          length: 2.0,            // Medium pendulum (m)
          mass: 1.0,              // Mass (kg)
          gravity: 9.8,           // Earth gravity (m/s²)
          damping: 0.05,          // Light damping (N·m·s)
          angle: 2.5,             // ~143 degrees (large amplitude, non-linear) (rad)
        },
      },
    ];
  }
}
