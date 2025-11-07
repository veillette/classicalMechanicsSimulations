/**
 * Configurable graph that allows users to select which properties to plot on each axis.
 * This provides a flexible way to explore relationships between any two quantities.
 */

import { Node, HBox, Text } from "scenerystack/scenery";
import {
  ChartRectangle,
  ChartTransform,
  LinePlot,
  GridLineSet,
  TickMarkSet,
  TickLabelSet,
} from "scenerystack/bamboo";
import { Range } from "scenerystack/dot";
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
import SimulationAnnouncer from "../../util/SimulationAnnouncer.js";
import { PhetFont } from "scenerystack/scenery-phet";
import GraphDataManager from "./GraphDataManager.js";
import GraphInteractionHandler from "./GraphInteractionHandler.js";
import GraphControlsPanel from "./GraphControlsPanel.js";

export default class ConfigurableGraph extends Node {
  private readonly availableProperties: PlottableProperty[];
  private readonly xPropertyProperty: Property<PlottableProperty>;
  private readonly yPropertyProperty: Property<PlottableProperty>;
  private readonly chartTransform: ChartTransform;
  private readonly linePlot: LinePlot;
  private readonly chartRectangle: ChartRectangle;
  private graphWidth: number;
  private graphHeight: number;

  // Drag and resize UI components
  private readonly headerBar;
  private readonly isDraggingProperty: BooleanProperty;
  private readonly isResizingProperty: BooleanProperty;

  // Trail points
  private readonly trailNode: Node;

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

  // Module instances
  private readonly dataManager: GraphDataManager;
  private readonly interactionHandler: GraphInteractionHandler;

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
    this.graphWidth = width;
    this.graphHeight = height;

    // Properties to track current axis selections
    this.xPropertyProperty = new Property(initialXProperty);
    this.yPropertyProperty = new Property(initialYProperty);

    // Property to control graph visibility
    this.graphVisibleProperty = new BooleanProperty(false);

    // Properties for drag and resize states
    this.isDraggingProperty = new BooleanProperty(false);
    this.isResizingProperty = new BooleanProperty(false);

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

    // Create chart background
    this.chartRectangle = new ChartRectangle(this.chartTransform, {
      fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 1,
      cornerRadius: 0,
    });
    this.graphContentNode.addChild(this.chartRectangle);

    // Create grid lines, tick marks, and tick labels
    const initialSpacing = GraphDataManager.calculateTickSpacing(initialRange.getLength());

    this.verticalGridLineSet = new GridLineSet(this.chartTransform, Orientation.VERTICAL, initialSpacing, {
      stroke: ClassicalMechanicsColors.graphGridColorProperty,
      lineWidth: 0.5,
    });
    this.graphContentNode.addChild(this.verticalGridLineSet);

    this.horizontalGridLineSet = new GridLineSet(this.chartTransform, Orientation.HORIZONTAL, initialSpacing, {
      stroke: ClassicalMechanicsColors.graphGridColorProperty,
      lineWidth: 0.5,
    });
    this.graphContentNode.addChild(this.horizontalGridLineSet);

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

    this.xTickLabelSet = new TickLabelSet(this.chartTransform, Orientation.HORIZONTAL, initialSpacing, {
      edge: "min",
      createLabel: (value: number) =>
        new Text(value.toFixed(2), {
          font: new PhetFont({size: 10}),
          fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
        }),
    });
    this.graphContentNode.addChild(this.xTickLabelSet);

