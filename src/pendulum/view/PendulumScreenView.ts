/**
 * View for the Pendulum screen.
 * Displays a pendulum that can be dragged and swings.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { PendulumModel } from "../model/PendulumModel.js";
import { Circle, Line, VBox, HBox, Node, Text } from "scenerystack/scenery";
import { Panel, ComboBox, Checkbox } from "scenerystack/sun";
import { NumberControl } from "scenerystack/scenery-phet";
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
import { PendulumPresets } from "../model/PendulumPresets.js";
import { Preset } from "../../common/model/Preset.js";
import { Property, BooleanProperty } from "scenerystack/axon";
import { VectorNode } from "../../common/view/VectorNode.js";

// Custom preset type to include "Custom" option
type PresetOption = Preset | "Custom";

export class PendulumScreenView extends BaseScreenView<PendulumModel> {
  private readonly bobNode: Circle;
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
  private readonly showVectorsProperty: BooleanProperty;
  private readonly showVelocityProperty: BooleanProperty;
  private readonly showForceProperty: BooleanProperty;
  private readonly showAccelerationProperty: BooleanProperty;
  private readonly velocityVectorNode: VectorNode;
  private readonly forceVectorNode: VectorNode;
  private readonly accelerationVectorNode: VectorNode;

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

    // Bob
    this.bobNode = new Circle(20, {
      fill: ClassicalMechanicsColors.mass2FillColorProperty,
      stroke: ClassicalMechanicsColors.mass2StrokeColorProperty,
      lineWidth: 2,
      cursor: "pointer",
      // Add focus highlight for accessibility
      focusHighlight: "invisible",
    });
    this.addChild(this.bobNode);

    // Drag listener for bob with accessibility announcements
    this.bobNode.addInputListener(
      new DragListener({
        translateNode: false,
        start: () => {
          this.announceToScreenReader("Dragging pendulum bob");
        },
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const delta = parentPoint.minus(this.pivotPoint);
          const angle = Math.atan2(delta.x, delta.y); // angle from vertical
          this.model.angleProperty.value = angle;
          this.model.angularVelocityProperty.value = 0;
        },
        end: () => {
          const angleDegrees = (this.model.angleProperty.value * 180 / Math.PI).toFixed(1);
          this.announceToScreenReader(`Pendulum bob released at ${angleDegrees} degrees from vertical`);
        },
      }),
    );

    // Link model to view
    this.model.angleProperty.link(this.updateVisualization.bind(this));
    this.model.lengthProperty.link(this.updateVisualization.bind(this));

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
    Property.multilink(
      [this.showVectorsProperty, this.showVelocityProperty],
      (showVectors, showVelocity) => {
        this.velocityVectorNode.setVectorVisible(showVectors && showVelocity);
      }
    );

    Property.multilink(
      [this.showVectorsProperty, this.showForceProperty],
      (showVectors, showForce) => {
        this.forceVectorNode.setVectorVisible(showVectors && showForce);
      }
    );

    Property.multilink(
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
    this.model.lengthProperty.lazyLink(detectCustomChange);
    this.model.massProperty.lazyLink(detectCustomChange);
    this.model.gravityProperty.lazyLink(detectCustomChange);
    this.model.dampingProperty.lazyLink(detectCustomChange);

    // Add accessibility announcements for parameter changes
    this.model.lengthProperty.lazyLink((length) => {
      this.announceToScreenReader(`Length changed to ${length.toFixed(1)} meters`);
    });
    this.model.massProperty.lazyLink((mass) => {
      this.announceToScreenReader(`Mass changed to ${mass.toFixed(1)} kilograms`);
    });
    this.model.gravityProperty.lazyLink((gravity) => {
      this.announceToScreenReader(`Gravity changed to ${gravity.toFixed(1)} meters per second squared`);
    });
    this.model.dampingProperty.lazyLink((damping) => {
      this.announceToScreenReader(`Damping changed to ${damping.toFixed(2)}`);
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

    // Create the configurable graph (time vs angle by default)
    this.configurableGraph = new ConfigurableGraph(
      availableProperties,
      availableProperties[5], // Time for x-axis
      availableProperties[0], // Angle for y-axis
      450, // width
      300, // height
      2000, // max data points
      this, // list parent for combo boxes
    );
    // Position graph at the top left
    this.configurableGraph.left = this.layoutBounds.minX + 10;
    this.configurableGraph.top = this.layoutBounds.minY + 10;
    this.addChild(this.configurableGraph);

    // Setup common controls (time controls, reset button, keyboard shortcuts)
    this.setupCommonControls();

    // Initial visualization
    this.updateVisualization();
  }

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

    const panel = new Panel(
      new VBox({
        spacing: 15,
        align: "left",
        children: [
          presetRow,
          lengthControl,
          massControl,
          gravityControl,
          dampingControl,
          showVectorsCheckbox,
          velocityCheckbox,
          forceCheckbox,
          accelerationCheckbox,
        ],
      }),
      {
        xMargin: 10,
        yMargin: 10,
        fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
        stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
        lineWidth: 1,
        cornerRadius: 5,
        right: this.layoutBounds.maxX - 10,
        top: this.layoutBounds.minY + 10,
      },
    );

    return panel;
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

    // Update rod
    this.rodNode.setLine(
      this.pivotPoint.x,
      this.pivotPoint.y,
      viewBobPosition.x,
      viewBobPosition.y,
    );
  }

  public reset(): void {
    // Clear graph data
    this.configurableGraph.clearData();

    // Update visualization to match reset model state
    this.updateVisualization();
  }

  public override step(dt: number): void {
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
    this.announceToScreenReader(`Applied preset: ${preset.nameProperty.value}. Pendulum set to ${angleDegrees.toFixed(1)} degrees.`);

    this.isApplyingPreset = false;
  }
}
