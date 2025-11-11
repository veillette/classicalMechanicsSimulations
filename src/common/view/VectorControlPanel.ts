/**
 * Control panel for vector visualization options.
 * Displays checkboxes for velocity, force, and acceleration vectors.
 *
 * Each checkbox includes a small arrow icon in the corresponding vector color
 * for easy visual identification. Vectors are displayed as arrows on the
 * simulation objects when enabled.
 *
 * @author Martin Veillette (PhET Interactive Simulations)
 */

import { Panel, type PanelOptions } from "scenerystack/sun";
import { VBox, HBox, Text } from "scenerystack/scenery";
import { Checkbox } from "scenerystack/sun";
import { BooleanProperty, type ReadOnlyProperty } from "scenerystack/axon";
import { PhetColorScheme, ArrowNode } from "scenerystack/scenery-phet";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { PhetFont } from "scenerystack";
import SimulationAnnouncer from "../util/SimulationAnnouncer.js";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";
import classicalMechanics from '../../ClassicalMechanicsNamespace.js';

/**
 * Configuration for a single vector type (velocity, force, or acceleration)
 */
export interface VectorConfig {
  showProperty: BooleanProperty;
  labelProperty: ReadOnlyProperty<string>;
  a11yStrings: {
    shown: ReadOnlyProperty<string>;
    hidden: ReadOnlyProperty<string>;
  };
}

/**
 * Self options for VectorControlPanel - options specific to this component.
 */
type SelfOptions = {
  /** Velocity vector configuration */
  velocity: VectorConfig;
  /** Force vector configuration */
  force: VectorConfig;
  /** Acceleration vector configuration */
  acceleration: VectorConfig;
};

/**
 * Options for VectorControlPanel constructor.
 * Combines self options with parent PanelOptions.
 */
export type VectorControlPanelOptions = SelfOptions & PanelOptions;

export class VectorControlPanel extends Panel {
  public constructor(options: VectorControlPanelOptions) {
    const velocityCheckbox = new Checkbox(
      options.velocity.showProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text(options.velocity.labelProperty, {
            font: new PhetFont({size: 12}),
            fill: ClassicalMechanicsColors.textColorProperty,
          }),
          new ArrowNode(0, 0, 15, 0, {
            fill: PhetColorScheme.VELOCITY,
            stroke: PhetColorScheme.VELOCITY,
            headHeight: 6,
            headWidth: 6,
            tailWidth: 2,
          }),
        ],
      }),
      {
        boxWidth: 14,
      }
    );

    const forceCheckbox = new Checkbox(
      options.force.showProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text(options.force.labelProperty, {
            font: new PhetFont({size: 12}),
            fill: ClassicalMechanicsColors.textColorProperty,
          }),
          new ArrowNode(0, 0, 15, 0, {
            fill: PhetColorScheme.APPLIED_FORCE,
            stroke: PhetColorScheme.APPLIED_FORCE,
            headHeight: 6,
            headWidth: 6,
            tailWidth: 2,
          }),
        ],
      }),
      {
        boxWidth: 14,
      }
    );

    const accelerationCheckbox = new Checkbox(
      options.acceleration.showProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text(options.acceleration.labelProperty, {
            font: new PhetFont({size: 12}),
            fill: ClassicalMechanicsColors.textColorProperty,
          }),
          new ArrowNode(0, 0, 15, 0, {
            fill: PhetColorScheme.ACCELERATION,
            stroke: PhetColorScheme.ACCELERATION,
            headHeight: 6,
            headWidth: 6,
            tailWidth: 2,
          }),
        ],
      }),
      {
        boxWidth: 14,
      }
    );

    const content = new VBox({
      spacing: 8,
      align: "left",
      children: [velocityCheckbox, forceCheckbox, accelerationCheckbox],
    });

    super(content, {
      xMargin: 10,
      yMargin: 8,
      fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      cornerRadius: 5,
    });

    // Add accessibility announcements for vector visibility changes
    options.velocity.showProperty.lazyLink((showVelocity) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showVelocity
          ? options.velocity.a11yStrings.shown.value
          : options.velocity.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    options.force.showProperty.lazyLink((showForce) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showForce
          ? options.force.a11yStrings.shown.value
          : options.force.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    options.acceleration.showProperty.lazyLink((showAcceleration) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showAcceleration
          ? options.acceleration.a11yStrings.shown.value
          : options.acceleration.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('VectorControlPanel', VectorControlPanel);
