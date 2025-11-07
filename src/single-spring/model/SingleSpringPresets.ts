/**
 * Preset configurations for the Single Spring simulation.
 * Each preset demonstrates interesting physics phenomena.
 */

import { Preset } from "../../common/model/Preset.js";
import { StringManager } from "../../i18n/StringManager.js";

export class SingleSpringPresets {
  public static getPresets(): Preset[] {
    const stringManager = StringManager.getInstance();
    const presetStrings = stringManager.getSingleSpringPresets();

    return [
      {
        nameProperty: presetStrings.heavyAndSlowStringProperty,
        descriptionProperty: presetStrings.heavyAndSlowDescStringProperty,
        configuration: {
          mass: 5.0,              // Heavy mass (kg)
          springConstant: 15,      // Soft spring (N/m)
          damping: 0.5,           // Moderate damping (N·s/m)
          position: 1.0,          // Initial displacement (m)
        },
      },
      {
        nameProperty: presetStrings.lightAndBouncyStringProperty,
        descriptionProperty: presetStrings.lightAndBouncyDescStringProperty,
        configuration: {
          mass: 2.0,              // Light mass (kg)
          springConstant: 30,     // Stiff spring (N/m)
          damping: 0.1,           // Light damping (N·s/m)
          position: 1.0,          // Initial displacement (m)
        },
      },
      {
        nameProperty: presetStrings.criticallyDampedStringProperty,
        descriptionProperty: presetStrings.criticallyDampedDescStringProperty,
        configuration: {
          mass: 1.0,              // Mass (kg)
          springConstant: 25,     // Spring constant (N/m)
          damping: 10.0,          // Critical damping: 2*sqrt(m*k) = 2*sqrt(1*25) = 10 (N·s/m)
          position: 1.0,          // Initial displacement (m)
        },
      },
      {
        nameProperty: presetStrings.underdampedStringProperty,
        descriptionProperty: presetStrings.underdampedDescStringProperty,
        configuration: {
          mass: 1.0,              // Mass (kg)
          springConstant: 25,     // Spring constant (N/m)
          damping: 2.0,           // Light damping (N·s/m)
          position: 1.0,          // Initial displacement (m)
        },
      },
      {
        nameProperty: presetStrings.overdampedStringProperty,
        descriptionProperty: presetStrings.overdampedDescStringProperty,
        configuration: {
          mass: 1.0,              // Mass (kg)
          springConstant: 25,     // Spring constant (N/m)
          damping: 20.0,          // Heavy damping (N·s/m)
          position: 1.0,          // Initial displacement (m)
        },
      },
    ];
  }
}
