/**
 * Represents a preset configuration for a simulation.
 * Presets allow users to quickly load interesting or educational configurations.
 */

import type { ReadOnlyProperty } from "scenerystack";

export interface PresetConfiguration {
  [key: string]: number;
}

export interface Preset {
  nameProperty: ReadOnlyProperty<string>;
  descriptionProperty: ReadOnlyProperty<string>;
  configuration: PresetConfiguration;
}
