/**
 * Configurable graph that allows users to select which properties to plot on each axis.
 * This provides a flexible way to explore relationships between any two quantities.
 */

import { Node, VBox, Text } from "scenerystack/scenery";
import { ComboBox } from "scenerystack/sun";
import { ChartRectangle, ChartTransform, LinePlot } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Property } from "scenerystack/axon";
import type { PlottableProperty } from "./PlottableProperty.js";
import ClassicalMechanicsColors from "../../../ClassicalMechanicsColors.js";

export default class ConfigurableGraph extends Node {
  private readonly availableProperties: PlottableProperty[];
  private readonly xPropertyProperty: Property<PlottableProperty>;
  private readonly yPropertyProperty: Property<PlottableProperty>;
  private readonly dataPoints: Vector2[] = [];
  private readonly maxDataPoints: number;
  private readonly chartTransform: ChartTransform;
  private readonly linePlot: LinePlot;
  private readonly chartRectangle: ChartRectangle;

  /**
   * @param availableProperties - List of properties that can be plotted
   * @param initialXProperty - Initial property for x-axis
   * @param initialYProperty - Initial property for y-axis
   * @param width - Graph width in pixels
   * @param height - Graph height in pixels
   * @param maxDataPoints - Maximum number of points to store
   * @param listParent - Parent node for combo box lists
   */
  public constructor(
    availableProperties: PlottableProperty[],
    initialXProperty: PlottableProperty,
    initialYProperty: PlottableProperty,
    width: number,
    height: number,
    maxDataPoints: number = 2000,
    listParent: Node,
  ) {
    super();

    this.availableProperties = availableProperties;
    this.maxDataPoints = maxDataPoints;

    // Properties to track current axis selections
    this.xPropertyProperty = new Property(initialXProperty);
    this.yPropertyProperty = new Property(initialYProperty);

    // Create chart transform with initial ranges
    this.chartTransform = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: new Range(-10, 10),
      modelYRange: new Range(-10, 10),
    });

    // Create chart background
    this.chartRectangle = new ChartRectangle(this.chartTransform, {
      fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 1,
      cornerRadius: 0,
    });
    this.addChild(this.chartRectangle);

    // Create line plot
    this.linePlot = new LinePlot(this.chartTransform, [], {
      stroke: ClassicalMechanicsColors.graphLine1ColorProperty,
      lineWidth: 2,
    });
    this.addChild(this.linePlot);

    // Create axis selectors
    const selectorPanel = this.createSelectorPanel(listParent);
    selectorPanel.left = width + 10;
    selectorPanel.top = 0;
    this.addChild(selectorPanel);

    // Clear data when axes change
    this.xPropertyProperty.link(() => this.clearData());
    this.yPropertyProperty.link(() => this.clearData());
  }

  /**
   * Create the panel with combo boxes for axis selection
   */
  private createSelectorPanel(listParent: Node): Node {
    // X-axis selector
    const xLabel = new Text("X-axis:", {
      fontSize: 14,
      fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
    });

    const xItems = this.availableProperties.map((prop) => ({
      value: prop,
      createNode: () =>
        new Text(prop.name, {
          fontSize: 12,
        }),
      tandemName: prop.name.replace(/\s/g, ""),
    }));

    const xComboBox = new ComboBox(this.xPropertyProperty, xItems, listParent, {
      cornerRadius: 5,
      xMargin: 8,
      yMargin: 4,
    });

    // Y-axis selector
    const yLabel = new Text("Y-axis:", {
      fontSize: 14,
      fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
    });

    const yItems = this.availableProperties.map((prop) => ({
      value: prop,
      createNode: () =>
        new Text(prop.name, {
          fontSize: 12,
        }),
      tandemName: prop.name.replace(/\s/g, ""),
    }));

    const yComboBox = new ComboBox(this.yPropertyProperty, yItems, listParent, {
      cornerRadius: 5,
      xMargin: 8,
      yMargin: 4,
    });

    // Arrange in vertical layout
    return new VBox({
      spacing: 10,
      align: "left",
      children: [
        new VBox({ spacing: 5, align: "left", children: [xLabel, xComboBox] }),
        new VBox({ spacing: 5, align: "left", children: [yLabel, yComboBox] }),
      ],
    });
  }

  /**
   * Add a new data point based on current property values
   */
  public addDataPoint(): void {
    const xValue = this.xPropertyProperty.value.property.value;
    const yValue = this.yPropertyProperty.value.property.value;

    // Skip invalid values
    if (!isFinite(xValue) || !isFinite(yValue)) {
      return;
    }

    // Add point
    this.dataPoints.push(new Vector2(xValue, yValue));

    // Remove oldest point if we exceed max
    if (this.dataPoints.length > this.maxDataPoints) {
      this.dataPoints.shift();
    }

    // Update the line plot
    this.linePlot.setDataSet(this.dataPoints);

    // Auto-scale the axes if we have data
    if (this.dataPoints.length > 1) {
      this.updateAxisRanges();
    }
  }

  /**
   * Update axis ranges to fit all data with some padding
   */
  private updateAxisRanges(): void {
    if (this.dataPoints.length === 0) {
      return;
    }

    let xMin = this.dataPoints[0].x;
    let xMax = this.dataPoints[0].x;
    let yMin = this.dataPoints[0].y;
    let yMax = this.dataPoints[0].y;

    for (const point of this.dataPoints) {
      xMin = Math.min(xMin, point.x);
      xMax = Math.max(xMax, point.x);
      yMin = Math.min(yMin, point.y);
      yMax = Math.max(yMax, point.y);
    }

    // Add 10% padding
    const xPadding = (xMax - xMin) * 0.1 || 1;
    const yPadding = (yMax - yMin) * 0.1 || 1;

    this.chartTransform.setModelXRange(
      new Range(xMin - xPadding, xMax + xPadding),
    );
    this.chartTransform.setModelYRange(
      new Range(yMin - yPadding, yMax + yPadding),
    );
  }

  /**
   * Clear all data points
   */
  public clearData(): void {
    this.dataPoints.length = 0;
    this.linePlot.setDataSet([]);

    // Reset to default ranges
    this.chartTransform.setModelXRange(new Range(-10, 10));
    this.chartTransform.setModelYRange(new Range(-10, 10));
  }

  /**
   * Get the current x-axis property
   */
  public getXProperty(): PlottableProperty {
    return this.xPropertyProperty.value;
  }

  /**
   * Get the current y-axis property
   */
  public getYProperty(): PlottableProperty {
    return this.yPropertyProperty.value;
  }
}
