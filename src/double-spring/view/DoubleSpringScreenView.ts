/**
 * View for the Double Spring screen.
 * Displays two masses connected by springs.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { DoubleSpringModel } from "../model/DoubleSpringModel.js";
import { Rectangle, Line, VBox, HBox, Node, Text } from "scenerystack/scenery";
import { Panel, ComboBox, Checkbox } from "scenerystack/sun";
import { NumberControl } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { SpringNode } from "../../common/view/SpringNode.js";
import { VectorNode } from "../../common/view/VectorNode.js";
import { DragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";
import { DoubleSpringPresets } from "../model/DoubleSpringPresets.js";
import { Preset } from "../../common/model/Preset.js";
import { Property, BooleanProperty } from "scenerystack/axon";

// Custom preset type to include "Custom" option
type PresetOption = Preset | "Custom";

export class DoubleSpringScreenView extends BaseScreenView<DoubleSpringModel> {
  private readonly mass1Node: Rectangle;
  private readonly mass2Node: Rectangle;
  private readonly spring1Node: SpringNode;
  private readonly spring2Node: SpringNode;
  private readonly fixedPoint: Vector2;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly presetProperty: Property<PresetOption>;
  private readonly presets: Preset[];
  private isApplyingPreset: boolean = false;

  // Vector visualization
  private readonly showVectorsProperty: BooleanProperty;
  private readonly showVelocityProperty: BooleanProperty;
  private readonly showForceProperty: BooleanProperty;
  private readonly showAccelerationProperty: BooleanProperty;
  // Vectors for mass 1
  private readonly velocity1VectorNode: VectorNode;
  private readonly force1VectorNode: VectorNode;
  private readonly acceleration1VectorNode: VectorNode;
  // Vectors for mass 2
  private readonly velocity2VectorNode: VectorNode;
  private readonly force2VectorNode: VectorNode;
  private readonly acceleration2VectorNode: VectorNode;

  public constructor(model: DoubleSpringModel, options?: ScreenViewOptions) {
    super(model, options);

    // Get available presets
    this.presets = DoubleSpringPresets.getPresets();

    // Initialize with first preset as default
    this.presetProperty = new Property<PresetOption>(this.presets[0]);

    // Fixed point for spring attachment
    this.fixedPoint = new Vector2(100, this.layoutBounds.centerY);

    // Create modelViewTransform: maps model coordinates (meters) to view coordinates (pixels)
    // Maps model origin (0, 0) to the fixed point, with 50 pixels per meter
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      this.fixedPoint,
      50, // pixels per meter
    );

    // Wall
    const wall = new Line(
      this.fixedPoint.x - 20,
      this.layoutBounds.minY,
      this.fixedPoint.x - 20,
      this.layoutBounds.maxY,
      {
        stroke: ClassicalMechanicsColors.rodStrokeColorProperty,
        lineWidth: 4,
      },
    );
    this.addChild(wall);

    // Spring 1 (wall to mass 1)
    this.spring1Node = new SpringNode({
      loops: 10,
      radius: 12,
      lineWidth: 3,
    });
    this.addChild(this.spring1Node);

    // Spring 2 (mass 1 to mass 2)
    this.spring2Node = new SpringNode({
      loops: 10,
      radius: 12,
      lineWidth: 3,
    });
    this.addChild(this.spring2Node);

    // Mass 1
    this.mass1Node = new Rectangle(-20, -20, 40, 40, {
      fill: ClassicalMechanicsColors.mass1FillColorProperty,
      stroke: ClassicalMechanicsColors.mass1StrokeColorProperty,
      lineWidth: 2,
      cornerRadius: 3,
      cursor: "pointer",
      // Add focus highlight for accessibility
      focusHighlight: "invisible",
    });
    this.addChild(this.mass1Node);

    // Mass 2
    this.mass2Node = new Rectangle(-20, -20, 40, 40, {
      fill: ClassicalMechanicsColors.mass2FillColorProperty,
      stroke: ClassicalMechanicsColors.mass2StrokeColorProperty,
      lineWidth: 2,
      cornerRadius: 3,
      cursor: "pointer",
      // Add focus highlight for accessibility
      focusHighlight: "invisible",
    });
    this.addChild(this.mass2Node);

    // Drag listeners with accessibility announcements
    const a11yStrings = this.getA11yStrings();
    this.mass1Node.addInputListener(
      new DragListener({
        translateNode: false,
        start: () => {
          this.announceToScreenReader(a11yStrings.draggingMass1StringProperty.value);
        },
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const modelPosition =
            this.modelViewTransform.viewToModelPosition(parentPoint);
          this.model.position1Property.value = modelPosition.x;
          this.model.velocity1Property.value = 0;
        },
        end: () => {
          const position = this.model.position1Property.value.toFixed(2);
          const template = a11yStrings.mass1ReleasedAtStringProperty.value;
          const announcement = template.replace('{{position}}', position);
          this.announceToScreenReader(announcement);
        },
      }),
    );

    this.mass2Node.addInputListener(
      new DragListener({
        translateNode: false,
        start: () => {
          this.announceToScreenReader(a11yStrings.draggingMass2StringProperty.value);
        },
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const modelPosition =
            this.modelViewTransform.viewToModelPosition(parentPoint);
          this.model.position2Property.value = modelPosition.x;
          this.model.velocity2Property.value = 0;
        },
        end: () => {
          const position = this.model.position2Property.value.toFixed(2);
          const template = a11yStrings.mass2ReleasedAtStringProperty.value;
          const announcement = template.replace('{{position}}', position);
          this.announceToScreenReader(announcement);
        },
      }),
    );

    // Link model to view
    this.model.position1Property.link(() => this.updateVisualization());
    this.model.position2Property.link(() => this.updateVisualization());

    // Initialize vector visibility properties
    this.showVectorsProperty = new BooleanProperty(false);
    this.showVelocityProperty = new BooleanProperty(true);
    this.showForceProperty = new BooleanProperty(true);
    this.showAccelerationProperty = new BooleanProperty(false);

    // Create vector nodes for mass 1
    this.velocity1VectorNode = new VectorNode({
      color: "blue",
      scale: 50,
      label: "v₁",
      minMagnitude: 0.05,
    });
    this.addChild(this.velocity1VectorNode);

    this.force1VectorNode = new VectorNode({
      color: "red",
      scale: 10,
      label: "F₁",
      minMagnitude: 0.1,
    });
    this.addChild(this.force1VectorNode);

    this.acceleration1VectorNode = new VectorNode({
      color: "green",
      scale: 20,
      label: "a₁",
      minMagnitude: 0.1,
    });
    this.addChild(this.acceleration1VectorNode);

    // Create vector nodes for mass 2
    this.velocity2VectorNode = new VectorNode({
      color: "cyan",
      scale: 50,
      label: "v₂",
      minMagnitude: 0.05,
    });
    this.addChild(this.velocity2VectorNode);

    this.force2VectorNode = new VectorNode({
      color: "orange",
      scale: 10,
      label: "F₂",
      minMagnitude: 0.1,
    });
    this.addChild(this.force2VectorNode);

    this.acceleration2VectorNode = new VectorNode({
      color: "lime",
      scale: 20,
      label: "a₂",
      minMagnitude: 0.1,
    });
    this.addChild(this.acceleration2VectorNode);

    // Link visibility properties to vector nodes
    Property.multilink(
      [this.showVectorsProperty, this.showVelocityProperty],
      (showVectors, showVelocity) => {
        this.velocity1VectorNode.setVectorVisible(showVectors && showVelocity);
        this.velocity2VectorNode.setVectorVisible(showVectors && showVelocity);
      }
    );

    Property.multilink(
      [this.showVectorsProperty, this.showForceProperty],
      (showVectors, showForce) => {
        this.force1VectorNode.setVectorVisible(showVectors && showForce);
        this.force2VectorNode.setVectorVisible(showVectors && showForce);
      }
    );

    Property.multilink(
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
    this.model.mass1Property.lazyLink(detectCustomChange);
    this.model.mass2Property.lazyLink(detectCustomChange);
    this.model.springConstant1Property.lazyLink(detectCustomChange);
    this.model.springConstant2Property.lazyLink(detectCustomChange);

    // Add accessibility announcements for parameter changes
    this.model.mass1Property.lazyLink((mass) => {
      this.announceToScreenReader(`Mass 1 changed to ${mass.toFixed(1)} kilograms`);
    });
    this.model.mass2Property.lazyLink((mass) => {
      this.announceToScreenReader(`Mass 2 changed to ${mass.toFixed(1)} kilograms`);
    });
    this.model.springConstant1Property.lazyLink((springConstant) => {
      this.announceToScreenReader(`Spring 1 constant changed to ${springConstant.toFixed(0)} newtons per meter`);
    });
    this.model.springConstant2Property.lazyLink((springConstant) => {
      this.announceToScreenReader(`Spring 2 constant changed to ${springConstant.toFixed(0)} newtons per meter`);
    });

    // Apply the first preset immediately
    this.applyPreset(this.presets[0]);

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

    const spring1Control = new NumberControl(
      controlLabels.springConstant1StringProperty,
      this.model.springConstant1Property,
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

    const spring2Control = new NumberControl(
      controlLabels.springConstant2StringProperty,
      this.model.springConstant2Property,
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
        ],
      }),
      {
        boxWidth: 14,
      }
    );

    const panel = new Panel(
      new VBox({
        spacing: 12,
        align: "left",
        children: [
          presetRow,
          mass1Control,
          mass2Control,
          spring1Control,
          spring2Control,
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
    // Convert model positions to view coordinates
    const mass1ModelPos = new Vector2(this.model.position1Property.value, 0);
    const mass2ModelPos = new Vector2(this.model.position2Property.value, 0);
    const mass1ViewPos =
      this.modelViewTransform.modelToViewPosition(mass1ModelPos);
    const mass2ViewPos =
      this.modelViewTransform.modelToViewPosition(mass2ModelPos);

    // Update mass positions
    this.mass1Node.center = mass1ViewPos;
    this.mass2Node.center = mass2ViewPos;

    // Update spring endpoints
    this.spring1Node.setEndpoints(
      this.fixedPoint,
      new Vector2(mass1ViewPos.x - 20, mass1ViewPos.y),
    );

    this.spring2Node.setEndpoints(
      new Vector2(mass1ViewPos.x + 20, mass1ViewPos.y),
      new Vector2(mass2ViewPos.x - 20, mass2ViewPos.y),
    );
  }

  public reset(): void {
    // Update visualization to match reset model state
    this.updateVisualization();
  }

  public override step(dt: number): void {
    this.model.step(dt);

    // Update vector visualizations
    this.updateVectors();
  }

  /**
   * Update vector positions and magnitudes for both masses
   */
  private updateVectors(): void {
    // Get current model state
    const x1 = this.model.position1Property.value;
    const v1 = this.model.velocity1Property.value;
    const x2 = this.model.position2Property.value;
    const v2 = this.model.velocity2Property.value;
    const m1 = this.model.mass1Property.value;
    const m2 = this.model.mass2Property.value;
    const k1 = this.model.springConstant1Property.value;
    const k2 = this.model.springConstant2Property.value;
    const b1 = this.model.damping1Property.value;
    const b2 = this.model.damping2Property.value;

    // Calculate forces on mass 1
    // F1 = -k1*x1 + k2*(x2 - x1) - b1*v1
    const force1 = -k1 * x1 + k2 * (x2 - x1) - b1 * v1;
    const acceleration1 = force1 / m1;

    // Calculate forces on mass 2
    // F2 = -k2*(x2 - x1) - b2*v2
    const force2 = -k2 * (x2 - x1) - b2 * v2;
    const acceleration2 = force2 / m2;

    // Get mass center positions in view coordinates
    const mass1Center = this.mass1Node.center;
    const mass2Center = this.mass2Node.center;

    // Update vectors for mass 1
    this.velocity1VectorNode.setTailPosition(mass1Center);
    this.velocity1VectorNode.setVector(new Vector2(v1, 0));

    this.force1VectorNode.setTailPosition(mass1Center);
    this.force1VectorNode.setVector(new Vector2(force1, 0));

    this.acceleration1VectorNode.setTailPosition(mass1Center);
    this.acceleration1VectorNode.setVector(new Vector2(acceleration1, 0));

    // Update vectors for mass 2
    this.velocity2VectorNode.setTailPosition(mass2Center);
    this.velocity2VectorNode.setVector(new Vector2(v2, 0));

    this.force2VectorNode.setTailPosition(mass2Center);
    this.force2VectorNode.setVector(new Vector2(force2, 0));

    this.acceleration2VectorNode.setTailPosition(mass2Center);
    this.acceleration2VectorNode.setVector(new Vector2(acceleration2, 0));
  }

  /**
   * Apply a preset configuration to the model
   */
  private applyPreset(preset: Preset): void {
    this.isApplyingPreset = true;

    const config = preset.configuration;

    // Apply all configuration values to model properties
    if (config.mass1 !== undefined) {
      this.model.mass1Property.value = config.mass1;
    }
    if (config.mass2 !== undefined) {
      this.model.mass2Property.value = config.mass2;
    }
    if (config.springConstant1 !== undefined) {
      this.model.springConstant1Property.value = config.springConstant1;
    }
    if (config.springConstant2 !== undefined) {
      this.model.springConstant2Property.value = config.springConstant2;
    }
    if (config.position1 !== undefined) {
      this.model.position1Property.value = config.position1;
    }
    if (config.position2 !== undefined) {
      this.model.position2Property.value = config.position2;
    }

    // Reset velocities when applying preset
    this.model.velocity1Property.value = 0;
    this.model.velocity2Property.value = 0;

    // Reset simulation time only (don't reset the parameters we just set!)
    this.model.timeProperty.value = 0;

    // Announce preset change
    const a11yStrings = this.getA11yStrings();
    const template = a11yStrings.presetAppliedStringProperty.value;
    const announcement = template.replace('{{preset}}', preset.nameProperty.value);
    this.announceToScreenReader(announcement);

    this.isApplyingPreset = false;
  }
}
