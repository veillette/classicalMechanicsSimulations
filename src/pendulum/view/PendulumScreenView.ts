/**
 * View for the Pendulum screen.
 * Displays a pendulum that can be dragged and swings.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { PendulumModel } from "../model/PendulumModel.js";
import { Circle, Line, VBox, HBox, Node, Text, RichText } from "scenerystack/scenery";
import { Panel, ComboBox } from "scenerystack/sun";
import { NumberControl, PhetColorScheme, FormulaNode } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import {
  ConfigurableGraph,
  type PlottableProperty,
} from "../../common/view/graph/index.js";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";
import SimulationAnnouncer from "../../common/util/SimulationAnnouncer.js";
import { PendulumPresets } from "../model/PendulumPresets.js";
import { Preset } from "../../common/model/Preset.js";
import { Property, BooleanProperty } from "scenerystack/axon";
import { VectorNode } from "../../common/view/VectorNode.js";
import { PendulumLabProtractorNode } from "../../common/view/PendulumLabProtractorNode.js";
import { VectorControlPanel } from "../../common/view/VectorControlPanel.js";
import { ToolsControlPanel } from "../../common/view/ToolsControlPanel.js";
import { PhetFont } from "scenerystack";

// Custom preset type to include "Custom" option
type PresetOption = Preset | "Custom";

export class PendulumScreenView extends BaseScreenView<PendulumModel> {
  private readonly bobNode: Circle;
  private readonly bobReferenceDot: Circle; // Small dot showing center of mass position
  private readonly rodNode: Line;
  private readonly pivotNode: Circle;
  private readonly pivotPoint: Vector2;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly presetProperty: Property<PresetOption>;
  private readonly presets: Preset[];
  private isApplyingPreset: boolean = false;

  // Graph component
  private readonly configurableGraph: ConfigurableGraph;

  // Vector visualization
  private readonly showVelocityProperty: BooleanProperty;
  private readonly showForceProperty: BooleanProperty;
  private readonly showAccelerationProperty: BooleanProperty;
  private readonly velocityVectorNode: VectorNode;
  private readonly forceVectorNode: VectorNode;
  private readonly accelerationVectorNode: VectorNode;

  // Dragging state for protractor
  private readonly isDraggingProperty: BooleanProperty;

  public constructor(model: PendulumModel, options?: ScreenViewOptions) {
    super(model, options);

    // Get available presets
    this.presets = PendulumPresets.getPresets();

    // Initialize with first preset as default
    this.presetProperty = new Property<PresetOption>(this.presets[0]);

    // Pivot point (top center of screen)
    this.pivotPoint = new Vector2(
      this.layoutBounds.centerX,
      this.layoutBounds.minY + 100,
    );

    // Create modelViewTransform: maps model coordinates (meters) to view coordinates (pixels)
    // Maps model origin (0, 0) to the pivot point, with 100 pixels per meter
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      this.pivotPoint,
      100, // pixels per meter
    );

    // Setup grid visualization (add early so it's behind other elements)
    this.setupGrid(0.5, this.modelViewTransform); // 0.5 meter spacing

    // Initialize dragging state
    this.isDraggingProperty = new BooleanProperty(false);

    // Setup measurement tools (distance tool, stopwatch)
    // We'll set up the protractor separately with the PendulumLabProtractorNode
    this.setupMeasurementTools(this.modelViewTransform, this.pivotPoint);

    // Replace the generic protractor with the PendulumLabProtractorNode
    if (this.protractorNode) {
      this.removeChild(this.protractorNode);
    }

    // Create the PendulumLabProtractorNode
    const pendulumLabProtractor = new PendulumLabProtractorNode(
      {
        angleProperty: this.model.angleProperty,
        isDraggingProperty: this.isDraggingProperty,
        color: ClassicalMechanicsColors.mass2FillColorProperty.value.toCSS(),
        lengthProperty: this.model.lengthProperty,
      },
      this.modelViewTransform
    );
    this.protractorNode = pendulumLabProtractor;
    this.addChild(pendulumLabProtractor);

    // Link visibility
    this.showProtractorProperty.link((visible: boolean) => {
      pendulumLabProtractor.visible = visible;
    });

    // Pivot
    this.pivotNode = new Circle(8, {
      fill: ClassicalMechanicsColors.pivotFillColorProperty,
      stroke: ClassicalMechanicsColors.pivotStrokeColorProperty,
      lineWidth: 2,
    });
    this.pivotNode.center = this.pivotPoint;
    this.addChild(this.pivotNode);

    // Rod
    this.rodNode = new Line(0, 0, 0, 0, {
      stroke: ClassicalMechanicsColors.rodStrokeColorProperty,
      lineWidth: 4,
      lineCap: "round",
    });
    this.addChild(this.rodNode);

    // Bob (size will be updated based on mass value)
    this.bobNode = new Circle(20, {
      fill: ClassicalMechanicsColors.mass2FillColorProperty,
      stroke: ClassicalMechanicsColors.mass2StrokeColorProperty,
      lineWidth: 2,
      cursor: "pointer",
      // Add focus highlight for accessibility
      focusHighlight: "invisible",
    });
    this.addChild(this.bobNode);

    // Center of mass reference dot (small circle at center of bob)
    this.bobReferenceDot = new Circle(3, {
      fill: ClassicalMechanicsColors.textColorProperty,
      stroke: "white",
      lineWidth: 1,
    });
    this.addChild(this.bobReferenceDot);

    // Link mass to visual size
    this.model.massProperty.link((mass) => {
      this.updateBobSize(mass);
    });

    // Drag listener for bob with accessibility announcements
    this.bobNode.addInputListener(
      new DragListener({
        translateNode: false,
        start: () => {
          this.isDraggingProperty.value = true;
          SimulationAnnouncer.announceDragInteraction("Dragging pendulum bob");
        },
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const delta = parentPoint.minus(this.pivotPoint);
          const angle = Math.atan2(delta.x, delta.y); // angle from vertical
          this.model.angleProperty.value = angle;
          this.model.angularVelocityProperty.value = 0;
        },
        end: () => {
          this.isDraggingProperty.value = false;
          const angleDegrees = (this.model.angleProperty.value * 180 / Math.PI).toFixed(1);
          SimulationAnnouncer.announceDragInteraction(`Pendulum bob released at ${angleDegrees} degrees from vertical`);
        },
      }),
    );

    // Link model to view
    this.model.angleProperty.link(this.updateVisualization.bind(this));
    this.model.lengthProperty.link(this.updateVisualization.bind(this));

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
    this.model.lengthProperty.lazyLink(detectCustomChange);
    this.model.massProperty.lazyLink(detectCustomChange);
    this.model.gravityProperty.lazyLink(detectCustomChange);
    this.model.dampingProperty.lazyLink(detectCustomChange);

    // Add accessibility announcements for parameter changes
    this.model.lengthProperty.lazyLink((length) => {
      SimulationAnnouncer.announceParameterChange(`Length changed to ${length.toFixed(1)} meters`);
    });
    this.model.massProperty.lazyLink((mass) => {
      SimulationAnnouncer.announceParameterChange(`Mass changed to ${mass.toFixed(1)} kilograms`);
    });
    this.model.gravityProperty.lazyLink((gravity) => {
      SimulationAnnouncer.announceParameterChange(`Gravity changed to ${gravity.toFixed(1)} meters per second squared`);
    });
    this.model.dampingProperty.lazyLink((damping) => {
      SimulationAnnouncer.announceParameterChange(`Damping changed to ${damping.toFixed(2)}`);
    });

    // Apply the first preset immediately
    this.applyPreset(this.presets[0]);

    // Create configurable graph with available properties
    const stringManager = StringManager.getInstance();
    const propertyNames = stringManager.getGraphPropertyNames();
    const availableProperties: PlottableProperty[] = [
      {
        name: propertyNames.angleStringProperty,
        property: this.model.angleProperty,
        unit: "rad",
      },
      {
        name: propertyNames.angularVelocityStringProperty,
        property: this.model.angularVelocityProperty,
        unit: "rad/s",
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

    // Calculate graph width to not extend beyond the pendulum (at centerX)
    const GRAPH_LEFT_MARGIN = 10;
    const GRAPH_RIGHT_MARGIN = 20;
    const graphWidth = this.layoutBounds.centerX - this.layoutBounds.minX - GRAPH_LEFT_MARGIN - GRAPH_RIGHT_MARGIN;
    const graphHeight = 300;

    // Create the configurable graph (time vs angle by default)
    this.configurableGraph = new ConfigurableGraph(
      availableProperties,
      availableProperties[5], // Time for x-axis
      availableProperties[0], // Angle for y-axis
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
      showProtractorProperty: this.showProtractorProperty,
      gridLabelProperty: visualizationLabels.showGridStringProperty,
      distanceToolLabelProperty: visualizationLabels.showDistanceToolStringProperty,
      stopwatchLabelProperty: visualizationLabels.showStopwatchStringProperty,
      protractorLabelProperty: visualizationLabels.showProtractorStringProperty,
    });
    toolsPanel.left = this.layoutBounds.minX + 10;
    toolsPanel.bottom = this.layoutBounds.maxY - 10;
    this.addChild(toolsPanel);

    // Setup common controls (time controls, reset button, info button, keyboard shortcuts)
    this.setupCommonControls();

    // Initial visualization
    this.updateVisualization();
  }

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

    const lengthControl = new NumberControl(
      controlLabels.lengthStringProperty,
      this.model.lengthProperty,
      new Range(0.5, 3.0),
      {
        delta: 0.1,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} m",
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      },
    );

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

    const gravityControl = new NumberControl(
      controlLabels.gravityStringProperty,
      this.model.gravityProperty,
      new Range(0.0, 20.0),
      {
        delta: 0.5,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} m/s²",
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      },
    );

    const dampingControl = new NumberControl(
      controlLabels.dampingStringProperty,
      this.model.dampingProperty,
      new Range(0.0, 2.0),
      {
        delta: 0.05,
        numberDisplayOptions: {
          decimalPlaces: 2,
          valuePattern: "{0} N·m·s",
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
          lengthControl,
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
   * Create the content for the info dialog.
   */
  protected createInfoDialogContent(): Node {
    // Create formula nodes
    const equation = new FormulaNode("I \\frac{d^2 \\theta}{d t^2} = -mgl \\sin(\\theta) - b \\frac{d\\theta}{dt}", {
      maxWidth: 700,
    });
    const variablesList = new FormulaNode(
      "\\begin{array}{l}" +
      "\\bullet\\; I = ml^2 = \\text{moment of inertia (kg}\\cdot\\text{m}^2\\text{)}\\\\" +
      "\\bullet\\; m = \\text{mass (kg)}\\\\" +
      "\\bullet\\; l = \\text{length (m)}\\\\" +
      "\\bullet\\; g = \\text{gravitational acceleration (m/s}^2\\text{)}\\\\" +
      "\\bullet\\; b = \\text{damping coefficient (N}\\cdot\\text{m}\\cdot\\text{s)}\\\\" +
      "\\bullet\\; \\theta = \\text{angle from vertical (rad)}" +
      "\\end{array}",
      {
        maxWidth: 700,
      }
    );

    // Link text color property to formula nodes
    // FormulaNode extends DOM, so we need to set the color via CSS
    ClassicalMechanicsColors.textColorProperty.link((color) => {
      equation.element.style.color = color.toCSS();
      variablesList.element.style.color = color.toCSS();
    });

    return new VBox({
      spacing: 20,
      align: "left",
      children: [
        new Text("Simple Pendulum", {
          font: new PhetFont({size: 18, weight: "bold"}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        new RichText(
          "This simulation models a simple pendulum, demonstrating periodic motion and energy conservation. At small angles, the motion approximates simple harmonic motion.",
          {
            font: new PhetFont({size: 14}),
            fill: ClassicalMechanicsColors.textColorProperty,
            maxWidth: 700,
          }
        ),
        new Text("Equation of Motion:", {
          font: new PhetFont({size: 14, weight: "bold"}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        equation,
        new Text("Where:", {
          font: new PhetFont({size: 12}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        variablesList,
      ],
    });
  }

  private updateVisualization(): void {
    const angle = this.model.angleProperty.value;
    const length = this.model.lengthProperty.value;

    // Calculate bob position in model coordinates (angle is from vertical)
    const modelBobX = length * Math.sin(angle);
    const modelBobY = length * Math.cos(angle);
    const modelBobPosition = new Vector2(modelBobX, modelBobY);

    // Convert to view coordinates
    const viewBobPosition =
      this.modelViewTransform.modelToViewPosition(modelBobPosition);

    // Update bob position
    this.bobNode.center = viewBobPosition;

    // Update center of mass reference dot (position at center of bob)
    this.bobReferenceDot.center = viewBobPosition;

    // Update rod
    this.rodNode.setLine(
      this.pivotPoint.x,
      this.pivotPoint.y,
      viewBobPosition.x,
      viewBobPosition.y,
    );
  }

  /**
   * Update bob size based on mass value.
   * Larger masses appear as larger bobs.
   */
  private updateBobSize(mass: number): void {
    // Map mass [0.1, 5.0] kg to radius [12, 35] pixels
    const minMass = 0.1, maxMass = 5.0;
    const minRadius = 12, maxRadius = 35;
    const radius = minRadius + (mass - minMass) * (maxRadius - minRadius) / (maxMass - minMass);

    // Update circle radius
    this.bobNode.radius = radius;

    // Update visualization to ensure bob is positioned correctly
    this.updateVisualization();
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
    this.updateVisualization();
  }

  public override step(dt: number): void {
    super.step(dt); // Step the stopwatch and other base view components
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
    const angle = this.model.angleProperty.value;
    const omega = this.model.angularVelocityProperty.value;
    const L = this.model.lengthProperty.value;
    const m = this.model.massProperty.value;
    const g = this.model.gravityProperty.value;
    const b = this.model.dampingProperty.value;

    // Calculate bob position
    const modelBobX = L * Math.sin(angle);
    const modelBobY = L * Math.cos(angle);
    const modelBobPosition = new Vector2(modelBobX, modelBobY);
    const viewBobPosition = this.modelViewTransform.modelToViewPosition(modelBobPosition);

    // Calculate tangential direction (perpendicular to rod)
    const tangentX = Math.cos(angle);  // perpendicular to rod direction
    const tangentY = Math.sin(angle);

    // Tangential velocity: v = L * ω (in tangential direction)
    const vMagnitude = L * Math.abs(omega);
    const velocitySign = omega >= 0 ? 1 : -1;
    const velocityVector = new Vector2(
      tangentX * vMagnitude * velocitySign,
      tangentY * vMagnitude * velocitySign
    );

    // Angular acceleration: α = -(g/L)*sin(θ) - (b/mL²)*ω
    const I = m * L * L;
    const alpha = -(g / L) * Math.sin(angle) - (b / I) * omega;

    // Tangential acceleration: a = L * α
    const aMagnitude = L * Math.abs(alpha);
    const accelSign = alpha >= 0 ? 1 : -1;
    const accelerationVector = new Vector2(
      tangentX * aMagnitude * accelSign,
      tangentY * aMagnitude * accelSign
    );

    // Net tangential force: F = m * a
    const forceVector = accelerationVector.times(m);

    // Update vectors
    this.velocityVectorNode.setTailPosition(viewBobPosition);
    this.velocityVectorNode.setVector(velocityVector);

    this.forceVectorNode.setTailPosition(viewBobPosition);
    this.forceVectorNode.setVector(forceVector);

    this.accelerationVectorNode.setTailPosition(viewBobPosition);
    this.accelerationVectorNode.setVector(accelerationVector);
  }

  /**
   * Apply a preset configuration to the model
   */
  private applyPreset(preset: Preset): void {
    this.isApplyingPreset = true;

    const config = preset.configuration;

    // Apply all configuration values to model properties
    if (config.length !== undefined) {
      this.model.lengthProperty.value = config.length;
    }
    if (config.mass !== undefined) {
      this.model.massProperty.value = config.mass;
    }
    if (config.gravity !== undefined) {
      this.model.gravityProperty.value = config.gravity;
    }
    if (config.damping !== undefined) {
      this.model.dampingProperty.value = config.damping;
    }
    if (config.angle !== undefined) {
      this.model.angleProperty.value = config.angle;
    }

    // Reset angular velocity when applying preset
    this.model.angularVelocityProperty.value = 0;

    // Reset simulation time only (don't reset the parameters we just set!)
    this.model.timeProperty.value = 0;

    // Clear graph when switching presets (if it exists)
    if (this.configurableGraph) {
      this.configurableGraph.clearData();
    }

    // Announce preset change
    const angleDegrees = (config.angle || 0) * 180 / Math.PI;
    SimulationAnnouncer.announceParameterChange(`Applied preset: ${preset.nameProperty.value}. Pendulum set to ${angleDegrees.toFixed(1)} degrees.`);

    this.isApplyingPreset = false;
  }
}
