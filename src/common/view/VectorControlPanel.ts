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

type VectorControlPanelOptions = {
  showVelocityProperty: BooleanProperty;
  showForceProperty: BooleanProperty;
  showAccelerationProperty: BooleanProperty;
  velocityLabelProperty: ReadOnlyProperty<string>;
  forceLabelProperty: ReadOnlyProperty<string>;
  accelerationLabelProperty: ReadOnlyProperty<string>;
};

export class VectorControlPanel extends Panel {
  public constructor(options: VectorControlPanelOptions) {
    const velocityCheckbox = new Checkbox(
      options.showVelocityProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text(options.velocityLabelProperty, {
            fontSize: 12,
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
            fontSize: 12,
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
            fontSize: 12,
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
  }
}
