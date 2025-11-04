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
import { Panel, ComboBox, Checkbox } from "scenerystack/sun";
import { NumberControl, PhetColorScheme, ArrowNode } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { BooleanProperty, Property, Multilink } from "scenerystack/axon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import {
  ConfigurableGraph,
  type PlottableProperty,
} from "../../common/view/graph/index.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";
import SimulationAnnouncer from "../../common/util/SimulationAnnouncer.js";
import { DoublePendulumPresets } from "../model/DoublePendulumPresets.js";
import { Preset } from "../../common/model/Preset.js";
import { VectorNode } from "../../common/view/VectorNode.js";
import { GridIcon } from "scenerystack/scenery-phet";

// Custom preset type to include "Custom" option
type PresetOption = Preset | "Custom";

export class DoublePendulumScreenView extends BaseScreenView<DoublePendulumModel> {
  private readonly bob1Node: Circle;
  private readonly bob1ReferenceDot: Circle; // Small dot showing center of mass position
  private readonly bob2Node: Circle;
  private readonly bob2ReferenceDot: Circle; // Small dot showing center of mass position
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

  // Vector visualization
  private readonly showVectorsProperty: BooleanProperty;
  private readonly showVelocityProperty: BooleanProperty;
  private readonly showForceProperty: BooleanProperty;
  private readonly showAccelerationProperty: BooleanProperty;
  // Vectors for bob 1
  private readonly velocity1VectorNode: VectorNode;
  private readonly force1VectorNode: VectorNode;
  private readonly acceleration1VectorNode: VectorNode;
  // Vectors for bob 2
  private readonly velocity2VectorNode: VectorNode;
  private readonly force2VectorNode: VectorNode;
  private readonly acceleration2VectorNode: VectorNode;

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

    // Setup grid visualization (add early so it's behind other elements)
    this.setupGrid(0.5, this.modelViewTransform); // 0.5 meter spacing

    // Setup measurement tools (distance tool, protractor, stopwatch)
    // Position protractor at the pivot point for angle measurement
    this.setupMeasurementTools(this.modelViewTransform, this.pivotPoint);

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

    // Bob 1 (size will be updated based on mass value)
    this.bob1Node = new Circle(15, {
      fill: ClassicalMechanicsColors.mass1FillColorProperty,
      stroke: ClassicalMechanicsColors.mass1StrokeColorProperty,
      lineWidth: 2,
      cursor: "pointer",
      // Add focus highlight for accessibility
      focusHighlight: "invisible",
    });
    this.addChild(this.bob1Node);

    // Center of mass reference dot for bob 1 (small circle at center of bob)
    this.bob1ReferenceDot = new Circle(3, {
      fill: ClassicalMechanicsColors.textColorProperty,
      stroke: "white",
      lineWidth: 1,
    });
    this.addChild(this.bob1ReferenceDot);

    // Bob 2 (size will be updated based on mass value)
    this.bob2Node = new Circle(15, {
      fill: ClassicalMechanicsColors.mass2FillColorProperty,
      stroke: ClassicalMechanicsColors.mass2StrokeColorProperty,
      lineWidth: 2,
      cursor: "pointer",
      // Add focus highlight for accessibility
      focusHighlight: "invisible",
    });
    this.addChild(this.bob2Node);

    // Center of mass reference dot for bob 2 (small circle at center of bob)
    this.bob2ReferenceDot = new Circle(3, {
      fill: ClassicalMechanicsColors.textColorProperty,
      stroke: "white",
      lineWidth: 1,
    });
    this.addChild(this.bob2ReferenceDot);

    // Link masses to visual sizes
    this.model.mass1Property.link((mass) => {
      this.updateBob1Size(mass);
    });
    this.model.mass2Property.link((mass) => {
      this.updateBob2Size(mass);
    });

    // Drag listener for bob 1 with accessibility announcements
    const a11yStrings = this.getA11yStrings();
    this.bob1Node.addInputListener(
      new DragListener({
        translateNode: false,
        start: () => {
          SimulationAnnouncer.announceDragInteraction(a11yStrings.draggingUpperBobStringProperty.value);
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
          SimulationAnnouncer.announceDragInteraction(announcement);
        },
      }),
    );

