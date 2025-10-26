/**
 * Configurable graph that allows users to select which properties to plot on each axis.
 * This provides a flexible way to explore relationships between any two quantities.
 */

import { Node, VBox, Text } from "scenerystack/scenery";
import { ComboBox, Checkbox } from "scenerystack/sun";
import {
  ChartRectangle,
  ChartTransform,
  LinePlot,
  GridLineSet,
  TickMarkSet,
  TickLabelSet,
} from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Property, BooleanProperty } from "scenerystack/axon";
import { Orientation } from "scenerystack/phet-core";
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
  private readonly graphWidth: number;
  private readonly graphHeight: number;

  // Visibility control
  private readonly graphVisibleProperty: BooleanProperty;
  private readonly graphContentNode: Node;

  // Axis labels
  private readonly xAxisLabelNode: Text;
  private readonly yAxisLabelNode: Text;

  // Grid and tick components
  private readonly xGridLineSet: GridLineSet;
  private readonly yGridLineSet: GridLineSet;
  private readonly xTickMarkSet: TickMarkSet;
  private readonly yTickMarkSet: TickMarkSet;
  private readonly xTickLabelSet: TickLabelSet;
  private readonly yTickLabelSet: TickLabelSet;

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
    this.graphWidth = width;
    this.graphHeight = height;

    // Properties to track current axis selections
    this.xPropertyProperty = new Property(initialXProperty);
    this.yPropertyProperty = new Property(initialYProperty);

    // Property to control graph visibility
    this.graphVisibleProperty = new BooleanProperty(true);

    // Create a container for all graph content
    this.graphContentNode = new Node();

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
    this.graphContentNode.addChild(this.chartRectangle);

    // Create grid lines
    this.xGridLineSet = new GridLineSet(this.chartTransform, Orientation.VERTICAL, 1, {
      stroke: "lightgray",
      lineWidth: 0.5,
    });
    this.graphContentNode.addChild(this.xGridLineSet);

    this.yGridLineSet = new GridLineSet(this.chartTransform, Orientation.HORIZONTAL, 1, {
      stroke: "lightgray",
      lineWidth: 0.5,
    });
    this.graphContentNode.addChild(this.yGridLineSet);

    // Create tick marks
    this.xTickMarkSet = new TickMarkSet(this.chartTransform, Orientation.HORIZONTAL, 1, {
      edge: "min",
      extent: 8,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 1,
    });
    this.graphContentNode.addChild(this.xTickMarkSet);

    this.yTickMarkSet = new TickMarkSet(this.chartTransform, Orientation.VERTICAL, 1, {
      edge: "min",
      extent: 8,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 1,
    });
    this.graphContentNode.addChild(this.yTickMarkSet);

    // Create tick labels
    this.xTickLabelSet = new TickLabelSet(this.chartTransform, Orientation.HORIZONTAL, 1, {
      edge: "min",
      createLabel: (value: number) =>
        new Text(value.toFixed(2), {
          fontSize: 10,
          fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
        }),
    });
    this.graphContentNode.addChild(this.xTickLabelSet);

    this.yTickLabelSet = new TickLabelSet(this.chartTransform, Orientation.VERTICAL, 1, {
      edge: "min",
      createLabel: (value: number) =>
        new Text(value.toFixed(2), {
          fontSize: 10,
          fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
        }),
    });
    this.graphContentNode.addChild(this.yTickLabelSet);

    // Create line plot
    this.linePlot = new LinePlot(this.chartTransform, [], {
      stroke: ClassicalMechanicsColors.graphLine1ColorProperty,
      lineWidth: 2,
    });
    this.graphContentNode.addChild(this.linePlot);

    // Create axis labels
    this.xAxisLabelNode = new Text(this.formatAxisLabel(initialXProperty), {
      fontSize: 12,
      fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      centerX: this.graphWidth / 2,
      top: this.graphHeight + 35,
    });
    this.graphContentNode.addChild(this.xAxisLabelNode);

    this.yAxisLabelNode = new Text(this.formatAxisLabel(initialYProperty), {
      fontSize: 12,
      fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      rotation: -Math.PI / 2,
      centerY: this.graphHeight / 2,
      right: -35,
    });
    this.graphContentNode.addChild(this.yAxisLabelNode);

    // Create axis selectors
    const selectorPanel = this.createSelectorPanel(listParent);
    selectorPanel.left = this.graphWidth + 10;
    selectorPanel.top = 0;
    this.graphContentNode.addChild(selectorPanel);

    // Update labels when axes change
    this.xPropertyProperty.link((property) => {
      this.xAxisLabelNode.string = this.formatAxisLabel(property);
      this.xAxisLabelNode.centerX = this.graphWidth / 2;
      this.clearData();
    });

    this.yPropertyProperty.link((property) => {
      this.yAxisLabelNode.string = this.formatAxisLabel(property);
      this.yAxisLabelNode.centerY = this.graphHeight / 2;
      this.clearData();
    });

    // Add the graph content container
    this.addChild(this.graphContentNode);

    // Link visibility property to the content node
    this.graphVisibleProperty.link((visible) => {
      this.graphContentNode.visible = visible;
    });

    // Create show/hide checkbox
    const showGraphCheckbox = new Checkbox(
      this.graphVisibleProperty,
      new Text("Show Graph", {
        fontSize: 14,
        fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      }),
      {
        boxWidth: 16,
      },
    );

    // Position checkbox at top of graph area
    showGraphCheckbox.left = 0;
    showGraphCheckbox.top = -30;
    this.addChild(showGraphCheckbox);
  }

  /**
   * Format an axis label with the property name and unit
   */
  private formatAxisLabel(property: PlottableProperty): string {
    if (property.unit) {
      return `${property.name} (${property.unit})`;
    }
    return property.name;
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

    const xRange = new Range(xMin - xPadding, xMax + xPadding);
    const yRange = new Range(yMin - yPadding, yMax + yPadding);

    this.chartTransform.setModelXRange(xRange);
    this.chartTransform.setModelYRange(yRange);

    // Update tick spacing for better readability
    this.updateTickSpacing(xRange, yRange);
  }

  /**
   * Update tick spacing based on the range
   */
  private updateTickSpacing(xRange: Range, yRange: Range): void {
    // Calculate appropriate tick spacing (aim for ~5-10 ticks)
    const xSpacing = this.calculateTickSpacing(xRange.getLength());
    const ySpacing = this.calculateTickSpacing(yRange.getLength());

    this.xGridLineSet.setSpacing(xSpacing);
    this.yGridLineSet.setSpacing(ySpacing);
    this.xTickMarkSet.setSpacing(xSpacing);
    this.yTickMarkSet.setSpacing(ySpacing);
    this.xTickLabelSet.setSpacing(xSpacing);
    this.yTickLabelSet.setSpacing(ySpacing);
  }

  /**
   * Calculate appropriate tick spacing for a given range
   */
  private calculateTickSpacing(rangeLength: number): number {
    // Target 5-10 ticks
    const roughSpacing = rangeLength / 7;

    // Round to a nice number (1, 2, 5, 10, 20, 50, etc.)
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughSpacing)));
    const residual = roughSpacing / magnitude;

    if (residual <= 1.5) {
      return magnitude;
    } else if (residual <= 3.5) {
      return 2 * magnitude;
    } else if (residual <= 7.5) {
      return 5 * magnitude;
    } else {
      return 10 * magnitude;
    }
  }

  /**
   * Clear all data points
   */
  public clearData(): void {
    this.dataPoints.length = 0;
    this.linePlot.setDataSet([]);

    // Reset to default ranges
    const defaultRange = new Range(-10, 10);
    this.chartTransform.setModelXRange(defaultRange);
    this.chartTransform.setModelYRange(defaultRange);

    // Reset tick spacing
    this.updateTickSpacing(defaultRange, defaultRange);
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
