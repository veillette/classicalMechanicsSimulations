/**
 * View for the Single Spring screen.
 * Displays a mass attached to a spring that can be dragged and oscillates.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { SingleSpringModel } from "../model/SingleSpringModel.js";
import { Rectangle, Line, VBox, HBox, Node, Text, RichText } from "scenerystack/scenery";
import { Panel, ComboBox } from "scenerystack/sun";
import { NumberControl, PhetColorScheme } from "scenerystack/scenery-phet";
import { Range } from "scenerystack/dot";
import { SpringNode } from "../../common/view/SpringNode.js";
import { ParametricSpringNode } from "../../common/view/ParametricSpringNode.js";
import SpringVisualizationType from "../../common/view/SpringVisualizationType.js";
import { VectorNode } from "../../common/view/VectorNode.js";
import { Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";
import SimulationAnnouncer from "../../common/util/SimulationAnnouncer.js";
import {
  ConfigurableGraph,
  type PlottableProperty,
} from "../../common/view/graph/index.js";
import { SingleSpringPresets } from "../model/SingleSpringPresets.js";
import { Preset } from "../../common/model/Preset.js";
import { Property, BooleanProperty } from "scenerystack/axon";
import { VectorControlPanel } from "../../common/view/VectorControlPanel.js";
import { ToolsControlPanel } from "../../common/view/ToolsControlPanel.js";
import { PhetFont } from "scenerystack";

// Custom preset type to include "Custom" option
type PresetOption = Preset | "Custom";

export class SingleSpringScreenView extends BaseScreenView<SingleSpringModel> {
  private readonly massNode: Rectangle;
  private readonly massReferenceLine: Line; // Horizontal line showing center of mass position
  private readonly classicSpringNode: SpringNode;
  private readonly parametricSpringNode: ParametricSpringNode;
  private currentSpringNode: SpringNode | ParametricSpringNode;
  private readonly fixedPoint: Vector2;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly configurableGraph: ConfigurableGraph;
  private readonly presetProperty: Property<PresetOption>;
  private readonly presets: Preset[];
  private isApplyingPreset: boolean = false;

  // Vector visualization
  private readonly showVelocityProperty: BooleanProperty;
  private readonly showForceProperty: BooleanProperty;
  private readonly showAccelerationProperty: BooleanProperty;
  private readonly velocityVectorNode: VectorNode;
  private readonly forceVectorNode: VectorNode;
  private readonly accelerationVectorNode: VectorNode;

  public constructor(model: SingleSpringModel, options?: ScreenViewOptions) {
    super(model, options);

    // Get available presets
    this.presets = SingleSpringPresets.getPresets();

    // Initialize with first preset as default
    this.presetProperty = new Property<PresetOption>(this.presets[0]);

    // Fixed point for spring attachment (top of screen, centered horizontally)
    this.fixedPoint = new Vector2(this.layoutBounds.centerX, 100);

    // Create modelViewTransform: maps model coordinates (meters) to view coordinates (pixels)
    // Maps model origin (0, 0) to the fixed point, with 50 pixels per meter
    // Positive Y model direction maps to positive Y view direction (downward)
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      this.fixedPoint,
      50, // pixels per meter
    );

    // Setup grid visualization (add early so it's behind other elements)
    this.setupGrid(0.5, this.modelViewTransform); // 0.5 meter spacing

    // Setup measurement tools (distance tool, stopwatch) - no protractor for spring screens
    this.setupMeasurementTools(this.modelViewTransform, undefined, false);

    // Wall visualization (horizontal bar at top)
    const wall = new Line(
      this.layoutBounds.centerX-20,
      this.fixedPoint.y - 20,
      this.layoutBounds.centerX+20,
      this.fixedPoint.y - 20,
      {
        stroke: ClassicalMechanicsColors.rodStrokeColorProperty,
        lineWidth: 4,
      },
    );
    this.addChild(wall);

    // Create both spring node types (only one will be visible at a time)
    this.classicSpringNode = new SpringNode({
      loops: 12,
      radius: 15,
      lineWidth: 3,
    });

    this.parametricSpringNode = new ParametricSpringNode({
      loops: 12,
      radius: 4,
      lineWidth: 3,
    });

    // Set initial spring node based on preference
    this.currentSpringNode =
      ClassicalMechanicsPreferences.springVisualizationTypeProperty.value ===
      SpringVisualizationType.PARAMETRIC
        ? this.parametricSpringNode
        : this.classicSpringNode;

    this.addChild(this.currentSpringNode);

    // Link spring constant to visual appearance
    this.model.springConstantProperty.link((k) => {
      this.updateSpringAppearance(k);
    });

    // Mass block (size will be updated based on mass value)
    this.massNode = new Rectangle(-25, -25, 50, 50, {
      fill: ClassicalMechanicsColors.mass1FillColorProperty,
      stroke: ClassicalMechanicsColors.mass1StrokeColorProperty,
      lineWidth: 2,
      cornerRadius: 3,
      cursor: "pointer",
      // Add focus highlight for accessibility
      focusHighlight: "invisible",
    });
    this.addChild(this.massNode);

    // Center of mass reference line (horizontal line across mass)
    this.massReferenceLine = new Line(0, 0, 0, 0, {
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 2,
      lineDash: [5, 3],
    });
    this.addChild(this.massReferenceLine);

    // Link mass to visual size
    this.model.massProperty.link((mass) => {
      this.updateMassSize(mass);
    });

    // Add drag listener to mass with accessibility announcements
    const a11yStrings = this.getA11yStrings();
    this.massNode.addInputListener(
      new DragListener({
        translateNode: false,
        start: () => {
          SimulationAnnouncer.announceDragInteraction(a11yStrings.draggingMassStringProperty.value);
        },
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const modelPosition =
            this.modelViewTransform.viewToModelPosition(parentPoint);
          this.model.positionProperty.value = modelPosition.y; // Use Y coordinate for vertical
          // Reset velocity when dragging
          this.model.velocityProperty.value = 0;
        },
        end: () => {
          const position = this.model.positionProperty.value.toFixed(2);
          const template = a11yStrings.massReleasedAtStringProperty.value;
          const announcement = template.replace('{{position}}', position);
          SimulationAnnouncer.announceDragInteraction(announcement);
        },
      }),
    );

    // Link model position and natural length to view
    this.model.positionProperty.link(this.updateVisualization.bind(this));
    this.model.naturalLengthProperty.link(() => this.updateVisualization(this.model.positionProperty.value));

    // Listen to spring visualization preference changes
    // Using lazyLink to avoid triggering during initialization
    ClassicalMechanicsPreferences.springVisualizationTypeProperty.lazyLink(
      (springType) => {
        this.switchSpringVisualization(springType);
      }
    );

    // Initialize vector visibility properties
    this.showVelocityProperty = new BooleanProperty(true);
    this.showForceProperty = new BooleanProperty(true);
    this.showAccelerationProperty = new BooleanProperty(false);

    // Explicitly set initial values to ensure reset() works correctly
    this.showVelocityProperty.setInitialValue(true);
    this.showForceProperty.setInitialValue(true);
    this.showAccelerationProperty.setInitialValue(false);

    // Create vector nodes
    this.velocityVectorNode = new VectorNode({
      color: PhetColorScheme.VELOCITY,
      scale: 50, // 50 pixels per m/s
      label: "v",
      minMagnitude: 0.05,
    });
    this.addChild(this.velocityVectorNode);

    this.forceVectorNode = new VectorNode({
      color: PhetColorScheme.APPLIED_FORCE,
      scale: 10, // 10 pixels per Newton
      label: "F",
      minMagnitude: 0.1,
    });
    this.addChild(this.forceVectorNode);

    this.accelerationVectorNode = new VectorNode({
      color: PhetColorScheme.ACCELERATION,
      scale: 20, // 20 pixels per m/s²
      label: "a",
      minMagnitude: 0.1,
    });
    this.addChild(this.accelerationVectorNode);

    // Link visibility properties to vector nodes
    this.showVelocityProperty.link((showVelocity) => {
      this.velocityVectorNode.setVectorVisible(showVelocity);
    });

    this.showForceProperty.link((showForce) => {
      this.forceVectorNode.setVectorVisible(showForce);
    });

    this.showAccelerationProperty.link((showAcceleration) => {
      this.accelerationVectorNode.setVectorVisible(showAcceleration);
    });

    // Control panel
    const controlPanel = this.createControlPanel();
    this.addChild(controlPanel);

    // Listen for preset changes to apply configuration
    this.presetProperty.link((preset) => {
      if (preset !== "Custom" && !this.isApplyingPreset) {
        this.applyPreset(preset);
      }
    });

    // Listen to model parameter changes to detect user modifications
    const detectCustomChange = () => {
      if (!this.isApplyingPreset && this.presetProperty.value !== "Custom") {
        this.presetProperty.value = "Custom";
      }
    };
    this.model.massProperty.lazyLink(detectCustomChange);
    this.model.springConstantProperty.lazyLink(detectCustomChange);
    this.model.dampingProperty.lazyLink(detectCustomChange);
    this.model.gravityProperty.lazyLink(detectCustomChange);

    // Add accessibility announcements for parameter changes
    this.model.massProperty.lazyLink((mass) => {
      const template = a11yStrings.massChangedStringProperty.value;
      const announcement = template.replace('{{value}}', mass.toFixed(1));
      SimulationAnnouncer.announceParameterChange(announcement);
    });
    this.model.springConstantProperty.lazyLink((springConstant) => {
      const template = a11yStrings.springConstantChangedStringProperty.value;
      const announcement = template.replace('{{value}}', springConstant.toFixed(0));
      SimulationAnnouncer.announceParameterChange(announcement);
    });
    this.model.dampingProperty.lazyLink((damping) => {
      const template = a11yStrings.dampingChangedStringProperty.value;
      const announcement = template.replace('{{value}}', damping.toFixed(1));
      SimulationAnnouncer.announceParameterChange(announcement);
    });
    this.model.gravityProperty.lazyLink((gravity) => {
      const template = a11yStrings.gravityChangedStringProperty.value;
      const announcement = template.replace('{{value}}', gravity.toFixed(1));
      SimulationAnnouncer.announceParameterChange(announcement);
    });

    // Apply the first preset immediately
    this.applyPreset(this.presets[0]);

    // Create configurable graph with available properties
    const stringManager = StringManager.getInstance();
    const propertyNames = stringManager.getGraphPropertyNames();
    const availableProperties: PlottableProperty[] = [
      {
        name: propertyNames.positionStringProperty,
        property: this.model.positionProperty,
        unit: "m",
      },
      {
        name: propertyNames.velocityStringProperty,
        property: this.model.velocityProperty,
        unit: "m/s",
      },
      {
        name: propertyNames.kineticEnergyStringProperty,
        property: this.model.kineticEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.potentialEnergyStringProperty,
        property: this.model.potentialEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.totalEnergyStringProperty,
        property: this.model.totalEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.timeStringProperty,
        property: this.model.timeProperty,
        unit: "s",
      },
    ];

    // Calculate graph width to not extend beyond the spring (at centerX)
    const GRAPH_LEFT_MARGIN = 10;
    const GRAPH_RIGHT_MARGIN = 20;
    const graphWidth = this.layoutBounds.centerX - this.layoutBounds.minX - GRAPH_LEFT_MARGIN - GRAPH_RIGHT_MARGIN;
    const graphHeight = 300;

    // Create the configurable graph (position vs time by default)
    this.configurableGraph = new ConfigurableGraph(
      availableProperties,
      availableProperties[5], // Time for x-axis
      availableProperties[0], // Position for y-axis
      graphWidth,
      graphHeight,
      2000, // max data points
      this, // list parent for combo boxes
    );
    this.addChild(this.configurableGraph);

    // Position control panel at the top right
    controlPanel.right = this.layoutBounds.maxX - 10;
    controlPanel.top = this.layoutBounds.minY + 10;

    // Create vector control panel
    const visualizationLabels = stringManager.getVisualizationLabels();
    const vectorPanel = new VectorControlPanel({
      showVelocityProperty: this.showVelocityProperty,
      showForceProperty: this.showForceProperty,
      showAccelerationProperty: this.showAccelerationProperty,
      velocityLabelProperty: visualizationLabels.velocityStringProperty,
      forceLabelProperty: visualizationLabels.forceStringProperty,
      accelerationLabelProperty: visualizationLabels.accelerationStringProperty,
    });
    vectorPanel.left = this.layoutBounds.minX + 10;
    vectorPanel.top = this.layoutBounds.minY + 10;
    this.addChild(vectorPanel);

    // Position graph beneath vector panel
    const VECTOR_PANEL_TO_GRAPH_SPACING = 10;
    this.configurableGraph.left = this.layoutBounds.minX + GRAPH_LEFT_MARGIN;
    this.configurableGraph.top = vectorPanel.bottom + VECTOR_PANEL_TO_GRAPH_SPACING;

    // Create tools control panel
    const toolsPanel = new ToolsControlPanel({
      showGridProperty: this.showGridProperty!,
      showDistanceToolProperty: this.showDistanceToolProperty,
      showStopwatchProperty: this.showStopwatchProperty,
      gridLabelProperty: visualizationLabels.showGridStringProperty,
      distanceToolLabelProperty: visualizationLabels.showDistanceToolStringProperty,
      stopwatchLabelProperty: visualizationLabels.showStopwatchStringProperty,
    });
    toolsPanel.left = this.layoutBounds.minX + 10;
    toolsPanel.bottom = this.layoutBounds.maxY - 10;
    this.addChild(toolsPanel);

    // Setup common controls (time controls, reset button, info button, keyboard shortcuts)
    this.setupCommonControls();

    // Initial visualization
    this.updateVisualization(this.model.positionProperty.value);
  }

  /**
   * Create the control panel with parameter sliders.
   */
  private createControlPanel(): Node {
    const stringManager = StringManager.getInstance();
    const controlLabels = stringManager.getControlLabels();
    const presetLabels = stringManager.getPresetLabels();

    // Create preset selector
    const presetItems: Array<{ value: PresetOption; createNode: () => Node; tandemName: string }> = [
      // Add "Custom" option first
      {
        value: "Custom",
        createNode: () => new Text(presetLabels.customStringProperty, {
          font: new PhetFont({size: 12}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        tandemName: "customPresetItem",
      },
      // Add all presets
      ...this.presets.map((preset, index) => ({
        value: preset,
        createNode: () => new Text(preset.nameProperty, {
          font: new PhetFont({size: 12}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        tandemName: `preset${index}Item`,
      })),
    ];

    const presetSelector = new ComboBox(this.presetProperty, presetItems, this, {
      cornerRadius: 5,
      xMargin: 8,
      yMargin: 4,
      buttonFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      buttonStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      listFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      listStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      highlightFill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
    });

    const presetLabel = new Text(presetLabels.labelStringProperty, {
      font: new PhetFont({size: 14}),
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const presetRow = new HBox({
      spacing: 10,
      children: [presetLabel, presetSelector],
    });

    const massControl = new NumberControl(
      controlLabels.massStringProperty,
      this.model.massProperty,
      new Range(0.1, 5.0),
      {
        delta: 0.1,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} kg",
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      },
    );

    const springControl = new NumberControl(
      controlLabels.springConstantStringProperty,
      this.model.springConstantProperty,
      new Range(1.0, 50.0),
      {
        delta: 1.0,
        numberDisplayOptions: {
          decimalPlaces: 0,
          valuePattern: "{0} N/m",
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      },
    );

    const dampingControl = new NumberControl(
      controlLabels.dampingStringProperty,
      this.model.dampingProperty,
      new Range(0.0, 20.0),
      {
        delta: 0.5,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} N·s/m",
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      },
    );

    const gravityControl = new NumberControl(
      controlLabels.gravityStringProperty,
      this.model.gravityProperty,
      new Range(0.0, 20.0),
      {
        delta: 0.1,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} m/s²",
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      },
    );

    const panel = new Panel(
      new VBox({
        spacing: 15,
        align: "left",
        children: [
          presetRow,
          massControl,
          springControl,
          dampingControl,
          gravityControl,
        ],
      }),
      {
        xMargin: 10,
        yMargin: 10,
        fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
        stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
        lineWidth: 1,
        cornerRadius: 5,
        // Position will be set after creation
      },
    );

    return panel;
  }

  /**
   * Switch between classic and parametric spring visualization.
   */
  private switchSpringVisualization(
    springType: SpringVisualizationType,
  ): void {
    // Remove current spring node
    this.removeChild(this.currentSpringNode);

    // Switch to new spring node
    this.currentSpringNode =
      springType === SpringVisualizationType.PARAMETRIC
        ? this.parametricSpringNode
        : this.classicSpringNode;

    // Add new spring node (insert before mass node to maintain z-order)
    const massIndex = this.indexOfChild(this.massNode);
    this.insertChild(massIndex, this.currentSpringNode);

    // Update the new spring node to match current state
    this.updateSpringAppearance(this.model.springConstantProperty.value);
    this.updateVisualization(this.model.positionProperty.value);
  }

  /**
   * Create the content for the info dialog.
   */
  protected createInfoDialogContent(): Node {
    return new VBox({
      spacing: 10,
      align: "left",
      children: [
        new Text("Single Spring System", {
          font: new PhetFont({size: 18, weight: "bold"}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        new RichText(
          "This simulation models a mass attached to a spring, demonstrating simple harmonic motion with optional damping.",
          {
            font: new PhetFont({size: 14}),
            fill: ClassicalMechanicsColors.textColorProperty,
            maxWidth: 400,
          }
        ),
        new Text("Equation of Motion:", {
          font: new PhetFont({size: 14, weight: "bold"}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        new RichText(
          "<i>m</i> d<sup>2</sup><i>x</i>/d<i>t</i><sup>2</sup> = -<i>kx</i> - <i>b</i> d<i>x</i>/d<i>t</i>",
          {
            font: new PhetFont({size: 14}),
            fill: ClassicalMechanicsColors.textColorProperty,
            maxWidth: 400,
          }
        ),
        new Text("Where:", {
          font: new PhetFont({size: 12}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        new RichText(
          "• <i>m</i> = mass (kg)<br>" +
          "• <i>k</i> = spring constant (N/m)<br>" +
          "• <i>b</i> = damping coefficient (N·s/m)<br>" +
          "• <i>x</i> = displacement from equilibrium (m)",
          {
            font: new PhetFont({size: 12}),
            fill: ClassicalMechanicsColors.textColorProperty,
            lineWrap: 400,
          }
        ),
      ],
    });
  }

  /**
   * Update the visual representation based on current position.
   */
  private updateVisualization(position: number): void {
    // Convert model position to view coordinates
    // Position is displacement from natural length (positive downward)
    // Total length from fixed point = natural length + displacement
    const naturalLength = this.model.naturalLengthProperty.value;
    const totalLength = naturalLength + position;
    const modelPosition = new Vector2(0, totalLength);
    const viewPosition =
      this.modelViewTransform.modelToViewPosition(modelPosition);

    // Update mass position
    this.massNode.center = viewPosition;

    // Update center of mass reference line (horizontal line across the mass)
    const massHalfWidth = this.massNode.width / 2;
    this.massReferenceLine.setLine(
      viewPosition.x - massHalfWidth,
      viewPosition.y,
      viewPosition.x + massHalfWidth,
      viewPosition.y
    );

    // Update spring endpoints (vertical spring from fixed point to top of mass)
    // Account for the mass height which varies with mass value
    const massHalfHeight = this.massNode.height / 2;
    this.currentSpringNode.setEndpoints(
      this.fixedPoint,
      new Vector2(viewPosition.x, viewPosition.y - massHalfHeight), // Connect to top edge of mass
    );
  }

  /**
   * Update spring appearance based on spring constant.
   * Stiffer springs (higher k) appear beefier (thicker lines, wider coils).
   */
  private updateSpringAppearance(springConstant: number): void {
    // Map spring constant [1, 50] to lineWidth [2, 7]
    const minK = 1, maxK = 50;
    const minLineWidth = 2, maxLineWidth = 7;
    const lineWidth = minLineWidth + (springConstant - minK) * (maxLineWidth - minLineWidth) / (maxK - minK);

    // Map spring constant [1, 50] to radius [8, 22]
    const minRadius = 8, maxRadius = 22;
    const radius = minRadius + (springConstant - minK) * (maxRadius - minRadius) / (maxK - minK);

    this.currentSpringNode.setLineWidth(lineWidth);
    this.currentSpringNode.setRadius(radius);
  }

  /**
   * Update mass block size based on mass value.
   * Larger masses appear as larger blocks.
   */
  private updateMassSize(mass: number): void {
    // Map mass [0.1, 5.0] kg to size [30, 70] pixels
    const minMass = 0.1, maxMass = 5.0;
    const minSize = 30, maxSize = 70;
    const size = minSize + (mass - minMass) * (maxSize - minSize) / (maxMass - minMass);

    // Update rectangle dimensions (keeping it centered)
    this.massNode.setRect(-size / 2, -size / 2, size, size);

    // Update visualization to reconnect spring to new mass size
    this.updateVisualization(this.model.positionProperty.value);
  }

  public override reset(): void {
    super.reset(); // Reset base view properties

    // Reset vector visibility properties
    this.showVelocityProperty.reset();
    this.showForceProperty.reset();
    this.showAccelerationProperty.reset();

    // Clear graph data
    this.configurableGraph.clearData();

    // Update visualization to match reset model state
    this.updateVisualization(this.model.positionProperty.value);
  }

  public override step(dt: number): void {
    super.step(dt); // Step the stopwatch and other base view components
    // Update model physics
    this.model.step(dt);

    // Add data point to configurable graph
    this.configurableGraph.addDataPoint();

    // Update vector visualizations
    this.updateVectors();
  }

  /**
   * Update vector positions and magnitudes based on current model state
   */
  private updateVectors(): void {
    // Get current model state
    const position = this.model.positionProperty.value;
    const velocity = this.model.velocityProperty.value;
    const mass = this.model.massProperty.value;
    const k = this.model.springConstantProperty.value;
    const b = this.model.dampingProperty.value;
    const g = this.model.gravityProperty.value;

    // Calculate forces (positive downward)
    const springForce = -k * position;
    const dampingForce = -b * velocity;
    const gravityForce = mass * g;
    const totalForce = springForce + dampingForce + gravityForce;

    // Calculate acceleration
    const acceleration = totalForce / mass;

    // Get mass center position in view coordinates
    const massCenter = this.massNode.center;

    // Update velocity vector (vertical, pointing in direction of motion)
    // Offset to the left of center to avoid overlap
    this.velocityVectorNode.setTailPosition(massCenter.plusXY(-15, 0));
    this.velocityVectorNode.setVector(new Vector2(0, velocity));

    // Update acceleration vector (vertical)
    // Offset to the right of center
    this.accelerationVectorNode.setTailPosition(massCenter.plusXY(10, 0));
    this.accelerationVectorNode.setVector(new Vector2(0, acceleration));

    // Update net force vector (vertical)
    // Offset further to the right to avoid overlap with acceleration
    this.forceVectorNode.setTailPosition(massCenter.plusXY(25, 0));
    this.forceVectorNode.setVector(new Vector2(0, totalForce));
  }

  /**
   * Apply a preset configuration to the model
   */
  private applyPreset(preset: Preset): void {
    this.isApplyingPreset = true;

    const config = preset.configuration;

    // Apply all configuration values to model properties
    if (config.mass !== undefined) {
      this.model.massProperty.value = config.mass;
    }
    if (config.springConstant !== undefined) {
      this.model.springConstantProperty.value = config.springConstant;
    }
    if (config.damping !== undefined) {
      this.model.dampingProperty.value = config.damping;
    }
    if (config.position !== undefined) {
      this.model.positionProperty.value = config.position;
    }

    // Reset velocity when applying preset
    this.model.velocityProperty.value = 0;

    // Reset simulation time only (don't reset the parameters we just set!)
    this.model.timeProperty.value = 0;

    // Clear the graph when switching presets (if it exists)
    if (this.configurableGraph) {
      this.configurableGraph.clearData();
    }

    // Announce preset change
    const a11yStrings = this.getA11yStrings();
    const template = a11yStrings.presetAppliedStringProperty.value;
    const announcement = template.replace('{{preset}}', preset.nameProperty.value);
    SimulationAnnouncer.announceParameterChange(announcement);

    this.isApplyingPreset = false;
  }
}
