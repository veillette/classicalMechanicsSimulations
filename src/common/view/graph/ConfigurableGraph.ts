/**
 * Configurable graph that allows users to select which properties to plot on each axis.
 * This provides a flexible way to explore relationships between any two quantities.
 */

import { Node, VBox, HBox, Text, Circle, DragListener, type Pointer } from "scenerystack/scenery";
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
import SimulationAnnouncer from "../../util/SimulationAnnouncer.js";

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
      stroke: ClassicalMechanicsColors.graphGridColorProperty,
      lineWidth: 0.5,
    });
    this.graphContentNode.addChild(this.verticalGridLineSet);

    this.horizontalGridLineSet = new GridLineSet(this.chartTransform, Orientation.HORIZONTAL, initialSpacing, {
      stroke: ClassicalMechanicsColors.graphGridColorProperty,
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

    // Create title panel with "(Y vs X)" format at the top of the graph
    const titlePanel = this.createTitlePanel(listParent);
    titlePanel.centerX = this.graphWidth / 2;
    titlePanel.bottom = -10;
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

    // Add zoom and pan controls (non-intrusive mouse and keyboard)
    this.setupZoomControls();
    this.setupPanControls();
    this.setupTouchZoomControls();
    this.setupYAxisTouchControls();
    this.setupXAxisTouchControls();

    // Link visibility changes to announce using voicing
    this.graphVisibleProperty.link((visible) => {
      const announcement = visible
        ? a11yStrings.graphShownStringProperty.value
        : a11yStrings.graphHiddenStringProperty.value;
      SimulationAnnouncer.announceGraphChange(announcement);
    });
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
   * Setup pan controls using drag
   */
  private setupPanControls(): void {
    let dragStartModelPoint: Vector2 | null = null;
    let dragStartXRange: Range | null = null;
    let dragStartYRange: Range | null = null;

    const dragListener = new DragListener({
      start: (event) => {
        // Record the starting point in model coordinates
        const viewPoint = this.chartRectangle.globalToLocalPoint(event.pointer.point);
        dragStartModelPoint = this.chartTransform.viewToModelPosition(viewPoint);
        dragStartXRange = this.chartTransform.modelXRange.copy();
        dragStartYRange = this.chartTransform.modelYRange.copy();

        // Mark as manually zoomed so auto-scaling doesn't interfere
        this.isManuallyZoomed = true;
      },

      drag: (event) => {
        if (dragStartModelPoint && dragStartXRange && dragStartYRange) {
          // Get current point in model coordinates
          const viewPoint = this.chartRectangle.globalToLocalPoint(event.pointer.point);
          const currentModelPoint = this.chartTransform.viewToModelPosition(viewPoint);

          // Calculate the delta in model coordinates
          const deltaX = dragStartModelPoint.x - currentModelPoint.x;
          const deltaY = dragStartModelPoint.y - currentModelPoint.y;

          // Translate the ranges by the delta
          const newXRange = new Range(
            dragStartXRange.min + deltaX,
            dragStartXRange.max + deltaX
          );
          const newYRange = new Range(
            dragStartYRange.min + deltaY,
            dragStartYRange.max + deltaY
          );

          // Update the chart transform
          this.chartTransform.setModelXRange(newXRange);
          this.chartTransform.setModelYRange(newYRange);

          // Update tick spacing
          this.updateTickSpacing(newXRange, newYRange);

          // Update trail with new transform
          this.updateTrail();
        }
      },

      end: () => {
        // Clean up
        dragStartModelPoint = null;
        dragStartXRange = null;
        dragStartYRange = null;
      },
    });

    this.chartRectangle.addInputListener(dragListener);
    this.chartRectangle.cursor = 'move';
  }

  /**
   * Setup touch-based pinch-to-zoom on the chart area
   */
  private setupTouchZoomControls(): void {
    // Track active touch pointers
    const activePointers = new Map<Pointer, Vector2>();
    let initialDistance: number | null = null;
    let initialMidpoint: Vector2 | null = null;
    let initialXRange: Range | null = null;
    let initialYRange: Range | null = null;

    this.chartRectangle.addInputListener({
      down: (event) => {
        // Only track touch events (not mouse)
        if (event.pointer.type === 'touch') {
          const localPoint = this.chartRectangle.globalToLocalPoint(event.pointer.point);
          activePointers.set(event.pointer, localPoint);

          // If we now have exactly 2 touches, start pinch gesture
          if (activePointers.size === 2) {
            const points = Array.from(activePointers.values());
            initialDistance = points[0].distance(points[1]);
            initialMidpoint = points[0].average(points[1]);
            initialXRange = this.chartTransform.modelXRange.copy();
            initialYRange = this.chartTransform.modelYRange.copy();
            this.isManuallyZoomed = true;
          }
        }
      },

      move: (event) => {
        // Only handle touch events
        if (event.pointer.type === 'touch' && activePointers.has(event.pointer)) {
          const localPoint = this.chartRectangle.globalToLocalPoint(event.pointer.point);
          activePointers.set(event.pointer, localPoint);

          // If we have exactly 2 touches, perform pinch zoom
          if (activePointers.size === 2 && initialDistance && initialMidpoint && initialXRange && initialYRange) {
            const points = Array.from(activePointers.values());
            const currentDistance = points[0].distance(points[1]);

            // Calculate zoom factor from distance ratio
            const zoomFactor = initialDistance / currentDistance;

            // Convert initial midpoint to model coordinates
            const initialModelCenter = this.chartTransform.viewToModelPosition(initialMidpoint);

            // Calculate new ranges centered on the initial midpoint
            const xMin = initialModelCenter.x - (initialModelCenter.x - initialXRange.min) * zoomFactor;
            const xMax = initialModelCenter.x + (initialXRange.max - initialModelCenter.x) * zoomFactor;
            const yMin = initialModelCenter.y - (initialModelCenter.y - initialYRange.min) * zoomFactor;
            const yMax = initialModelCenter.y + (initialYRange.max - initialModelCenter.y) * zoomFactor;

            // Apply the zoom
            this.chartTransform.setModelXRange(new Range(xMin, xMax));
            this.chartTransform.setModelYRange(new Range(yMin, yMax));

            // Update tick spacing
            this.updateTickSpacing(
              this.chartTransform.modelXRange,
              this.chartTransform.modelYRange
            );

            // Update trail
            this.updateTrail();
          }
        }
      },

      up: (event) => {
        // Remove this pointer from tracking
        if (event.pointer.type === 'touch') {
          activePointers.delete(event.pointer);

          // Reset pinch state if we no longer have 2 touches
          if (activePointers.size < 2) {
            initialDistance = null;
            initialMidpoint = null;
            initialXRange = null;
            initialYRange = null;
          }
        }
      },

      cancel: (event) => {
        // Handle cancelled touches (e.g., when gesture is interrupted)
        if (event.pointer.type === 'touch') {
          activePointers.delete(event.pointer);
          if (activePointers.size < 2) {
            initialDistance = null;
            initialMidpoint = null;
            initialXRange = null;
            initialYRange = null;
          }
        }
      },
    });
  }

  /**
   * Setup touch controls for the Y-axis (tick labels)
   * Allows pinch-to-zoom on Y-axis only and one-finger drag for vertical panning
   */
  private setupYAxisTouchControls(): void {
    // Track active touch pointers for Y-axis
    const activePointers = new Map<Pointer, Vector2>();
    let initialYDistance: number | null = null;
    let initialYMidpoint: number | null = null;
    let initialYRange: Range | null = null;
    let singleTouchStartY: number | null = null;

    this.yTickLabelSet.addInputListener({
      down: (event) => {
        if (event.pointer.type === 'touch') {
          const globalPoint = event.pointer.point;
          activePointers.set(event.pointer, globalPoint);

          if (activePointers.size === 1) {
            // Single touch - prepare for vertical pan
            singleTouchStartY = globalPoint.y;
            initialYRange = this.chartTransform.modelYRange.copy();
            this.isManuallyZoomed = true;
          } else if (activePointers.size === 2) {
            // Two touches - prepare for pinch zoom on Y-axis
            const points = Array.from(activePointers.values());
            initialYDistance = Math.abs(points[0].y - points[1].y);
            initialYMidpoint = (points[0].y + points[1].y) / 2;
            initialYRange = this.chartTransform.modelYRange.copy();
            singleTouchStartY = null; // Cancel single touch
            this.isManuallyZoomed = true;
          }
        }
      },

      move: (event) => {
        if (event.pointer.type === 'touch' && activePointers.has(event.pointer)) {
          const globalPoint = event.pointer.point;
          activePointers.set(event.pointer, globalPoint);

          if (activePointers.size === 1 && singleTouchStartY !== null && initialYRange) {
            // Single touch - vertical pan
            const deltaY = globalPoint.y - singleTouchStartY;

            // Convert delta to model coordinates
            // Negative because screen Y increases downward, but model Y typically increases upward
            const modelDeltaY = -deltaY * (initialYRange.getLength() / this.graphHeight);

            const newYRange = new Range(
              initialYRange.min + modelDeltaY,
              initialYRange.max + modelDeltaY
            );

            this.chartTransform.setModelYRange(newYRange);
            this.updateTickSpacing(this.chartTransform.modelXRange, newYRange);
            this.updateTrail();

          } else if (activePointers.size === 2 && initialYDistance && initialYMidpoint !== null && initialYRange) {
            // Two touches - pinch zoom on Y-axis only
            const points = Array.from(activePointers.values());
            const currentYDistance = Math.abs(points[0].y - points[1].y);

            // Calculate zoom factor from Y-distance ratio
            const zoomFactor = initialYDistance / currentYDistance;

            // Convert initial midpoint Y to model coordinates
            const viewMidpoint = new Vector2(this.graphWidth / 2, initialYMidpoint);
            const localMidpoint = this.chartRectangle.globalToLocalPoint(viewMidpoint);
            const modelMidpointY = this.chartTransform.viewToModelPosition(localMidpoint).y;

            // Calculate new Y range centered on the midpoint
            const yMin = modelMidpointY - (modelMidpointY - initialYRange.min) * zoomFactor;
            const yMax = modelMidpointY + (initialYRange.max - modelMidpointY) * zoomFactor;

            this.chartTransform.setModelYRange(new Range(yMin, yMax));
            this.updateTickSpacing(this.chartTransform.modelXRange, new Range(yMin, yMax));
            this.updateTrail();
          }
        }
      },

      up: (event) => {
        if (event.pointer.type === 'touch') {
          activePointers.delete(event.pointer);

          if (activePointers.size < 2) {
            initialYDistance = null;
            initialYMidpoint = null;
          }
          if (activePointers.size === 0) {
            singleTouchStartY = null;
            initialYRange = null;
          }
        }
      },

      cancel: (event) => {
        if (event.pointer.type === 'touch') {
          activePointers.delete(event.pointer);
          if (activePointers.size < 2) {
            initialYDistance = null;
            initialYMidpoint = null;
          }
          if (activePointers.size === 0) {
            singleTouchStartY = null;
            initialYRange = null;
          }
        }
      },
    });

    // Make Y-axis tick labels pickable so they can receive touch input
    this.yTickLabelSet.pickable = true;

    // Add mouse wheel support for Y-axis scrolling
    this.yTickLabelSet.addInputListener({
      wheel: (event) => {
        event.handle();
        const delta = event.domEvent!.deltaY;
        const currentRange = this.chartTransform.modelYRange;
        const panAmount = currentRange.getLength() * 0.1; // Pan by 10% of range

        // Scroll up = pan up (increase Y values), scroll down = pan down (decrease Y values)
        const newYRange = new Range(
          currentRange.min + (delta > 0 ? -panAmount : panAmount),
          currentRange.max + (delta > 0 ? -panAmount : panAmount)
        );

        this.chartTransform.setModelYRange(newYRange);
        this.updateTickSpacing(this.chartTransform.modelXRange, newYRange);
        this.updateTrail();
        this.isManuallyZoomed = true;
      },
    });
  }

  /**
   * Setup touch controls for the X-axis (tick labels)
   * Allows pinch-to-zoom on X-axis only and one-finger drag for horizontal panning
   */
  private setupXAxisTouchControls(): void {
    // Track active touch pointers for X-axis
    const activePointers = new Map<Pointer, Vector2>();
    let initialXDistance: number | null = null;
    let initialXMidpoint: number | null = null;
    let initialXRange: Range | null = null;
    let singleTouchStartX: number | null = null;

    this.xTickLabelSet.addInputListener({
      down: (event) => {
        if (event.pointer.type === 'touch') {
          const globalPoint = event.pointer.point;
          activePointers.set(event.pointer, globalPoint);

          if (activePointers.size === 1) {
            // Single touch - prepare for horizontal pan
            singleTouchStartX = globalPoint.x;
            initialXRange = this.chartTransform.modelXRange.copy();
            this.isManuallyZoomed = true;
          } else if (activePointers.size === 2) {
            // Two touches - prepare for pinch zoom on X-axis
            const points = Array.from(activePointers.values());
            initialXDistance = Math.abs(points[0].x - points[1].x);
            initialXMidpoint = (points[0].x + points[1].x) / 2;
            initialXRange = this.chartTransform.modelXRange.copy();
            singleTouchStartX = null; // Cancel single touch
            this.isManuallyZoomed = true;
          }
        }
      },

      move: (event) => {
        if (event.pointer.type === 'touch' && activePointers.has(event.pointer)) {
          const globalPoint = event.pointer.point;
          activePointers.set(event.pointer, globalPoint);

          if (activePointers.size === 1 && singleTouchStartX !== null && initialXRange) {
            // Single touch - horizontal pan
            const deltaX = globalPoint.x - singleTouchStartX;

            // Convert delta to model coordinates
            const modelDeltaX = -deltaX * (initialXRange.getLength() / this.graphWidth);

            const newXRange = new Range(
              initialXRange.min + modelDeltaX,
              initialXRange.max + modelDeltaX
            );

            this.chartTransform.setModelXRange(newXRange);
            this.updateTickSpacing(newXRange, this.chartTransform.modelYRange);
            this.updateTrail();

          } else if (activePointers.size === 2 && initialXDistance && initialXMidpoint !== null && initialXRange) {
            // Two touches - pinch zoom on X-axis only
            const points = Array.from(activePointers.values());
            const currentXDistance = Math.abs(points[0].x - points[1].x);

            // Calculate zoom factor from X-distance ratio
            const zoomFactor = initialXDistance / currentXDistance;

            // Convert initial midpoint X to model coordinates
            const viewMidpoint = new Vector2(initialXMidpoint, this.graphHeight / 2);
            const localMidpoint = this.chartRectangle.globalToLocalPoint(viewMidpoint);
            const modelMidpointX = this.chartTransform.viewToModelPosition(localMidpoint).x;

            // Calculate new X range centered on the midpoint
            const xMin = modelMidpointX - (modelMidpointX - initialXRange.min) * zoomFactor;
            const xMax = modelMidpointX + (initialXRange.max - modelMidpointX) * zoomFactor;

            this.chartTransform.setModelXRange(new Range(xMin, xMax));
            this.updateTickSpacing(new Range(xMin, xMax), this.chartTransform.modelYRange);
            this.updateTrail();
          }
        }
      },

      up: (event) => {
        if (event.pointer.type === 'touch') {
          activePointers.delete(event.pointer);

          if (activePointers.size < 2) {
            initialXDistance = null;
            initialXMidpoint = null;
          }
          if (activePointers.size === 0) {
            singleTouchStartX = null;
            initialXRange = null;
          }
        }
      },

      cancel: (event) => {
        if (event.pointer.type === 'touch') {
          activePointers.delete(event.pointer);
          if (activePointers.size < 2) {
            initialXDistance = null;
            initialXMidpoint = null;
          }
          if (activePointers.size === 0) {
            singleTouchStartX = null;
            initialXRange = null;
          }
        }
      },
    });

    // Make X-axis tick labels pickable so they can receive touch input
    this.xTickLabelSet.pickable = true;

    // Add mouse wheel support for X-axis scrolling
    this.xTickLabelSet.addInputListener({
      wheel: (event) => {
        event.handle();
        const delta = event.domEvent!.deltaY;
        const currentRange = this.chartTransform.modelXRange;
        const panAmount = currentRange.getLength() * 0.1; // Pan by 10% of range

        // Scroll down = pan right (increase X values), scroll up = pan left (decrease X values)
        const newXRange = new Range(
          currentRange.min + (delta > 0 ? panAmount : -panAmount),
          currentRange.max + (delta > 0 ? panAmount : -panAmount)
        );

        this.chartTransform.setModelXRange(newXRange);
        this.updateTickSpacing(newXRange, this.chartTransform.modelYRange);
        this.updateTrail();
        this.isManuallyZoomed = true;
      },
    });
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
  /**
   * Create title panel with "(Y vs X)" format where Y and X are combo boxes
   */
  private createTitlePanel(listParent: Node): Node {
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
          fontSize: 12,
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
      fontSize: 14,
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const vsText = new Text(" vs ", {
      fontSize: 14,
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const rightParen = new Text(")", {
      fontSize: 14,
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