    // Drag listener for bob 2 with accessibility announcements
    this.bob2Node.addInputListener(
      new DragListener({
        translateNode: false,
        start: () => {
          SimulationAnnouncer.announceDragInteraction(a11yStrings.draggingLowerBobStringProperty.value);
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
          SimulationAnnouncer.announceDragInteraction(announcement);
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

    // Initialize vector visibility properties
    this.showVectorsProperty = new BooleanProperty(false);
    this.showVelocityProperty = new BooleanProperty(true);
    this.showForceProperty = new BooleanProperty(true);
    this.showAccelerationProperty = new BooleanProperty(false);

    // Create vector nodes for bob 1
    this.velocity1VectorNode = new VectorNode({
      color: PhetColorScheme.VELOCITY,
      scale: 50,
      label: "v₁",
      minMagnitude: 0.05,
    });
    this.addChild(this.velocity1VectorNode);

    this.force1VectorNode = new VectorNode({
      color: PhetColorScheme.APPLIED_FORCE,
      scale: 10,
      label: "F₁",
      minMagnitude: 0.1,
    });
    this.addChild(this.force1VectorNode);

    this.acceleration1VectorNode = new VectorNode({
      color: PhetColorScheme.ACCELERATION,
      scale: 20,
      label: "a₁",
      minMagnitude: 0.1,
    });
    this.addChild(this.acceleration1VectorNode);

    // Create vector nodes for bob 2
    this.velocity2VectorNode = new VectorNode({
      color: PhetColorScheme.VELOCITY,
      scale: 50,
      label: "v₂",
      minMagnitude: 0.05,
    });
    this.addChild(this.velocity2VectorNode);

    this.force2VectorNode = new VectorNode({
      color: PhetColorScheme.APPLIED_FORCE,
      scale: 10,
      label: "F₂",
      minMagnitude: 0.1,
    });
    this.addChild(this.force2VectorNode);

    this.acceleration2VectorNode = new VectorNode({
      color: PhetColorScheme.ACCELERATION,
      scale: 20,
      label: "a₂",
      minMagnitude: 0.1,
    });
    this.addChild(this.acceleration2VectorNode);

    // Link visibility properties to vector nodes
    Multilink.multilink(
      [this.showVectorsProperty, this.showVelocityProperty],
      (showVectors, showVelocity) => {
        this.velocity1VectorNode.setVectorVisible(showVectors && showVelocity);
        this.velocity2VectorNode.setVectorVisible(showVectors && showVelocity);
      }
    );

    Multilink.multilink(
      [this.showVectorsProperty, this.showForceProperty],
      (showVectors, showForce) => {
        this.force1VectorNode.setVectorVisible(showVectors && showForce);
        this.force2VectorNode.setVectorVisible(showVectors && showForce);
      }
    );

    Multilink.multilink(
      [this.showVectorsProperty, this.showAccelerationProperty],
      (showVectors, showAcceleration) => {
        this.acceleration1VectorNode.setVectorVisible(showVectors && showAcceleration);
        this.acceleration2VectorNode.setVectorVisible(showVectors && showAcceleration);
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
    this.model.length1Property.lazyLink(detectCustomChange);
    this.model.length2Property.lazyLink(detectCustomChange);
    this.model.mass1Property.lazyLink(detectCustomChange);
    this.model.mass2Property.lazyLink(detectCustomChange);
    this.model.gravityProperty.lazyLink(detectCustomChange);
    this.model.dampingProperty.lazyLink(detectCustomChange);

    // Add accessibility announcements for parameter changes
    this.model.length1Property.lazyLink((length) => {
      SimulationAnnouncer.announceParameterChange(`Upper pendulum length changed to ${length.toFixed(1)} meters`);
    });
    this.model.length2Property.lazyLink((length) => {
      SimulationAnnouncer.announceParameterChange(`Lower pendulum length changed to ${length.toFixed(1)} meters`);
    });
    this.model.mass1Property.lazyLink((mass) => {
      SimulationAnnouncer.announceParameterChange(`Upper bob mass changed to ${mass.toFixed(1)} kilograms`);
    });
    this.model.mass2Property.lazyLink((mass) => {
      SimulationAnnouncer.announceParameterChange(`Lower bob mass changed to ${mass.toFixed(1)} kilograms`);
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
    // Position graph at lower left, not overlapping time controls
    this.configurableGraph.left = this.layoutBounds.minX + 10;
    this.configurableGraph.bottom = this.layoutBounds.maxY - 70; // Leave room for time controls
    this.addChild(this.configurableGraph);

    // Setup common controls (time controls, reset button, keyboard shortcuts)
    this.setupCommonControls();

    // Add additional keyboard shortcut for trail toggle
    const trailKeyboardListener = new KeyboardListener({
      keys: ["t"],
      fire: (_event, keysPressed) => {
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
            fill: ClassicalMechanicsColors.textColorProperty,
          }),
          new ArrowNode(0, 0, 15, 0, {
            fill: PhetColorScheme.VELOCITY,
            stroke: PhetColorScheme.VELOCITY,
            headHeight: 6,
            headWidth: 6,
            tailWidth: 2,
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
            fill: ClassicalMechanicsColors.textColorProperty,
          }),
          new ArrowNode(0, 0, 15, 0, {
            fill: PhetColorScheme.APPLIED_FORCE,
            stroke: PhetColorScheme.APPLIED_FORCE,
            headHeight: 6,
            headWidth: 6,
            tailWidth: 2,
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
            fill: ClassicalMechanicsColors.textColorProperty,
          }),
          new ArrowNode(0, 0, 15, 0, {
            fill: PhetColorScheme.ACCELERATION,
            stroke: PhetColorScheme.ACCELERATION,
            headHeight: 6,
            headWidth: 6,
            tailWidth: 2,
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

    // Update center of mass reference dots
    this.bob1ReferenceDot.center = bob1ViewPos;
    this.bob2ReferenceDot.center = bob2ViewPos;

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

  /**
   * Update bob 1 size based on mass value.
   * Larger masses appear as larger bobs.
   */
  private updateBob1Size(mass: number): void {
    // Map mass [0.1, 5.0] kg to radius [10, 30] pixels
    const minMass = 0.1, maxMass = 5.0;
    const minRadius = 10, maxRadius = 30;
    const radius = minRadius + (mass - minMass) * (maxRadius - minRadius) / (maxMass - minMass);

    // Update circle radius
    this.bob1Node.radius = radius;

    // Update visualization to ensure bob is positioned correctly
    this.updateVisualization();
  }

  /**
   * Update bob 2 size based on mass value.
   * Larger masses appear as larger bobs.
   */
  private updateBob2Size(mass: number): void {
    // Map mass [0.1, 5.0] kg to radius [10, 30] pixels
    const minMass = 0.1, maxMass = 5.0;
    const minRadius = 10, maxRadius = 30;
    const radius = minRadius + (mass - minMass) * (maxRadius - minRadius) / (maxMass - minMass);

    // Update circle radius
    this.bob2Node.radius = radius;

    // Update visualization to ensure bob is positioned correctly
    this.updateVisualization();
  }

  public override reset(): void {
    super.reset(); // Reset base view properties

    // Reset vector visibility properties
    this.showVectorsProperty.reset();
    this.showVelocityProperty.reset();
    this.showForceProperty.reset();
    this.showAccelerationProperty.reset();

    // Reset trail visibility
    this.trailVisibleProperty.reset();

    // Clear trail
    this.clearTrail();

    // Clear graph data
    this.configurableGraph.clearData();

    // Update visualization to match reset model state
    this.updateVisualization();
  }

  public override step(dt: number): void {
    super.step(dt); // Step the stopwatch and other base view components
    this.model.step(dt);
    // Update visualization after physics step completes
    // This ensures all state variables are updated consistently before drawing
    this.updateVisualization();

    // Add data point to configurable graph
    this.configurableGraph.addDataPoint();

    // Update vector visualizations
    this.updateVectors();
  }

  /**
   * Update vector positions and magnitudes for both bobs
   * For double pendulum, we compute tangential velocities, forces, and accelerations
   */
  private updateVectors(): void {
    const angle1 = this.model.angle1Property.value;
    const angle2 = this.model.angle2Property.value;
    const omega1 = this.model.angularVelocity1Property.value;
    const omega2 = this.model.angularVelocity2Property.value;
    const L1 = this.model.length1Property.value;
    const L2 = this.model.length2Property.value;
    const m1 = this.model.mass1Property.value;
    const m2 = this.model.mass2Property.value;
    const g = this.model.gravityProperty.value;

    // Get bob positions in view coordinates
    const bob1ViewPos = this.bob1Node.center;
    const bob2ViewPos = this.bob2Node.center;

    // Calculate tangential direction for bob 1 (perpendicular to rod 1)
    const tangent1X = Math.cos(angle1);
    const tangent1Y = Math.sin(angle1);

    // Tangential velocity for bob 1: v1 = L1 * ω1
    const v1Magnitude = L1 * Math.abs(omega1);
    const v1Sign = omega1 >= 0 ? 1 : -1;
    const velocity1Vector = new Vector2(
      tangent1X * v1Magnitude * v1Sign,
      tangent1Y * v1Magnitude * v1Sign
    );

    // Calculate tangential direction for bob 2 (perpendicular to rod 2)
    const tangent2X = Math.cos(angle2);
    const tangent2Y = Math.sin(angle2);

    // Simplified: use tangential component relative to pivot
    const velocity2Vector = new Vector2(
      tangent1X * L1 * omega1 + tangent2X * L2 * omega2,
      tangent1Y * L1 * omega1 + tangent2Y * L2 * omega2
    );

    // For simplicity, we'll show approximate forces proportional to accelerations
    // Full double pendulum dynamics are complex, but we can approximate:
    // α1 ≈ -(g/L1)*sin(θ1) for the dominant gravitational component
    // α2 ≈ -(g/L2)*sin(θ2) for the dominant gravitational component

    const alpha1Approx = -(g / L1) * Math.sin(angle1);
    const alpha2Approx = -(g / L2) * Math.sin(angle2);

    const accel1Magnitude = L1 * Math.abs(alpha1Approx);
    const accel1Sign = alpha1Approx >= 0 ? 1 : -1;
    const acceleration1Vector = new Vector2(
      tangent1X * accel1Magnitude * accel1Sign,
      tangent1Y * accel1Magnitude * accel1Sign
    );

    const accel2Magnitude = L2 * Math.abs(alpha2Approx);
    const accel2Sign = alpha2Approx >= 0 ? 1 : -1;
    const acceleration2Vector = new Vector2(
      tangent2X * accel2Magnitude * accel2Sign,
      tangent2Y * accel2Magnitude * accel2Sign
    );

    // Forces: F = m * a
    const force1Vector = acceleration1Vector.times(m1 + m2);  // Bob 1 carries both masses
    const force2Vector = acceleration2Vector.times(m2);

    // Update vectors for bob 1
    this.velocity1VectorNode.setTailPosition(bob1ViewPos);
    this.velocity1VectorNode.setVector(velocity1Vector);

    this.force1VectorNode.setTailPosition(bob1ViewPos);
    this.force1VectorNode.setVector(force1Vector);

    this.acceleration1VectorNode.setTailPosition(bob1ViewPos);
    this.acceleration1VectorNode.setVector(acceleration1Vector);

    // Update vectors for bob 2
    this.velocity2VectorNode.setTailPosition(bob2ViewPos);
    this.velocity2VectorNode.setVector(velocity2Vector);

    this.force2VectorNode.setTailPosition(bob2ViewPos);
    this.force2VectorNode.setVector(force2Vector);

    this.acceleration2VectorNode.setTailPosition(bob2ViewPos);
    this.acceleration2VectorNode.setVector(acceleration2Vector);
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
    SimulationAnnouncer.announceDragInteraction(announcement);

    this.isApplyingPreset = false;
  }
}
