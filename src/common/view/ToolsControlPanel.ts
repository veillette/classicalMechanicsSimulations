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

/**
 * Configuration for a single tool
 */
export interface ToolConfig {
  showProperty: BooleanProperty;
  labelProperty: ReadOnlyProperty<string>;
  a11yStrings: {
    shown: ReadOnlyProperty<string>;
    hidden: ReadOnlyProperty<string>;
  };
}

/**
 * Options for the ToolsControlPanel
 */
export type ToolsControlPanelOptions = {
  grid: ToolConfig;
  distance: ToolConfig;
  stopwatch: ToolConfig;
  protractor?: ToolConfig; // Optional for spring screens
  graph?: ToolConfig; // Optional - for configurable graph
};

export class ToolsControlPanel extends Panel {
  public constructor(options: ToolsControlPanelOptions) {
    const gridIcon = new GridIcon({
      size: 16,
    });

    const showGridCheckbox = new Checkbox(
      options.grid.showProperty,
      new HBox({
        spacing: 5,
        children: [
          gridIcon,
          new Text(options.grid.labelProperty, {
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
      options.distance.showProperty,
      new Text(options.distance.labelProperty, {
        font: new PhetFont({size: 14}),
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      {
        boxWidth: 16,
      }
    );

    const showStopwatchCheckbox = new Checkbox(
      options.stopwatch.showProperty,
      new Text(options.stopwatch.labelProperty, {
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
    if (options.protractor) {
      const showProtractorCheckbox = new Checkbox(
        options.protractor.showProperty,
        new Text(options.protractor.labelProperty, {
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
    if (options.graph) {
      const showGraphCheckbox = new Checkbox(
        options.graph.showProperty,
        new Text(options.graph.labelProperty, {
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
    options.grid.showProperty.lazyLink((showGrid) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showGrid
          ? options.grid.a11yStrings.shown.value
          : options.grid.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    options.distance.showProperty.lazyLink((showDistanceTool) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showDistanceTool
          ? options.distance.a11yStrings.shown.value
          : options.distance.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    options.stopwatch.showProperty.lazyLink((showStopwatch) => {
      if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
        const announcement = showStopwatch
          ? options.stopwatch.a11yStrings.shown.value
          : options.stopwatch.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    // Add protractor announcements if provided (for pendulum screens)
    if (options.protractor) {
      options.protractor.showProperty.lazyLink((showProtractor) => {
        if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
          const announcement = showProtractor
            ? options.protractor!.a11yStrings.shown.value
            : options.protractor!.a11yStrings.hidden.value;
          SimulationAnnouncer.announceSimulationState(announcement);
        }
      });
    }

    // Add graph announcements if provided (for configurable graph)
    if (options.graph) {
      options.graph.showProperty.lazyLink((showGraph) => {
        if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
          const announcement = showGraph
            ? options.graph!.a11yStrings.shown.value
            : options.graph!.a11yStrings.hidden.value;
          SimulationAnnouncer.announceSimulationState(announcement);
        }
      });
    }
  }
}
