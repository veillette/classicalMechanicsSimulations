/**
 * Utility for creating parameter change listeners with consistent announcement behavior.
 */

import { Property, TReadOnlyProperty } from "scenerystack/axon";
import SimulationAnnouncer from "./SimulationAnnouncer.js";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";

/**
 * Create a parameter change listener that announces changes using a template string.
 *
 * @param property - The property to listen to
 * @param announcementTemplate - Template string with {{value}} placeholder
 * @param formatValue - Optional function to format the value (defaults to 1 decimal place)
 */
export function createParameterChangeListener(
  property: Property<number>,
  announcementTemplate: TReadOnlyProperty<string>,
  formatValue: (value: number) => string = (v) => v.toFixed(1)
): void {
  property.lazyLink((value) => {
    if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
      const template = announcementTemplate.value;
      const announcement = template.replace("{{value}}", formatValue(value));
      SimulationAnnouncer.announceParameterChange(announcement);
    }
  });
}