    this.yTickLabelSet = new TickLabelSet(this.chartTransform, Orientation.VERTICAL, initialSpacing, {
      edge: "min",
      createLabel: (value: number) =>
        new Text(value.toFixed(2), {
          font: new PhetFont({size: 10}),
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
      font: new PhetFont({size: 12}),
      fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      centerX: this.graphWidth / 2,
      top: this.graphHeight + 35,
    });
    this.graphContentNode.addChild(this.xAxisLabelNode);

    this.yAxisLabelNode = new Text(this.formatAxisLabel(initialYProperty), {
      font: new PhetFont({size: 12}),
      fill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      rotation: -Math.PI / 2,
      centerY: this.graphHeight / 2,
      right: -35,
    });
    this.graphContentNode.addChild(this.yAxisLabelNode);

    // Initialize data manager
    this.dataManager = new GraphDataManager(
      this.chartTransform,
      this.linePlot,
      this.trailNode,
      maxDataPoints,
      this.verticalGridLineSet,
      this.horizontalGridLineSet,
      this.xTickMarkSet,
      this.yTickMarkSet,
      this.xTickLabelSet,
      this.yTickLabelSet
    );

    // Create controls panel helper
    const controlsPanel = new GraphControlsPanel(
      this.availableProperties,
      this.xPropertyProperty,
      this.yPropertyProperty,
      this.graphWidth
    );

    // Create title panel with combo boxes for axis selection
    const titlePanel = controlsPanel.createTitlePanel(listParent);
    titlePanel.centerX = this.graphWidth / 2;
    titlePanel.bottom = -5;
    this.graphContentNode.addChild(titlePanel);

    // Update labels when axes change and announce using voicing
    const a11yStrings = StringManager.getInstance().getAccessibilityStrings();
    this.xPropertyProperty.link((property) => {
      this.xAxisLabelNode.string = this.formatAxisLabel(property);
      this.xAxisLabelNode.centerX = this.graphWidth / 2;
      this.clearData();
      const template = a11yStrings.xAxisChangedStringProperty.value;
      const announcement = template.replace('{{property}}', this.getNameValue(property.name));
      SimulationAnnouncer.announceGraphChange(announcement);
    });

    this.yPropertyProperty.link((property) => {
      this.yAxisLabelNode.string = this.formatAxisLabel(property);
      this.yAxisLabelNode.centerY = this.graphHeight / 2;
      this.clearData();
      const template = a11yStrings.yAxisChangedStringProperty.value;
      const announcement = template.replace('{{property}}', this.getNameValue(property.name));
      SimulationAnnouncer.announceGraphChange(announcement);
    });

    // Create header bar (checkbox is now in ToolsControlPanel)
    this.headerBar = controlsPanel.createHeaderBar();

    // Add header bar first (so it's behind the combo boxes in z-order)
    this.addChild(this.headerBar);

    // Add the graph content container (so combo boxes appear in front of header bar)
    this.addChild(this.graphContentNode);

    // Initialize interaction handler
    this.interactionHandler = new GraphInteractionHandler(
      this.chartTransform,
      this.chartRectangle,
      this.dataManager,
      this.headerBar,
      this, // graph node
      this.isDraggingProperty,
      this.isResizingProperty,
      this.xTickLabelSet,
      this.yTickLabelSet,
      this.graphWidth,
      this.graphHeight,
      this.resizeGraph.bind(this)
    );

    // Setup all interactions
    this.interactionHandler.initialize();

    // Create and add resize handles
    const resizeHandles = this.interactionHandler.createResizeHandles();
    resizeHandles.forEach(handle => this.addChild(handle));

    // Link visibility property to the content node, header bar, and resize handles
    this.graphVisibleProperty.link((visible) => {
      this.graphContentNode.visible = visible;
      this.headerBar.visible = visible;
      resizeHandles.forEach((handle) => {
        handle.visible = visible;
      });
    });

    // Add visual feedback for drag and resize operations
    this.isDraggingProperty.link((isDragging) => {
      this.opacity = isDragging ? 0.8 : 1.0;
      this.headerBar.cursor = isDragging ? 'grabbing' : 'grab';
    });

    this.isResizingProperty.link((isResizing) => {
      this.opacity = isResizing ? 0.8 : 1.0;
    });

    // Note: Visibility change announcements are now handled by ToolsControlPanel
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
   * Resize the graph to new dimensions
   */
  private resizeGraph(newWidth: number, newHeight: number): void {
    this.graphWidth = newWidth;
    this.graphHeight = newHeight;

    // Update header bar
    GraphControlsPanel.updateHeaderBarWidth(this.headerBar, newWidth);

    // Update chart transform
    this.chartTransform.setViewWidth(newWidth);
    this.chartTransform.setViewHeight(newHeight);

    // Update clipping area
    const clippedDataContainer = this.graphContentNode.children.find(
      (child) => child.clipArea !== undefined
    );
    if (clippedDataContainer) {
      clippedDataContainer.clipArea = Shape.rect(0, 0, newWidth, newHeight);
    }

    // Update axis labels positions
    this.xAxisLabelNode.centerX = newWidth / 2;
    this.xAxisLabelNode.top = newHeight + 35;
    this.yAxisLabelNode.centerY = newHeight / 2;

    // Update title panel position
    const titlePanel = this.graphContentNode.children.find(
      (child) => child instanceof HBox
    );
    if (titlePanel) {
      titlePanel.centerX = newWidth / 2;
    }

    // Update interaction handler dimensions
    this.interactionHandler.updateDimensions(newWidth, newHeight);
    this.interactionHandler.updateResizeHandlePositions();

    // Update trail with new transform
    this.dataManager.updateTrail();
  }

  /**
   * Add a new data point based on current property values
   */
  public addDataPoint(): void {
    const xValue = this.xPropertyProperty.value.property.value;
    const yValue = this.yPropertyProperty.value.property.value;

    this.dataManager.addDataPoint(xValue, yValue);
  }

  /**
   * Clear all data points
   */
  public clearData(): void {
    this.dataManager.clearData();
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

  /**
   * Get the graph visibility property
   */
  public getGraphVisibleProperty(): BooleanProperty {
    return this.graphVisibleProperty;
  }
}
