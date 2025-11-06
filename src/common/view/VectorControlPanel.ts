/**
 * Control panel for vector visualization options.
 * Displays checkboxes for velocity, force, and acceleration vectors.
 */

import { Panel } from "scenerystack/sun";
import { VBox, HBox, Text } from "scenerystack/scenery";
import { Checkbox } from "scenerystack/sun";
import { BooleanProperty, type ReadOnlyProperty } from "scenerystack/axon";
import { PhetColorScheme, ArrowNode } from "scenerystack/scenery-phet";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { PhetFont } from "scenerystack";
import SimulationAnnouncer from "../util/SimulationAnnouncer.js";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";

type VectorControlPanelOptions = {
  showVelocityProperty: BooleanProperty;
  showForceProperty: BooleanProperty;
  showAccelerationProperty: BooleanProperty;
  velocityLabelProperty: ReadOnlyProperty<string>;
  forceLabelProperty: ReadOnlyProperty<string>;
  accelerationLabelProperty: ReadOnlyProperty<string>;
  velocityVectorsShownStringProperty: ReadOnlyProperty<string>;
  velocityVectorsHiddenStringProperty: ReadOnlyProperty<string>;
  forceVectorsShownStringProperty: ReadOnlyProperty<string>;
  forceVectorsHiddenStringProperty: ReadOnlyProperty<string>;
  accelerationVectorsShownStringProperty: ReadOnlyProperty<string>;
  accelerationVectorsHiddenStringProperty: ReadOnlyProperty<string>;
};

export class VectorControlPanel extends Panel {
  public constructor(options: VectorControlPanelOptions) {
    const velocityCheckbox = new Checkbox(
      options.showVelocityProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text(options.velocityLabelProperty, {
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
      options.showForceProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text(options.forceLabelProperty, {
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
      options.showAccelerationProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text(options.accelerationLabelProperty, {
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
      lineWidth: 1,
      cornerRadius: 5,
    });

    // Add accessibility announcements for vector visibility changes
    options.showVelocityProperty.lazyLink((showVelocity) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showVelocity
          ? options.velocityVectorsShownStringProperty.value
          : options.velocityVectorsHiddenStringProperty.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    options.showForceProperty.lazyLink((showForce) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showForce
          ? options.forceVectorsShownStringProperty.value
          : options.forceVectorsHiddenStringProperty.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    options.showAccelerationProperty.lazyLink((showAcceleration) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showAcceleration
          ? options.accelerationVectorsShownStringProperty.value
          : options.accelerationVectorsHiddenStringProperty.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });
  }
}
