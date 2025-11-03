/**
 * View for the Single Spring screen.
 * Displays a mass attached to a spring that can be dragged and oscillates.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { SingleSpringModel } from "../model/SingleSpringModel.js";
import { Rectangle, Line, VBox, HBox, Node, Text } from "scenerystack/scenery";
import { Panel, ComboBox, Checkbox } from "scenerystack/sun";
import { NumberControl } from "scenerystack/scenery-phet";
import { Range } from "scenerystack/dot";
import { SpringNode } from "../../common/view/SpringNode.js";
import { VectorNode } from "../../common/view/VectorNode.js";
import { Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { GridIcon } from "scenerystack/scenery-phet";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";
import SimulationAnnouncer from "../../common/util/SimulationAnnouncer.js";
import {
  ConfigurableGraph,
  type PlottableProperty,
} from "../../common/view/graph/index.js";
import { SingleSpringPresets } from "../model/SingleSpringPresets.js";
import { Preset } from "../../common/model/Preset.js";
import { Property, BooleanProperty, Multilink } from "scenerystack/axon";

// Custom preset type to include "Custom" option
type PresetOption = Preset | "Custom";

export class SingleSpringScreenView extends BaseScreenView<SingleSpringModel> {
  private readonly massNode: Rectangle;
  private readonly springNode: SpringNode;
  private readonly fixedPoint: Vector2;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly configurableGraph: ConfigurableGraph;
  private readonly presetProperty: Property<PresetOption>;
  private readonly presets: Preset[];
  private isApplyingPreset: boolean = false;

  // Vector visualization
  private readonly showVectorsProperty: BooleanProperty;
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

    // Setup measurement tools (distance tool, protractor, stopwatch)
    this.setupMeasurementTools(this.modelViewTransform);

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

    // Spring (appearance will be updated based on spring constant)
    this.springNode = new SpringNode({
      loops: 12,
      radius: 15,
      lineWidth: 3,
    });
    this.addChild(this.springNode);

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

    // Initialize vector visibility properties
    this.showVectorsProperty = new BooleanProperty(false);
    this.showVelocityProperty = new BooleanProperty(true);
    this.showForceProperty = new BooleanProperty(true);
    this.showAccelerationProperty = new BooleanProperty(false);

    // Create vector nodes
    this.velocityVectorNode = new VectorNode({
      color: "blue",
      scale: 50, // 50 pixels per m/s
      label: "v",
      minMagnitude: 0.05,
    });
    this.addChild(this.velocityVectorNode);

    this.forceVectorNode = new VectorNode({
      color: "red",
      scale: 10, // 10 pixels per Newton
      label: "F",
      minMagnitude: 0.1,
    });
    this.addChild(this.forceVectorNode);

    this.accelerationVectorNode = new VectorNode({
      color: "green",
      scale: 20, // 20 pixels per m/s²
      label: "a",
      minMagnitude: 0.1,
    });
    this.addChild(this.accelerationVectorNode);

    // Link visibility properties to vector nodes
    Multilink.multilink(
      [this.showVectorsProperty, this.showVelocityProperty],
      (showVectors, showVelocity) => {
        this.velocityVectorNode.setVectorVisible(showVectors && showVelocity);
      }
    );

    Multilink.multilink(
      [this.showVectorsProperty, this.showForceProperty],
      (showVectors, showForce) => {
        this.forceVectorNode.setVectorVisible(showVectors && showForce);
      }
    );

    Multilink.multilink(
      [this.showVectorsProperty, this.showAccelerationProperty],
      (showVectors, showAcceleration) => {
        this.accelerationVectorNode.setVectorVisible(showVectors && showAcceleration);
      }
    );

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

    // Create the configurable graph (position vs time by default)
    this.configurableGraph = new ConfigurableGraph(
      availableProperties,
      availableProperties[5], // Time for x-axis
      availableProperties[0], // Position for y-axis
      400, // width
      300, // height
      2000, // max data points
      this, // list parent for combo boxes
    );
    // Position graph at the top left
    // Position graph at lower left, not overlapping time controls
    this.configurableGraph.left = this.layoutBounds.minX + 10;
    this.configurableGraph.bottom = this.layoutBounds.maxY - 70; // Leave room for time controls
    this.addChild(this.configurableGraph);

    // Position control panel at the top right
    controlPanel.right = this.layoutBounds.maxX - 10;
    controlPanel.top = this.layoutBounds.minY + 10;

    // Setup common controls (time controls, reset button, keyboard shortcuts)
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
    const visualizationLabels = stringManager.getVisualizationLabels();

    // Create preset selector
    const presetItems: Array<{ value: PresetOption; createNode: () => Node; tandemName: string }> = [
      // Add "Custom" option first
      {
        value: "Custom",
        createNode: () => new Text(presetLabels.customStringProperty, {
          fontSize: 12,
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        tandemName: "customPresetItem",
      },
      // Add all presets
      ...this.presets.map((preset, index) => ({
        value: preset,
        createNode: () => new Text(preset.nameProperty, {
          fontSize: 12,
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
      fontSize: 14,
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

    // Vector visualization controls
    const showVectorsCheckbox = new Checkbox(
      this.showVectorsProperty,
      new Text(visualizationLabels.showVectorsStringProperty, {
        fontSize: 14,
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      {
        boxWidth: 16,
      }
    );

    const velocityCheckbox = new Checkbox(
      this.showVelocityProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text("  ", { fontSize: 12 }), // Indent
          new Text(visualizationLabels.velocityStringProperty, {
            fontSize: 12,
            fill: "blue",
          }),
        ],
      }),
      {
        boxWidth: 14,
      }
    );

    const forceCheckbox = new Checkbox(
      this.showForceProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text("  ", { fontSize: 12 }), // Indent
          new Text(visualizationLabels.forceStringProperty, {
            fontSize: 12,
            fill: "red",
          }),
        ],
      }),
      {
        boxWidth: 14,
      }
    );

    const accelerationCheckbox = new Checkbox(
      this.showAccelerationProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text("  ", { fontSize: 12 }), // Indent
          new Text(visualizationLabels.accelerationStringProperty, {
            fontSize: 12,
            fill: "green",
          }),
        ],
      }),
      {
        boxWidth: 14,
      }
    );

    // Grid checkbox with icon
    const gridIcon = new GridIcon({
      size: 16,
    });
    const showGridCheckbox = new Checkbox(
      this.showGridProperty!,
      new HBox({
        spacing: 5,
        children: [
          gridIcon,
          new Text(visualizationLabels.showGridStringProperty, {
            fontSize: 14,
            fill: ClassicalMechanicsColors.textColorProperty,
          }),
        ],
      }),
      {
        boxWidth: 16,
      }
    );

    // Measurement tool checkboxes
    const showDistanceToolCheckbox = new Checkbox(
      this.showDistanceToolProperty,
      new Text(visualizationLabels.showDistanceToolStringProperty, {
        fontSize: 14,
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      {
        boxWidth: 16,
      }
    );

    const showProtractorCheckbox = new Checkbox(
      this.showProtractorProperty,
      new Text(visualizationLabels.showProtractorStringProperty, {
        fontSize: 14,
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      {
        boxWidth: 16,
      }
    );

    const showStopwatchCheckbox = new Checkbox(
      this.showStopwatchProperty,
      new Text(visualizationLabels.showStopwatchStringProperty, {
        fontSize: 14,
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      {
        boxWidth: 16,
      }
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
          showVectorsCheckbox,
          velocityCheckbox,
          forceCheckbox,
          accelerationCheckbox,
          showGridCheckbox,
          showDistanceToolCheckbox,
          showProtractorCheckbox,
          showStopwatchCheckbox,
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

    // Update spring endpoints (vertical spring from fixed point to top of mass)
    // Account for the mass height which varies with mass value
    const massHalfHeight = this.massNode.height / 2;
    this.springNode.setEndpoints(
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

    this.springNode.setLineWidth(lineWidth);
    this.springNode.setRadius(radius);
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

  public reset(): void {
    // Clear graph data
    this.configurableGraph.clearData();

    // Update visualization to match reset model state
    this.updateVisualization(this.model.positionProperty.value);
  }

  public override step(dt: number): void {
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
    this.velocityVectorNode.setTailPosition(massCenter);
    this.velocityVectorNode.setVector(new Vector2(0, velocity));

    // Update force vector (vertical)
    this.forceVectorNode.setTailPosition(massCenter);
    this.forceVectorNode.setVector(new Vector2(0, totalForce));

    // Update acceleration vector (vertical)
    this.accelerationVectorNode.setTailPosition(massCenter);
    this.accelerationVectorNode.setVector(new Vector2(0, acceleration));
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
