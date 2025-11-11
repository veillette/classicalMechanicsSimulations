/**
 * Control panel for simulation parameter controls.
 * Provides a standardized panel with preset selector and parameter controls.
 */

import { Panel } from "scenerystack/sun";
import { VBox, HBox, Text, Node, TColor } from "scenerystack/scenery";
import { Property, TReadOnlyProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { PhetFont, NumberControl, type NumberControlOptions } from "scenerystack/scenery-phet";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { createPresetSelector, PresetOption } from "./PresetSelectorFactory.js";
import { Preset } from "../model/Preset.js";
import { FONT_SIZE_SECONDARY_LABEL } from "./FontSizeConstants.js";
import { SPACING_SMALL, SPACING_MEDIUM, PANEL_MARGIN_X, PANEL_MARGIN_Y } from "./UILayoutConstants.js";

/**
 * Configuration for a single parameter control
 */
export interface ParameterControlConfig {
  /** Label for the control */
  labelProperty: TReadOnlyProperty<string>;
  /** Property being controlled */
  property: NumberProperty;
  /** Valid range for the parameter */
  range: Range;
  /** Step size for slider */
  delta: number;
  /** Number of decimal places to display */
  decimalPlaces: number;
  /** Unit string (e.g., "kg", "N/m", "m/s²") */
  unit: string;
  /** Optional thumb fill color for slider (for color-coding masses) */
  thumbFill?: TColor;
}

/**
 * Options for the ParameterControlPanel
 */
export interface ParameterControlPanelOptions {
  /** Property holding the current preset selection */
  presetProperty: Property<PresetOption>;
  /** Array of available presets */
  presets: Preset[];
  /** String property for the "Custom" label */
  customLabelProperty: TReadOnlyProperty<string>;
  /** String property for the preset selector label */
  presetLabelProperty: TReadOnlyProperty<string>;
  /** Parent node for the combo box dropdown list */
  listParent: Node;
  /** Array of parameter controls to display */
  parameters: ParameterControlConfig[];
}

/**
 * A standardized panel for simulation parameters with preset selector.
 * This class reduces boilerplate by providing a common pattern for all screen views.
 */
export class ParameterControlPanel extends Panel {
  public constructor(options: ParameterControlPanelOptions) {
    // Create preset selector using factory
    const presetSelector = createPresetSelector(
      options.presetProperty,
      options.presets,
      options.customLabelProperty,
      options.listParent
    );

    const presetLabel = new Text(options.presetLabelProperty, {
      font: new PhetFont({ size: FONT_SIZE_SECONDARY_LABEL }),
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const presetRow = new HBox({
      spacing: SPACING_SMALL,
      children: [presetLabel, presetSelector],
    });

    // Create parameter controls
    const parameterControls = options.parameters.map((paramConfig) => {
      const controlOptions: NumberControlOptions = {
        delta: paramConfig.delta,
        numberDisplayOptions: {
          decimalPlaces: paramConfig.decimalPlaces,
          valuePattern: `{{value}} ${paramConfig.unit}`,
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      };

      // Add optional thumb fill color if provided (for color-coding masses)
      if (paramConfig.thumbFill) {
        controlOptions.sliderOptions = {
          thumbFill: paramConfig.thumbFill,
        };
      }

      return new NumberControl(
        paramConfig.labelProperty,
        paramConfig.property,
        paramConfig.range,
        controlOptions
      );
    });

    // Assemble panel content
    const content = new VBox({
      spacing: SPACING_MEDIUM,
      align: "left",
      children: [presetRow, ...parameterControls],
    });

    // Create panel with standard styling
    super(content, {
      xMargin: PANEL_MARGIN_X,
      yMargin: PANEL_MARGIN_Y,
      fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 1,
      cornerRadius: 5,
    });
  }
}
