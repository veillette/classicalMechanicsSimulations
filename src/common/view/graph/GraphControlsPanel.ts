/**
 * Creates UI controls for the configurable graph including:
 * - Title panel with axis selection combo boxes
 * - Show/hide checkbox
 * - Header bar
 */

import { Node, HBox, Text, Rectangle } from "scenerystack/scenery";
import { ComboBox, Checkbox } from "scenerystack/sun";
import { Property, BooleanProperty, DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { PlottableProperty } from "./PlottableProperty.js";
import ClassicalMechanicsColors from "../../../ClassicalMechanicsColors.js";
import { StringManager } from "../../../i18n/StringManager.js";
import { PhetFont } from "scenerystack/scenery-phet";

export default class GraphControlsPanel {
  private readonly availableProperties: PlottableProperty[];
  private readonly xPropertyProperty: Property<PlottableProperty>;
  private readonly yPropertyProperty: Property<PlottableProperty>;
  private readonly graphVisibleProperty: BooleanProperty;
  private readonly graphWidth: number;

  public constructor(
    availableProperties: PlottableProperty[],
    xPropertyProperty: Property<PlottableProperty>,
    yPropertyProperty: Property<PlottableProperty>,
    graphVisibleProperty: BooleanProperty,
    graphWidth: number
  ) {
    this.availableProperties = availableProperties;
    this.xPropertyProperty = xPropertyProperty;
    this.yPropertyProperty = yPropertyProperty;
    this.graphVisibleProperty = graphVisibleProperty;
    this.graphWidth = graphWidth;
  }

  /**
   * Helper to get the string value from either a string or TReadOnlyProperty<string>
   */
  private getNameValue(name: string | TReadOnlyProperty<string>): string {
    return typeof name === "string" ? name : name.value;
  }

  /**
   * Create title panel with "(Y vs X)" format where Y and X are combo boxes
   */
  public createTitlePanel(listParent: Node): Node {
    const xItems = this.availableProperties.map((prop) => ({
      value: prop,
      createNode: () =>
        new Text(prop.name, {
          font: new PhetFont({size: 12}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
      tandemName: this.getNameValue(prop.name).replace(/\s/g, "") + "Item",
    }));

    const xComboBox = new ComboBox(this.xPropertyProperty, xItems, listParent, {
      cornerRadius: 5,
      xMargin: 6,
      yMargin: 3,
      buttonFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      buttonStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      listFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      listStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      highlightFill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
    });

    const yItems = this.availableProperties.map((prop) => ({
      value: prop,
      createNode: () =>
        new Text(prop.name, {
          font: new PhetFont({size: 12}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
      tandemName: this.getNameValue(prop.name).replace(/\s/g, "") + "Item",
    }));

    const yComboBox = new ComboBox(this.yPropertyProperty, yItems, listParent, {
      cornerRadius: 5,
      xMargin: 6,
      yMargin: 3,
      buttonFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      buttonStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      listFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      listStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      highlightFill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
    });

    // Create title in format "(Y vs X)"
    const leftParen = new Text("(", {
      font: new PhetFont({size: 14}),
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const vsText = new Text(" vs ", {
      font: new PhetFont({size: 14})  ,
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const rightParen = new Text(")", {
      font: new PhetFont({size: 14}),
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    // Arrange in horizontal layout: (Y vs X)
    return new HBox({
      spacing: 3,
      align: "center",
      children: [leftParen, yComboBox, vsText, xComboBox, rightParen],
    });
  }

  /**
   * Create the header bar with checkbox
   */
  public createHeaderBar(): { headerBar: Rectangle; checkbox: Checkbox } {
    const stringManager = StringManager.getInstance();
    const graphLabels = stringManager.getGraphLabels();

    const showGraphCheckbox = new Checkbox(
      this.graphVisibleProperty,
      new Text(graphLabels.showGraphStringProperty, {
        font: new PhetFont({size: 14}),
        fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      }),
      {
        boxWidth: 16,
      },
    );

    // Create header bar with dynamic fill that darkens the control panel background
    const headerHeight = 30;
    const headerFillProperty = new DerivedProperty(
      [ClassicalMechanicsColors.controlPanelBackgroundColorProperty],
      (backgroundColor) => backgroundColor.colorUtilsDarker(0.1)
    );
    const headerBar = new Rectangle(0, -headerHeight, this.graphWidth, headerHeight, 5, 5, {
      fill: headerFillProperty,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 2,
      cursor: 'grab',
    });

    return { headerBar, checkbox: showGraphCheckbox };
  }

  /**
   * Update header bar width when graph is resized
   */
  public static updateHeaderBarWidth(headerBar: Rectangle, newWidth: number): void {
    headerBar.setRect(0, -30, newWidth, 30);
  }
}
