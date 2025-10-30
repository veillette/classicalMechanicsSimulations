/**
 * View for the Double Pendulum screen.
 * Displays two connected pendulums that exhibit chaotic motion.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { DoublePendulumModel } from "../model/DoublePendulumModel.js";
import {
  Circle,
  Line,
  VBox,
  HBox,
  Node,
  Text,
  Path,
  KeyboardListener,
} from "scenerystack/scenery";
import { Panel, ComboBox } from "scenerystack/sun";
import { NumberControl } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { BooleanProperty, Property } from "scenerystack/axon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import {
  ConfigurableGraph,
  type PlottableProperty,
} from "../../common/view/graph/index.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";
import { DoublePendulumPresets } from "../model/DoublePendulumPresets.js";
import { Preset } from "../../common/model/Preset.js";

// Custom preset type to include "Custom" option
type PresetOption = Preset | "Custom";

export class DoublePendulumScreenView extends BaseScreenView<DoublePendulumModel> {
  private readonly bob1Node: Circle;
  private readonly bob2Node: Circle;
  private readonly rod1Node: Line;
  private readonly rod2Node: Line;
  private readonly pivotNode: Circle;
  private readonly trailPath: Path;
  private readonly pivotPoint: Vector2;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly trailPoints: Vector2[] = [];
  private readonly maxTrailPoints: number = 500;
  private readonly trailVisibleProperty: BooleanProperty;
  private readonly presetProperty: Property<PresetOption>;
  private readonly presets: Preset[];
  private isApplyingPreset: boolean = false;

  // Graph component
  private readonly configurableGraph: ConfigurableGraph;

  public constructor(model: DoublePendulumModel, options?: ScreenViewOptions) {
    super(model, options);

    // Get available presets
    this.presets = DoublePendulumPresets.getPresets();

    // Initialize with first preset as default
    this.presetProperty = new Property<PresetOption>(this.presets[0]);

    // Pivot point (top center)
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

    // Trail for chaotic motion visualization
    this.trailPath = new Path(null, {
      stroke: ClassicalMechanicsColors.mass2FillColorProperty,
      lineWidth: 2,
      opacity: 0.3,
    });
    this.addChild(this.trailPath);

    // Trail visibility property
    this.trailVisibleProperty = new BooleanProperty(true);
    this.trailVisibleProperty.link((visible) => {
      this.trailPath.visible = visible;
    });

    // Pivot
    this.pivotNode = new Circle(8, {
      fill: ClassicalMechanicsColors.pivotFillColorProperty,
      stroke: ClassicalMechanicsColors.pivotStrokeColorProperty,
      lineWidth: 2,
    });
    this.pivotNode.center = this.pivotPoint;
    this.addChild(this.pivotNode);

    // Rod 1
    this.rod1Node = new Line(0, 0, 0, 0, {
      stroke: ClassicalMechanicsColors.mass1FillColorProperty,
      lineWidth: 4,
      lineCap: "round",
    });
    this.addChild(this.rod1Node);

    // Rod 2
    this.rod2Node = new Line(0, 0, 0, 0, {
      stroke: ClassicalMechanicsColors.mass2FillColorProperty,
      lineWidth: 4,
      lineCap: "round",
    });
    this.addChild(this.rod2Node);

    // Bob 1
    this.bob1Node = new Circle(15, {
      fill: ClassicalMechanicsColors.mass1FillColorProperty,
      stroke: ClassicalMechanicsColors.mass1StrokeColorProperty,
      lineWidth: 2,
      cursor: "pointer",
      // Add focus highlight for accessibility
      focusHighlight: "invisible",
    });
    this.addChild(this.bob1Node);

    // Bob 2
    this.bob2Node = new Circle(15, {
      fill: ClassicalMechanicsColors.mass2FillColorProperty,
      stroke: ClassicalMechanicsColors.mass2StrokeColorProperty,
      lineWidth: 2,
      cursor: "pointer",
      // Add focus highlight for accessibility
      focusHighlight: "invisible",
    });
    this.addChild(this.bob2Node);

    // Drag listener for bob 1 with accessibility announcements
    const a11yStrings = this.getA11yStrings();
    this.bob1Node.addInputListener(
      new DragListener({
        translateNode: false,
        start: () => {
          this.announceToScreenReader(a11yStrings.draggingUpperBobStringProperty.value);
        },
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const delta = parentPoint.minus(this.pivotPoint);
          const angle = Math.atan2(delta.x, delta.y);
          this.model.angle1Property.value = angle;
          this.model.angularVelocity1Property.value = 0;
          this.clearTrail();
        },
        end: () => {
          const angleDegrees = (this.model.angle1Property.value * 180 / Math.PI).toFixed(1);
          const template = a11yStrings.upperBobReleasedAtStringProperty.value;
          const announcement = template.replace('{{angle}}', angleDegrees);
          this.announceToScreenReader(announcement);
        },
      }),
    );

    // Drag listener for bob 2 with accessibility announcements
    this.bob2Node.addInputListener(
      new DragListener({
        translateNode: false,
        start: () => {
          this.announceToScreenReader(a11yStrings.draggingLowerBobStringProperty.value);
        },
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          // Calculate position of bob 1 first
          const angle1 = this.model.angle1Property.value;
          const length1 = this.model.length1Property.value;
          const bob1ModelX = length1 * Math.sin(angle1);
          const bob1ModelY = length1 * Math.cos(angle1);
          const bob1ModelPos = new Vector2(bob1ModelX, bob1ModelY);
          const bob1ViewPos =
            this.modelViewTransform.modelToViewPosition(bob1ModelPos);

          // Calculate angle for bob 2 relative to bob 1
          const delta = parentPoint.minus(bob1ViewPos);
          const angle = Math.atan2(delta.x, delta.y);
          this.model.angle2Property.value = angle;
          this.model.angularVelocity2Property.value = 0;
          this.clearTrail();
        },
        end: () => {
          const angleDegrees = (this.model.angle2Property.value * 180 / Math.PI).toFixed(1);
          const template = a11yStrings.lowerBobReleasedAtStringProperty.value;
          const announcement = template.replace('{{angle}}', angleDegrees);
          this.announceToScreenReader(announcement);
        },
      }),
    );

    // Link model to view
    // Note: We update visualization in step() to avoid inconsistent intermediate states
    // Only listen to length changes to clear trail and update immediately
    this.model.length1Property.link(() => {
      this.updateVisualization();
      this.clearTrail();
    });
    this.model.length2Property.link(() => {
      this.updateVisualization();
      this.clearTrail();
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
    this.model.length1Property.lazyLink(detectCustomChange);
    this.model.length2Property.lazyLink(detectCustomChange);
    this.model.mass1Property.lazyLink(detectCustomChange);
    this.model.mass2Property.lazyLink(detectCustomChange);
    this.model.gravityProperty.lazyLink(detectCustomChange);
    this.model.dampingProperty.lazyLink(detectCustomChange);

    // Add accessibility announcements for parameter changes
    this.model.length1Property.lazyLink((length) => {
      this.announceToScreenReader(`Upper pendulum length changed to ${length.toFixed(1)} meters`);
    });
    this.model.length2Property.lazyLink((length) => {
      this.announceToScreenReader(`Lower pendulum length changed to ${length.toFixed(1)} meters`);
    });
    this.model.mass1Property.lazyLink((mass) => {
      this.announceToScreenReader(`Upper bob mass changed to ${mass.toFixed(1)} kilograms`);
    });
    this.model.mass2Property.lazyLink((mass) => {
      this.announceToScreenReader(`Lower bob mass changed to ${mass.toFixed(1)} kilograms`);
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
        name: propertyNames.angle1StringProperty,
        property: this.model.angle1Property,
        unit: "rad",
      },
      {
        name: propertyNames.angle2StringProperty,
        property: this.model.angle2Property,
        unit: "rad",
      },
      {
        name: propertyNames.angularVelocity1StringProperty,
        property: this.model.angularVelocity1Property,
        unit: "rad/s",
      },
      {
        name: propertyNames.angularVelocity2StringProperty,
        property: this.model.angularVelocity2Property,
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

    // Create the configurable graph (time vs angle1 by default)
    this.configurableGraph = new ConfigurableGraph(
      availableProperties,
      availableProperties[7], // Time for x-axis
      availableProperties[0], // Angle1 for y-axis
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

    // Add additional keyboard shortcut for trail toggle
    const trailKeyboardListener = new KeyboardListener({
      keys: ["t"],
      fire: (event, keysPressed) => {
        if (keysPressed === "t") {
          // Toggle trail visibility with T key
          this.trailVisibleProperty.value = !this.trailVisibleProperty.value;
        }
      },
    });
    this.addInputListener(trailKeyboardListener);

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

    const length1Control = new NumberControl(
      controlLabels.length1StringProperty,
      this.model.length1Property,
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

    const length2Control = new NumberControl(
      controlLabels.length2StringProperty,
      this.model.length2Property,
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

    const mass1Control = new NumberControl(
      controlLabels.mass1StringProperty,
      this.model.mass1Property,
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

    const mass2Control = new NumberControl(
      controlLabels.mass2StringProperty,
      this.model.mass2Property,
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
        spacing: 12,
        align: "left",
        children: [
          presetRow,
          length1Control,
          length2Control,
          mass1Control,
          mass2Control,
          gravityControl,
          dampingControl,
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
    const angle1 = this.model.angle1Property.value;
    const angle2 = this.model.angle2Property.value;
    const length1 = this.model.length1Property.value;
    const length2 = this.model.length2Property.value;

    // Calculate bob 1 position in model coordinates
    const bob1ModelX = length1 * Math.sin(angle1);
    const bob1ModelY = length1 * Math.cos(angle1);
    const bob1ModelPos = new Vector2(bob1ModelX, bob1ModelY);

    // Convert bob 1 to view coordinates
    const bob1ViewPos =
      this.modelViewTransform.modelToViewPosition(bob1ModelPos);

    // Calculate bob 2 position in model coordinates (relative to bob 1)
    const bob2ModelX = bob1ModelX + length2 * Math.sin(angle2);
    const bob2ModelY = bob1ModelY + length2 * Math.cos(angle2);
    const bob2ModelPos = new Vector2(bob2ModelX, bob2ModelY);

    // Convert bob 2 to view coordinates
    const bob2ViewPos =
      this.modelViewTransform.modelToViewPosition(bob2ModelPos);

    // Update bob positions
    this.bob1Node.center = bob1ViewPos;
    this.bob2Node.center = bob2ViewPos;

    // Update rods
    this.rod1Node.setLine(
      this.pivotPoint.x,
      this.pivotPoint.y,
      bob1ViewPos.x,
      bob1ViewPos.y,
    );

    this.rod2Node.setLine(
      bob1ViewPos.x,
      bob1ViewPos.y,
      bob2ViewPos.x,
      bob2ViewPos.y,
    );

    // Update trail (track second bob for chaotic motion visualization)
    this.addTrailPoint(bob2ViewPos);
  }

  private addTrailPoint(point: Vector2): void {
    this.trailPoints.push(point.copy());

    // Limit trail length
    if (this.trailPoints.length > this.maxTrailPoints) {
      this.trailPoints.shift();
    }

    // Update trail shape
    if (this.trailPoints.length > 1) {
      const shape = new Shape();
      shape.moveToPoint(this.trailPoints[0]);
      for (let i = 1; i < this.trailPoints.length; i++) {
        shape.lineToPoint(this.trailPoints[i]);
      }
      this.trailPath.shape = shape;
    }
  }

  private clearTrail(): void {
    this.trailPoints.length = 0;
    this.trailPath.shape = null;
  }

  public reset(): void {
    // Clear trail
    this.clearTrail();

    // Clear graph data
    this.configurableGraph.clearData();

    // Update visualization to match reset model state
    this.updateVisualization();
  }

  public override step(dt: number): void {
    this.model.step(dt);
    // Update visualization after physics step completes
    // This ensures all state variables are updated consistently before drawing
    this.updateVisualization();

    // Add data point to configurable graph
    this.configurableGraph.addDataPoint();
  }

  /**
   * Apply a preset configuration to the model
   */
  private applyPreset(preset: Preset): void {
    this.isApplyingPreset = true;

    const config = preset.configuration;

    // Apply all configuration values to model properties
    if (config.length1 !== undefined) {
      this.model.length1Property.value = config.length1;
    }
    if (config.length2 !== undefined) {
      this.model.length2Property.value = config.length2;
    }
    if (config.mass1 !== undefined) {
      this.model.mass1Property.value = config.mass1;
    }
    if (config.mass2 !== undefined) {
      this.model.mass2Property.value = config.mass2;
    }
    if (config.gravity !== undefined) {
      this.model.gravityProperty.value = config.gravity;
    }
    if (config.damping !== undefined) {
      this.model.dampingProperty.value = config.damping;
    }
    if (config.angle1 !== undefined) {
      this.model.angle1Property.value = config.angle1;
    }
    if (config.angle2 !== undefined) {
      this.model.angle2Property.value = config.angle2;
    }

    // Reset angular velocities when applying preset
    this.model.angularVelocity1Property.value = 0;
    this.model.angularVelocity2Property.value = 0;

    // Reset simulation time only (don't reset the parameters we just set!)
    this.model.timeProperty.value = 0;

    // Clear trail when switching presets
    this.clearTrail();

    // Clear graph when switching presets (if it exists)
    if (this.configurableGraph) {
      this.configurableGraph.clearData();
    }

    // Announce preset change
    const a11yStrings = this.getA11yStrings();
    const template = a11yStrings.presetAppliedStringProperty.value;
    const announcement = template.replace('{{preset}}', preset.nameProperty.value);
    this.announceToScreenReader(announcement);

    this.isApplyingPreset = false;
  }
}
