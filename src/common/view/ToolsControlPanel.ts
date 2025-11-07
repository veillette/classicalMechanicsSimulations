/**
 * Control panel for visualization tools.
 * Displays checkboxes for grid, distance tool, protractor, and stopwatch.
 */

import { Panel } from "scenerystack/sun";
import { VBox, HBox, Text } from "scenerystack/scenery";
import { Checkbox } from "scenerystack/sun";
import { BooleanProperty, type ReadOnlyProperty } from "scenerystack/axon";
import { GridIcon } from "scenerystack/scenery-phet";
import { PhetFont } from "scenerystack";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import SimulationAnnouncer from "../util/SimulationAnnouncer.js";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";


type ToolsControlPanelOptions = {
  showGridProperty: BooleanProperty;
  showDistanceToolProperty: BooleanProperty;
  showStopwatchProperty: BooleanProperty;
  showProtractorProperty?: BooleanProperty; // Optional for spring screens
  showGraphProperty?: BooleanProperty; // Optional - for configurable graph
  gridLabelProperty: ReadOnlyProperty<string>;
  distanceToolLabelProperty: ReadOnlyProperty<string>;
  protractorLabelProperty?: ReadOnlyProperty<string>; // Optional for spring screens
  stopwatchLabelProperty: ReadOnlyProperty<string>;
  graphLabelProperty?: ReadOnlyProperty<string>; // Optional - for configurable graph
  gridShownStringProperty: ReadOnlyProperty<string>;
  gridHiddenStringProperty: ReadOnlyProperty<string>;
  distanceToolShownStringProperty: ReadOnlyProperty<string>;
  distanceToolHiddenStringProperty: ReadOnlyProperty<string>;
  protractorShownStringProperty?: ReadOnlyProperty<string>;
  protractorHiddenStringProperty?: ReadOnlyProperty<string>;
  stopwatchShownStringProperty: ReadOnlyProperty<string>;
  stopwatchHiddenStringProperty: ReadOnlyProperty<string>;
  graphShownStringProperty?: ReadOnlyProperty<string>;
  graphHiddenStringProperty?: ReadOnlyProperty<string>;
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
            font: new PhetFont({size: 14}),
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
        font: new PhetFont({size: 14}),
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      {
        boxWidth: 16,
      }
    );

    const showStopwatchCheckbox = new Checkbox(
      options.showStopwatchProperty,
      new Text(options.stopwatchLabelProperty, {
        font: new PhetFont({size: 14}),
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      {
        boxWidth: 16,
      }
    );

    const children = [
      showGridCheckbox,
      showDistanceToolCheckbox,
      showStopwatchCheckbox,
    ];

    // Add protractor checkbox if provided (for pendulum screens)
    if (options.showProtractorProperty && options.protractorLabelProperty) {
      const showProtractorCheckbox = new Checkbox(
        options.showProtractorProperty,
        new Text(options.protractorLabelProperty, {
          font: new PhetFont({size: 14}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        {
          boxWidth: 16,
        }
      );
      // Insert protractor before stopwatch
      children.splice(2, 0, showProtractorCheckbox);
    }

    // Add graph checkbox if provided (for configurable graph)
    if (options.showGraphProperty && options.graphLabelProperty) {
      const showGraphCheckbox = new Checkbox(
        options.showGraphProperty,
        new Text(options.graphLabelProperty, {
          font: new PhetFont({size: 14}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        {
          boxWidth: 16,
        }
      );
      // Add graph checkbox at the end
      children.push(showGraphCheckbox);
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

    // Add accessibility announcements for tool visibility changes
    options.showGridProperty.lazyLink((showGrid) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showGrid
          ? options.gridShownStringProperty.value
          : options.gridHiddenStringProperty.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    options.showDistanceToolProperty.lazyLink((showDistanceTool) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showDistanceTool
          ? options.distanceToolShownStringProperty.value
          : options.distanceToolHiddenStringProperty.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    options.showStopwatchProperty.lazyLink((showStopwatch) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showStopwatch
          ? options.stopwatchShownStringProperty.value
          : options.stopwatchHiddenStringProperty.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    // Add protractor announcements if provided (for pendulum screens)
    if (options.showProtractorProperty && options.protractorShownStringProperty && options.protractorHiddenStringProperty) {
      const protractorShownString = options.protractorShownStringProperty;
      const protractorHiddenString = options.protractorHiddenStringProperty;
      options.showProtractorProperty.lazyLink((showProtractor) => {
        if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
          const announcement = showProtractor
            ? protractorShownString.value
            : protractorHiddenString.value;
          SimulationAnnouncer.announceSimulationState(announcement);
        }
      });
    }

    // Add graph announcements if provided (for configurable graph)
    if (options.showGraphProperty && options.graphShownStringProperty && options.graphHiddenStringProperty) {
      const graphShownString = options.graphShownStringProperty;
      const graphHiddenString = options.graphHiddenStringProperty;
      options.showGraphProperty.lazyLink((showGraph) => {
        if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
          const announcement = showGraph
            ? graphShownString.value
            : graphHiddenString.value;
          SimulationAnnouncer.announceSimulationState(announcement);
        }
      });
    }
  }
}
