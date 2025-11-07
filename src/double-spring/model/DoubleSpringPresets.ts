/**
 * Preset configurations for the Double Spring simulation.
 * Each preset demonstrates interesting coupled oscillation phenomena.
 */

import { Preset } from "../../common/model/Preset.js";
import { StringManager } from "../../i18n/StringManager.js";

export class DoubleSpringPresets {
  public static getPresets(): Preset[] {
    const stringManager = StringManager.getInstance();
    const presetStrings = stringManager.getDoubleSpringPresets();

    return [
      {
        nameProperty: presetStrings.symmetricStringProperty,
        descriptionProperty: presetStrings.symmetricDescStringProperty,
        configuration: {
          mass1: 1.0,             // Equal masses (kg)
          mass2: 1.0,
          springConstant1: 15,    // Equal springs (N/m)
          springConstant2: 15,
          damping1: 0.1,          // Light damping (N·s/m)
          damping2: 0.1,
          position1: 1.0,         // Symmetrical initial positions (m)
          position2: 1.5,
        },
      },
      {
        nameProperty: presetStrings.asymmetricMassesStringProperty,
        descriptionProperty: presetStrings.asymmetricMassesDescStringProperty,
        configuration: {
          mass1: 0.5,             // Light mass (kg)
          mass2: 2.0,             // Heavy mass (kg)
          springConstant1: 15,    // Equal springs (N/m)
          springConstant2: 15,
          damping1: 0.1,          // Light damping (N·s/m)
          damping2: 0.1,
          position1: 1.0,         // Initial positions (m)
          position2: 2.0,
        },
      },
      {
        nameProperty: presetStrings.differentSpringsStringProperty,
        descriptionProperty: presetStrings.differentSpringsDescStringProperty,
        configuration: {
          mass1: 1.0,             // Equal masses (kg)
          mass2: 1.0,
          springConstant1: 20,    // Stiff spring (N/m)
          springConstant2: 5,     // Soft spring (N/m)
          damping1: 0.1,          // Light damping (N·s/m)
          damping2: 0.1,
          position1: 1.0,         // Initial positions (m)
          position2: 2.0,
        },
      },
      {
        nameProperty: presetStrings.coupledResonanceStringProperty,
        descriptionProperty: presetStrings.coupledResonanceDescStringProperty,
        configuration: {
          mass1: 1.0,             // Equal masses (kg)
          mass2: 1.0,
          springConstant1: 10,    // Moderate springs (N/m)
          springConstant2: 10,
          damping1: 0.05,         // Very light damping (N·s/m)
          damping2: 0.05,
          position1: 1.5,         // First mass displaced (m)
          position2: 1.0,         // Second mass at equilibrium (m)
        },
      },
    ];
  }
}
