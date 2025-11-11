/**
 * Preset configurations for the Double Pendulum simulation.
 * Each preset demonstrates different aspects of coupled pendulum dynamics.
 */

import { Preset } from "../../common/model/Preset.js";
import { StringManager } from "../../i18n/StringManager.js";
import classicalMechanics from '../../ClassicalMechanicsNamespace.js';

export class DoublePendulumPresets {
  public static getPresets(): Preset[] {
    const stringManager = StringManager.getInstance();
    const presetStrings = stringManager.getDoublePendulumPresets();

    return [
      {
        nameProperty: presetStrings.synchronizedStringProperty,
        descriptionProperty: presetStrings.synchronizedDescStringProperty,
        configuration: {
          length1: 1.5,           // Equal lengths (m)
          length2: 1.5,
          mass1: 1.0,             // Equal masses (kg)
          mass2: 1.0,
          gravity: 9.8,           // Earth gravity (m/s²)
          damping: 0.0,           // No damping for clear oscillation (N·m·s)
          angle1: Math.PI / 6,    // 30 degrees (rad)
          angle2: Math.PI / 6,    // Both start at same small angle (rad)
        },
      },
      {
        nameProperty: presetStrings.chaoticDanceStringProperty,
        descriptionProperty: presetStrings.chaoticDanceDescStringProperty,
        configuration: {
          length1: 1.0,           // Different lengths for more chaos (m)
          length2: 1.3,
          mass1: 1.0,             // Equal masses (kg)
          mass2: 1.0,
          gravity: 9.8,           // Earth gravity (m/s²)
          damping: 0.0,           // No damping to maintain chaos (N·m·s)
          angle1: 2.5,            // ~143 degrees (large angle) (rad)
          angle2: -2.0,           // ~-115 degrees (opposite, large angle) (rad)
        },
      },
      {
        nameProperty: presetStrings.counterRotationStringProperty,
        descriptionProperty: presetStrings.counterRotationDescStringProperty,
        configuration: {
          length1: 1.5,           // Equal lengths (m)
          length2: 1.5,
          mass1: 1.0,             // Equal masses (kg)
          mass2: 1.0,
          gravity: 9.8,           // Earth gravity (m/s²)
          damping: 0.0,           // No damping (N·m·s)
          angle1: Math.PI / 3,    // 60 degrees (rad)
          angle2: -Math.PI / 3,   // -60 degrees (opposite direction) (rad)
        },
      },
      {
        nameProperty: presetStrings.energyTransferStringProperty,
        descriptionProperty: presetStrings.energyTransferDescStringProperty,
        configuration: {
          length1: 1.2,           // Slightly different lengths (m)
          length2: 1.5,
          mass1: 1.0,             // Equal masses (kg)
          mass2: 1.0,
          gravity: 9.8,           // Earth gravity (m/s²)
          damping: 0.02,          // Very light damping to see energy flow (N·m·s)
          angle1: Math.PI / 2,    // 90 degrees - first pendulum displaced (rad)
          angle2: 0.1,            // Nearly vertical (rad)
        },
      },
    ];
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('DoublePendulumPresets', DoublePendulumPresets);
