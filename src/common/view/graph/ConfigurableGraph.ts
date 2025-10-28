/**
 * Configurable graph that allows users to select which properties to plot on each axis.
 * This provides a flexible way to explore relationships between any two quantities.
 */

import { Node, VBox, Text, Circle } from "scenerystack/scenery";
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
import {
  Property,
  BooleanProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Orientation } from "scenerystack/phet-core";
import { Shape } from "scenerystack/kite";
import type { PlottableProperty } from "./PlottableProperty.js";
import ClassicalMechanicsColors from "../../../ClassicalMechanicsColors.js";
import { StringManager } from "../../../i18n/StringManager.js";

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

  // Trail points
  private readonly trailNode: Node;
  private readonly trailLength: number = 5;

  // Visibility control
  private readonly graphVisibleProperty: BooleanProperty;
  private readonly graphContentNode: Node;

  // Axis labels
  private readonly xAxisLabelNode: Text;
  private readonly yAxisLabelNode: Text;

  // Grid and tick components
  private readonly verticalGridLineSet: GridLineSet;
  private readonly horizontalGridLineSet: GridLineSet;
  private readonly xTickMarkSet: TickMarkSet;
  private readonly yTickMarkSet: TickMarkSet;
  private readonly xTickLabelSet: TickLabelSet;
  private readonly yTickLabelSet: TickLabelSet;

  // Zoom control
  private isManuallyZoomed: boolean = false;
  private readonly zoomFactor: number = 1.1; // 10% zoom per wheel tick

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
    const initialRange = new Range(-10, 10);
    this.chartTransform = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: initialRange,
      modelYRange: initialRange,
    });

    // Calculate appropriate initial tick spacing
    const initialSpacing = this.calculateTickSpacing(initialRange.getLength());

    // Create chart background
    this.chartRectangle = new ChartRectangle(this.chartTransform, {
      fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 1,
      cornerRadius: 0,
    });
    this.graphContentNode.addChild(this.chartRectangle);

    // Create grid lines
    this.verticalGridLineSet = new GridLineSet(this.chartTransform, Orientation.VERTICAL, initialSpacing, {
      stroke: "lightgray",
      lineWidth: 0.5,
    });
    this.graphContentNode.addChild(this.verticalGridLineSet);

    this.horizontalGridLineSet = new GridLineSet(this.chartTransform, Orientation.HORIZONTAL, initialSpacing, {
      stroke: "lightgray",
      lineWidth: 0.5,
    });
    this.graphContentNode.addChild(this.horizontalGridLineSet);

    // Create tick marks
    this.xTickMarkSet = new TickMarkSet(this.chartTransform, Orientation.HORIZONTAL, initialSpacing, {
      edge: "min",
      extent: 8,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 1,
    });
    this.graphContentNode.addChild(this.xTickMarkSet);

    this.yTickMarkSet = new TickMarkSet(this.chartTransform, Orientation.VERTICAL, initialSpacing, {
      edge: "min",
      extent: 8,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 1,
    });
    this.graphContentNode.addChild(this.yTickMarkSet);

    // Create tick labels
    this.xTickLabelSet = new TickLabelSet(this.chartTransform, Orientation.HORIZONTAL, initialSpacing, {
      edge: "min",
      createLabel: (value: number) =>
        new Text(value.toFixed(2), {
          fontSize: 10,
          fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
        }),
    });
    this.graphContentNode.addChild(this.xTickLabelSet);

    this.yTickLabelSet = new TickLabelSet(this.chartTransform, Orientation.VERTICAL, initialSpacing, {
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

    // Create trail node for showing recent points
    this.trailNode = new Node();

    // Wrap line plot and trail in a clipped container to prevent overflow
    const clippedDataContainer = new Node({
      children: [this.linePlot, this.trailNode],
      clipArea: Shape.rect(0, 0, width, height),
    });
    this.graphContentNode.addChild(clippedDataContainer);

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
    const stringManager = StringManager.getInstance();
    const graphLabels = stringManager.getGraphLabels();

    const showGraphCheckbox = new Checkbox(
      this.graphVisibleProperty,
      new Text(graphLabels.showGraphStringProperty, {
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

    // Add zoom controls (non-intrusive mouse and keyboard)
    this.setupZoomControls();
  }

  /**
   * Setup non-intrusive zoom controls using mouse wheel and keyboard
   */
  private setupZoomControls(): void {
    // Mouse wheel zoom on the chart area
    this.chartRectangle.addInputListener({
      wheel: (event) => {
        event.handle();
        const delta = event.domEvent!.deltaY;

        // Get mouse position relative to chart
        const pointerPoint = this.chartRectangle.globalToLocalPoint(event.pointer.point);

        // Zoom in or out
        if (delta < 0) {
          this.zoom(this.zoomFactor, pointerPoint);
        } else {
          this.zoom(1 / this.zoomFactor, pointerPoint);
        }
      },
    });

    // Double-click to reset to auto-scale
    this.chartRectangle.addInputListener({
      down: (event) => {
        if (event.domEvent && event.domEvent.detail === 2) {
          // Double click detected
          event.handle();
          this.resetZoom();
        }
      },
    });

    // Make chart rectangle pickable so it can receive input
    this.chartRectangle.pickable = true;
  }

  /**
   * Zoom the graph by a given factor, centered on a point
   */
  private zoom(factor: number, centerPoint: Vector2): void {
    this.isManuallyZoomed = true;

    const currentXRange = this.chartTransform.modelXRange;
    const currentYRange = this.chartTransform.modelYRange;

    // Convert center point from view to model coordinates
    const modelCenter = this.chartTransform.viewToModelPosition(centerPoint);

    // Calculate new ranges centered on the mouse position
    const xMin = modelCenter.x - (modelCenter.x - currentXRange.min) / factor;
    const xMax = modelCenter.x + (currentXRange.max - modelCenter.x) / factor;
    const yMin = modelCenter.y - (modelCenter.y - currentYRange.min) / factor;
    const yMax = modelCenter.y + (currentYRange.max - modelCenter.y) / factor;

    const newXRange = new Range(xMin, xMax);
    const newYRange = new Range(yMin, yMax);

    // Update chart transform
    this.chartTransform.setModelXRange(newXRange);
    this.chartTransform.setModelYRange(newYRange);

    // Update tick spacing
    this.updateTickSpacing(newXRange, newYRange);

    // Update trail with new transform
    this.updateTrail();
  }

  /**
   * Reset zoom to auto-scale mode
   */
  private resetZoom(): void {
    this.isManuallyZoomed = false;

    // Recalculate axis ranges based on current data
    if (this.dataPoints.length > 1) {
      this.updateAxisRanges();
    }
  }

  /**
   * Helper to get the string value from either a string or TReadOnlyProperty<string>
   */
  private getNameValue(
    name: string | TReadOnlyProperty<string>,
  ): string {
    return typeof name === "string" ? name : name.value;
  }

  /**
   * Format an axis label with the property name and unit
   */
  private formatAxisLabel(property: PlottableProperty): string {
    const nameValue = this.getNameValue(property.name);
    if (property.unit) {
      return `${nameValue} (${property.unit})`;
    }
    return nameValue;
  }

  /**
   * Create the panel with combo boxes for axis selection
   */
  private createSelectorPanel(listParent: Node): Node {
    // Get string manager
    const stringManager = StringManager.getInstance();
    const graphLabels = stringManager.getGraphLabels();

    // X-axis selector
    const xLabel = new Text(graphLabels.xAxisLabelStringProperty, {
      fontSize: 14,
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const xItems = this.availableProperties.map((prop) => ({
      value: prop,
      createNode: () =>
        new Text(prop.name, {
          fontSize: 12,
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
      tandemName: this.getNameValue(prop.name).replace(/\s/g, "") + "Item",
    }));

    const xComboBox = new ComboBox(this.xPropertyProperty, xItems, listParent, {
      cornerRadius: 5,
      xMargin: 8,
      yMargin: 4,
      buttonFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      buttonStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      listFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      listStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      highlightFill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
    });

    // Y-axis selector
    const yLabel = new Text(graphLabels.yAxisLabelStringProperty, {
      fontSize: 14,
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const yItems = this.availableProperties.map((prop) => ({
      value: prop,
      createNode: () =>
        new Text(prop.name, {
          fontSize: 12,
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
      tandemName: this.getNameValue(prop.name).replace(/\s/g, "") + "Item",
    }));

    const yComboBox = new ComboBox(this.yPropertyProperty, yItems, listParent, {
      cornerRadius: 5,
      xMargin: 8,
      yMargin: 4,
      buttonFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      buttonStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      listFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      listStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      highlightFill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
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

    // Auto-scale the axes if we have data and user hasn't manually zoomed
    if (this.dataPoints.length > 1 && !this.isManuallyZoomed) {
      this.updateAxisRanges();
    }

    // Update the trail visualization
    this.updateTrail();
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

    // Add 10% padding with a minimum to ensure reasonable range sizes
    const xSpan = xMax - xMin;
    const ySpan = yMax - yMin;

    // Use 10% padding but ensure a minimum range of 2 units
    const xPadding = Math.max(xSpan * 0.1, (2 - xSpan) / 2, 0.1);
    const yPadding = Math.max(ySpan * 0.1, (2 - ySpan) / 2, 0.1);

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
    // Calculate appropriate tick spacing (aim for ~5 ticks to avoid clutter)
    const xSpacing = this.calculateTickSpacing(xRange.getLength());
    const ySpacing = this.calculateTickSpacing(yRange.getLength());

    this.verticalGridLineSet.setSpacing(ySpacing);
    this.horizontalGridLineSet.setSpacing(xSpacing);
    this.xTickMarkSet.setSpacing(xSpacing);
    this.yTickMarkSet.setSpacing(ySpacing);
    this.xTickLabelSet.setSpacing(xSpacing);
    this.yTickLabelSet.setSpacing(ySpacing);
  }

  /**
   * Calculate appropriate tick spacing for a given range
   */
  private calculateTickSpacing(rangeLength: number): number {
    // Handle edge cases
    if (!isFinite(rangeLength) || rangeLength <= 0) {
      return 1;
    }

    // Target ~5-6 ticks to avoid too many grid lines
    const targetTicks = 5;
    const roughSpacing = rangeLength / targetTicks;

    // Handle very small spacings
    if (roughSpacing < 1e-10) {
      return 1e-10;
    }

    // Round to a nice number (1, 2, 5, 10, 20, 50, etc.)
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughSpacing)));
    const residual = roughSpacing / magnitude;

    let spacing: number;
    if (residual <= 1.5) {
      spacing = magnitude;
    } else if (residual <= 3.5) {
      spacing = 2 * magnitude;
    } else if (residual <= 7.5) {
      spacing = 5 * magnitude;
    } else {
      spacing = 10 * magnitude;
    }

    // Ensure minimum spacing to prevent too many ticks
    return Math.max(spacing, rangeLength / 20);
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

    // Clear trail
    this.trailNode.removeAllChildren();

    // Reset zoom state
    this.isManuallyZoomed = false;
  }

  /**
   * Update the trail visualization showing the most recent points
   */
  private updateTrail(): void {
    // Clear existing trail circles
    this.trailNode.removeAllChildren();

    // Get the last N points (up to trailLength)
    const numTrailPoints = Math.min(this.trailLength, this.dataPoints.length);
    if (numTrailPoints === 0) {
      return;
    }

    // Start from the most recent points
    const startIndex = this.dataPoints.length - numTrailPoints;

    for (let i = 0; i < numTrailPoints; i++) {
      const point = this.dataPoints[startIndex + i];

      // Calculate the age of this point (0 = oldest in trail, numTrailPoints-1 = newest)
      const age = i;
      const fraction = age / (numTrailPoints - 1 || 1); // 0 to 1, where 1 is newest

      // Size and opacity increase with recency
      // Oldest point: small and transparent
      // Newest point: large and opaque
      const minRadius = 3;
      const maxRadius = 5;
      const radius = minRadius + (maxRadius - minRadius) * fraction;

      const minOpacity = 0.2;
      const maxOpacity = 0.8;
      const opacity = minOpacity + (maxOpacity - minOpacity) * fraction;

      // Transform model coordinates to view coordinates
      const viewPosition = this.chartTransform.modelToViewPosition(point);

      // Create circle for this trail point
      const circle = new Circle(radius, {
        fill: ClassicalMechanicsColors.graphLine1ColorProperty,
        opacity: opacity,
        center: viewPosition,
      });

      this.trailNode.addChild(circle);
    }
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
