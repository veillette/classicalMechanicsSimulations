/**
 * Control panel for visualization tools.
 * Displays checkboxes for grid, distance tool, protractor, and stopwatch.
 */

import { Panel } from "scenerystack/sun";
import { VBox, HBox, Text } from "scenerystack/scenery";
import { Checkbox } from "scenerystack/sun";
import { BooleanProperty, type ReadOnlyProperty } from "scenerystack/axon";
import { GridIcon } from "scenerystack/scenery-phet";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";

type ToolsControlPanelOptions = {
  showGridProperty: BooleanProperty;
  showDistanceToolProperty: BooleanProperty;
  showStopwatchProperty: BooleanProperty;
  showProtractorProperty?: BooleanProperty; // Optional for spring screens
  gridLabelProperty: ReadOnlyProperty<string>;
  distanceToolLabelProperty: ReadOnlyProperty<string>;
  protractorLabelProperty?: ReadOnlyProperty<string>; // Optional for spring screens
  stopwatchLabelProperty: ReadOnlyProperty<string>;
};

export class ToolsControlPanel extends Panel {
  public constructor(options: ToolsControlPanelOptions) {
    const gridIcon = new GridIcon({
      size: 16,
    });

    const showGridCheckbox = new Checkbox(
      options.showGridProperty,
      new HBox({
        spacing: 5,
        children: [
          gridIcon,
          new Text(options.gridLabelProperty, {
            fontSize: 14,
            fill: ClassicalMechanicsColors.textColorProperty,
          }),
        ],
      }),
      {
        boxWidth: 16,
      }
    );

    const showDistanceToolCheckbox = new Checkbox(
      options.showDistanceToolProperty,
      new Text(options.distanceToolLabelProperty, {
        fontSize: 14,
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      {
        boxWidth: 16,
      }
    );

    const showStopwatchCheckbox = new Checkbox(
      options.showStopwatchProperty,
      new Text(options.stopwatchLabelProperty, {
        fontSize: 14,
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      {
        boxWidth: 16,
      }
    );

    const children: any[] = [
      showGridCheckbox,
      showDistanceToolCheckbox,
      showStopwatchCheckbox,
    ];

    // Add protractor checkbox if provided (for pendulum screens)
    if (options.showProtractorProperty && options.protractorLabelProperty) {
      const showProtractorCheckbox = new Checkbox(
        options.showProtractorProperty,
        new Text(options.protractorLabelProperty, {
          fontSize: 14,
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        {
          boxWidth: 16,
        }
      );
      // Insert protractor before stopwatch
      children.splice(2, 0, showProtractorCheckbox);
    }

    const content = new VBox({
      spacing: 8,
      align: "left",
      children,
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
