/**
 * View for the Double Spring screen.
 * Displays two masses connected by springs.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { DoubleSpringModel } from "../model/DoubleSpringModel.js";
import { Rectangle, Line, VBox, Node, Text, RichText } from "scenerystack/scenery";
import { PhetFont, FormulaNode } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { SpringNode } from "../../common/view/SpringNode.js";
import { ParametricSpringNode } from "../../common/view/ParametricSpringNode.js";
import SpringVisualizationType from "../../common/view/SpringVisualizationType.js";
import { VectorNode } from "../../common/view/VectorNode.js";
import { DragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";
import SimulationAnnouncer from "../../common/util/SimulationAnnouncer.js";
import { DoubleSpringPresets } from "../model/DoubleSpringPresets.js";
import { Preset } from "../../common/model/Preset.js";
import { Property } from "scenerystack/axon";
import type { PlottableProperty } from "../../common/view/graph/PlottableProperty.js";
import { VectorNodeFactory } from "../../common/view/VectorNodeFactory.js";
import { ParameterControlPanel } from "../../common/view/ParameterControlPanel.js";
import { type PresetOption } from "../../common/view/PresetSelectorFactory.js";
import {
  DOUBLE_SPRING_LOOPS,
  DOUBLE_SPRING_RADIUS,
  SPRING_LINE_WIDTH,
  SPRING_LEFT_END_LENGTH,
  SPRING_RIGHT_END_LENGTH,
} from "../../common/view/SpringVisualizationConstants.js";
import {
  FONT_SIZE_BODY_TEXT,
  FONT_SIZE_SECONDARY_LABEL,
  FONT_SIZE_SCREEN_TITLE,
} from "../../common/view/FontSizeConstants.js";
import {
  SPACING_LARGE,
} from "../../common/view/UILayoutConstants.js";

export class DoubleSpringScreenView extends BaseScreenView<DoubleSpringModel> {
  private readonly mass1Node: Rectangle;
  private readonly mass1ReferenceLine: Line; // Horizontal line showing center of mass1 position
  private readonly mass2Node: Rectangle;
  private readonly mass2ReferenceLine: Line; // Horizontal line showing center of mass2 position
  private readonly classicSpring1Node: SpringNode;
  private readonly parametricSpring1Node: ParametricSpringNode;
  private currentSpring1Node: SpringNode | ParametricSpringNode;
  private readonly classicSpring2Node: SpringNode;
  private readonly parametricSpring2Node: ParametricSpringNode;
  private currentSpring2Node: SpringNode | ParametricSpringNode;
  private readonly fixedPoint: Vector2;
  protected readonly presetProperty: Property<PresetOption>;
  protected readonly presets: Preset[];
  protected isApplyingPreset: boolean = false;

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

    // Fixed point for spring attachment (top of screen, centered horizontally)
    // Position the fixed point at the wall location for proper attachment
    const wallY = 80;
    this.fixedPoint = new Vector2(this.layoutBounds.centerX, wallY);

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

    // Wall (horizontal bar at top)
    const wall = new Line(
      this.layoutBounds.centerX-20,
      wallY,
      this.layoutBounds.centerX+20,
      wallY,
      {
        stroke: ClassicalMechanicsColors.rodStrokeColorProperty,
        lineWidth: 4,
      },
    );
    this.addChild(wall);

    // Create both spring node types for spring 1 (only one will be visible at a time)
    this.classicSpring1Node = new SpringNode({
      loops: DOUBLE_SPRING_LOOPS,
      radius: DOUBLE_SPRING_RADIUS,
      lineWidth: SPRING_LINE_WIDTH,
      leftEndLength: SPRING_LEFT_END_LENGTH,
      rightEndLength: SPRING_RIGHT_END_LENGTH,
    });

    this.parametricSpring1Node = new ParametricSpringNode({
      loops: DOUBLE_SPRING_LOOPS,
      radius: DOUBLE_SPRING_RADIUS,
      lineWidth: SPRING_LINE_WIDTH,
      leftEndLength: SPRING_LEFT_END_LENGTH,
      rightEndLength: SPRING_RIGHT_END_LENGTH,
    });

    // Create both spring node types for spring 2 (only one will be visible at a time)
    this.classicSpring2Node = new SpringNode({
      loops: DOUBLE_SPRING_LOOPS,
      radius: DOUBLE_SPRING_RADIUS,
      lineWidth: SPRING_LINE_WIDTH,
      leftEndLength: SPRING_LEFT_END_LENGTH,
      rightEndLength: SPRING_RIGHT_END_LENGTH,
    });

    this.parametricSpring2Node = new ParametricSpringNode({
      loops: DOUBLE_SPRING_LOOPS,
      radius: DOUBLE_SPRING_RADIUS,
      lineWidth: SPRING_LINE_WIDTH,
      leftEndLength: SPRING_LEFT_END_LENGTH,
      rightEndLength: SPRING_RIGHT_END_LENGTH,
    });

    // Set initial spring nodes based on preference
    const useParametric =
      ClassicalMechanicsPreferences.springVisualizationTypeProperty.value ===
      SpringVisualizationType.PARAMETRIC;

    this.currentSpring1Node = useParametric
      ? this.parametricSpring1Node
      : this.classicSpring1Node;
    this.currentSpring2Node = useParametric
      ? this.parametricSpring2Node
      : this.classicSpring2Node;

    this.addChild(this.currentSpring1Node);
    this.addChild(this.currentSpring2Node);

    // Link spring constants to visual appearance
    this.model.springConstant1Property.link((k) => {
      this.updateSpring1Appearance(k);
    });
    this.model.springConstant2Property.link((k) => {
      this.updateSpring2Appearance(k);
    });

    // Mass 1 (size will be updated based on mass value)
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

    // Center of mass reference line for mass 1
    this.mass1ReferenceLine = new Line(0, 0, 0, 0, {
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 2,
      lineDash: [5, 3],
    });
    this.addChild(this.mass1ReferenceLine);

    // Mass 2 (size will be updated based on mass value)
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

    // Center of mass reference line for mass 2
    this.mass2ReferenceLine = new Line(0, 0, 0, 0, {
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 2,
      lineDash: [5, 3],
    });
    this.addChild(this.mass2ReferenceLine);

    // Link masses to visual sizes
    this.model.mass1Property.link((mass) => {
      this.updateMass1Size(mass);
    });
    this.model.mass2Property.link((mass) => {
      this.updateMass2Size(mass);
    });

    // Listen to spring visualization preference changes
    // Using lazyLink to avoid triggering during initialization
    ClassicalMechanicsPreferences.springVisualizationTypeProperty.lazyLink(
      (springType) => {
        this.switchSpringVisualization(springType);
      }
    );

    // Drag listeners with accessibility announcements
    const a11yStrings = this.getA11yStrings();
    let dragOffsetModel1 = 0; // Track the offset in model coordinates for mass1
    this.mass1Node.addInputListener(
      new DragListener({
        translateNode: false,
        start: (event) => {
          // Calculate initial offset in model coordinates
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const pointerModelY = this.modelViewTransform!.viewToModelY(parentPoint.y);
          const currentModelPosition = this.model.position1Property.value;
          dragOffsetModel1 = currentModelPosition - pointerModelY;
          SimulationAnnouncer.announceDragInteraction(a11yStrings.draggingMass1StringProperty.value);
        },
        drag: (event) => {
          // Apply offset in model coordinates
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const pointerModelY = this.modelViewTransform!.viewToModelY(parentPoint.y);
          this.model.position1Property.value = pointerModelY + dragOffsetModel1;
          this.model.velocity1Property.value = 0;
        },
        end: () => {
          const position = this.model.position1Property.value.toFixed(2);
          const template = a11yStrings.mass1ReleasedAtStringProperty.value;
          const announcement = template.replace('{{position}}', position);
          SimulationAnnouncer.announceDragInteraction(announcement);
        },
      }),
    );

    let dragOffsetModel2 = 0; // Track the offset in model coordinates for mass2
    this.mass2Node.addInputListener(
      new DragListener({
        translateNode: false,
        start: (event) => {
          // Calculate initial offset in model coordinates
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const pointerModelY = this.modelViewTransform!.viewToModelY(parentPoint.y);
          const currentModelPosition = this.model.position2Property.value;
          dragOffsetModel2 = currentModelPosition - pointerModelY;
          SimulationAnnouncer.announceDragInteraction(a11yStrings.draggingMass2StringProperty.value);
        },
        drag: (event) => {
          // Apply offset in model coordinates
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const pointerModelY = this.modelViewTransform!.viewToModelY(parentPoint.y);
          this.model.position2Property.value = pointerModelY + dragOffsetModel2;
          this.model.velocity2Property.value = 0;
        },
        end: () => {
          const position = this.model.position2Property.value.toFixed(2);
          const template = a11yStrings.mass2ReleasedAtStringProperty.value;
          const announcement = template.replace('{{position}}', position);
          SimulationAnnouncer.announceDragInteraction(announcement);
        },
      }),
    );

    // Link model to view
    this.model.position1Property.link(() => this.updateVisualization());
    this.model.position2Property.link(() => this.updateVisualization());
    this.model.naturalLength1Property.link(() => this.updateVisualization());
    this.model.naturalLength2Property.link(() => this.updateVisualization());

    // Listen to spring visualization preference changes
    // Using lazyLink to avoid triggering during initialization
    ClassicalMechanicsPreferences.springVisualizationTypeProperty.lazyLink(
      (springType) => {
        this.switchSpringVisualization(springType);
      }
    );

    // Initialize vector visibility properties (from base class)
    this.showVelocityProperty.setInitialValue(true);
    this.showForceProperty.setInitialValue(true);
    this.showAccelerationProperty.setInitialValue(false);

    // Create vector nodes using factory
    const vectors1 = VectorNodeFactory.createVectorNodes("₁");
    this.velocity1VectorNode = vectors1.velocity;
    this.force1VectorNode = vectors1.force;
    this.acceleration1VectorNode = vectors1.acceleration;

    this.addChild(this.velocity1VectorNode);
    this.addChild(this.force1VectorNode);
    this.addChild(this.acceleration1VectorNode);

    const vectors2 = VectorNodeFactory.createVectorNodes("₂");
    this.velocity2VectorNode = vectors2.velocity;
    this.force2VectorNode = vectors2.force;
    this.acceleration2VectorNode = vectors2.acceleration;

    this.addChild(this.velocity2VectorNode);
    this.addChild(this.force2VectorNode);
    this.addChild(this.acceleration2VectorNode);

    // Link visibility properties to vector nodes
    this.showVelocityProperty.link((showVelocity) => {
      this.velocity1VectorNode.setVectorVisible(showVelocity);
      this.velocity2VectorNode.setVectorVisible(showVelocity);
    });

    this.showForceProperty.link((showForce) => {
      this.force1VectorNode.setVectorVisible(showForce);
      this.force2VectorNode.setVectorVisible(showForce);
    });

    this.showAccelerationProperty.link((showAcceleration) => {
      this.acceleration1VectorNode.setVectorVisible(showAcceleration);
      this.acceleration2VectorNode.setVectorVisible(showAcceleration);
    });

    // Control panel
    const controlPanel = this.createControlPanel();
    this.addChild(controlPanel);

    // Position control panel at the top right
    controlPanel.right = this.layoutBounds.maxX - 10;
    controlPanel.top = this.layoutBounds.minY + 10;

    // Create configurable graph with available properties
    const stringManager = StringManager.getInstance();
    const propertyNames = stringManager.getGraphPropertyNames();
    const availableProperties: PlottableProperty[] = [
      {
        name: propertyNames.position1StringProperty,
        property: this.model.position1Property,
        unit: "m",
      },
      {
        name: propertyNames.position2StringProperty,
        property: this.model.position2Property,
        unit: "m",
      },
      {
        name: propertyNames.velocity1StringProperty,
        property: this.model.velocity1Property,
        unit: "m/s",
      },
      {
        name: propertyNames.velocity2StringProperty,
        property: this.model.velocity2Property,
        unit: "m/s",
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

    // Setup the configurable graph (position1 vs time by default)
    this.setupConfigurableGraph(availableProperties, 0);
    this.addChild(this.configurableGraph!);

    // Setup vector and tools panels using base class method (no protractor for spring screens)
    this.setupVectorAndToolsPanels(false);

    // Position graph beneath vector panel
    this.positionConfigurableGraph(this.vectorPanel!);

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
    this.model.damping1Property.lazyLink(detectCustomChange);
    this.model.damping2Property.lazyLink(detectCustomChange);
    this.model.gravityProperty.lazyLink(detectCustomChange);

    // Add accessibility announcements for parameter changes
    this.model.mass1Property.lazyLink((mass) => {
      SimulationAnnouncer.announceParameterChange(`Mass 1 changed to ${mass.toFixed(1)} kilograms`);
    });
    this.model.mass2Property.lazyLink((mass) => {
      SimulationAnnouncer.announceParameterChange(`Mass 2 changed to ${mass.toFixed(1)} kilograms`);
    });
    this.model.springConstant1Property.lazyLink((springConstant) => {
      SimulationAnnouncer.announceParameterChange(`Spring 1 constant changed to ${springConstant.toFixed(0)} newtons per meter`);
    });
    this.model.springConstant2Property.lazyLink((springConstant) => {
      SimulationAnnouncer.announceParameterChange(`Spring 2 constant changed to ${springConstant.toFixed(0)} newtons per meter`);
    });
    this.model.damping1Property.lazyLink((damping) => {
      SimulationAnnouncer.announceParameterChange(`Damping 1 changed to ${damping.toFixed(2)} newton seconds per meter`);
    });
    this.model.damping2Property.lazyLink((damping) => {
      SimulationAnnouncer.announceParameterChange(`Damping 2 changed to ${damping.toFixed(2)} newton seconds per meter`);
    });
    this.model.gravityProperty.lazyLink((gravity) => {
      SimulationAnnouncer.announceParameterChange(`Gravity changed to ${gravity.toFixed(1)} meters per second squared`);
    });

    // Apply the first preset immediately
    this.applyPreset(this.presets[0]);

    // Setup common controls (time controls, reset button, info button, keyboard shortcuts)
    this.setupCommonControls();

    // Manage z-order using base class method
    this.manageZOrder(
      [
        this.currentSpring1Node,
        this.currentSpring2Node,
        this.mass1Node,
        this.mass1ReferenceLine,
        this.mass2Node,
        this.mass2ReferenceLine,
      ],
      [
        this.velocity1VectorNode,
        this.force1VectorNode,
        this.acceleration1VectorNode,
        this.velocity2VectorNode,
        this.force2VectorNode,
        this.acceleration2VectorNode,
      ],
    );

    // Initial visualization
    this.updateVisualization();
  }

  private createControlPanel(): Node {
    const stringManager = StringManager.getInstance();
    const controlLabels = stringManager.getControlLabels();
    const presetLabels = stringManager.getPresetLabels();

    return new ParameterControlPanel({
      presetProperty: this.presetProperty,
      presets: this.presets,
      customLabelProperty: presetLabels.customStringProperty,
      presetLabelProperty: presetLabels.labelStringProperty,
      listParent: this,
      parameters: [
        {
          labelProperty: controlLabels.mass1StringProperty,
          property: this.model.mass1Property,
          range: new Range(0.1, 5.0),
          delta: 0.1,
          decimalPlaces: 1,
          unit: "kg",
          thumbFill: ClassicalMechanicsColors.mass1FillColorProperty,
        },
        {
          labelProperty: controlLabels.mass2StringProperty,
          property: this.model.mass2Property,
          range: new Range(0.1, 5.0),
          delta: 0.1,
          decimalPlaces: 1,
          unit: "kg",
          thumbFill: ClassicalMechanicsColors.mass2FillColorProperty,
        },
        {
          labelProperty: controlLabels.springConstant1StringProperty,
          property: this.model.springConstant1Property,
          range: new Range(1.0, 50.0),
          delta: 1.0,
          decimalPlaces: 0,
          unit: "N/m",
          thumbFill: ClassicalMechanicsColors.mass1FillColorProperty,
        },
        {
          labelProperty: controlLabels.springConstant2StringProperty,
          property: this.model.springConstant2Property,
          range: new Range(1.0, 50.0),
          delta: 1.0,
          decimalPlaces: 0,
          unit: "N/m",
          thumbFill: ClassicalMechanicsColors.mass2FillColorProperty,
        },
        {
          labelProperty: controlLabels.damping1StringProperty,
          property: this.model.damping1Property,
          range: new Range(0.0, 2.0),
          delta: 0.05,
          decimalPlaces: 2,
          unit: "N·s/m",
          thumbFill: ClassicalMechanicsColors.mass1FillColorProperty,
        },
        {
          labelProperty: controlLabels.damping2StringProperty,
          property: this.model.damping2Property,
          range: new Range(0.0, 2.0),
          delta: 0.05,
          decimalPlaces: 2,
          unit: "N·s/m",
          thumbFill: ClassicalMechanicsColors.mass2FillColorProperty,
        },
        {
          labelProperty: controlLabels.gravityStringProperty,
          property: this.model.gravityProperty,
          range: new Range(0.0, 20.0),
          delta: 0.1,
          decimalPlaces: 1,
          unit: "m/s²",
        },
      ],
    });
  }

  /**
   * Switch between classic and parametric spring visualization.
   */
  private switchSpringVisualization(
    springType: SpringVisualizationType,
  ): void {
    // Remove current spring nodes
    this.removeChild(this.currentSpring1Node);
    this.removeChild(this.currentSpring2Node);

    // Switch to new spring nodes
    const useParametric = springType === SpringVisualizationType.PARAMETRIC;
    this.currentSpring1Node = useParametric
      ? this.parametricSpring1Node
      : this.classicSpring1Node;
    this.currentSpring2Node = useParametric
      ? this.parametricSpring2Node
      : this.classicSpring2Node;

    // Add new spring nodes (insert before mass nodes to maintain z-order)
    const mass1Index = this.indexOfChild(this.mass1Node);
    this.insertChild(mass1Index, this.currentSpring1Node);
    this.insertChild(mass1Index, this.currentSpring2Node);

    // Update the new spring nodes to match current state
    this.updateSpring1Appearance(this.model.springConstant1Property.value);
    this.updateSpring2Appearance(this.model.springConstant2Property.value);
    this.updateVisualization();
  }

  /**
   * Create the content for the info dialog.
   */
  protected createInfoDialogContent(): Node {
    // Create formula nodes
    const equation1 = new FormulaNode("m_1 \\frac{d^2 x_1}{d t^2} = -k_1 x_1 + k_2(x_2 - x_1) - b_1\\frac{d x_1}{d t} + m_1 g", {
      maxWidth: 700,
    });
    const equation2 = new FormulaNode("m_2 \\frac{d^2 x_2}{d t^2} = -k_2(x_2 - x_1) - b_2\\frac{d x_2}{d t} + m_2 g", {
      maxWidth: 700,
    });
    const variablesList = new FormulaNode(
      "\\begin{array}{l}" +
      "\\bullet\\; m_1, m_2 = \\text{masses (kg)}\\\\" +
      "\\bullet\\; k_1, k_2 = \\text{spring constants (N/m)}\\\\" +
      "\\bullet\\; b_1, b_2 = \\text{damping coefficients (N}\\!\\cdot\\!\\text{s/m)}\\\\" +
      "\\bullet\\; x_1, x_2 = \\text{displacements from equilibrium (m)}\\\\" +
      "\\bullet\\; g = \\text{gravitational acceleration (m/s}^2\\text{)}" +
      "\\end{array}",
      {
        maxWidth: 700,
      }
    );

    // Link text color property to formula nodes
    // FormulaNode extends DOM, so we need to set the color via CSS
    ClassicalMechanicsColors.textColorProperty.link((color) => {
      equation1.element.style.color = color.toCSS();
      equation2.element.style.color = color.toCSS();
      variablesList.element.style.color = color.toCSS();
    });

    return new VBox({
      spacing: SPACING_LARGE,
      align: "left",
      children: [
        new Text("Double Spring System", {
          font: new PhetFont({size: FONT_SIZE_SCREEN_TITLE, weight: "bold"}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        new RichText(
          "This simulation models two masses connected by springs in series, demonstrating coupled oscillations and normal modes. Damping can be added to observe energy dissipation.",
          {
            font: new PhetFont({size: FONT_SIZE_SECONDARY_LABEL}),
            fill: ClassicalMechanicsColors.textColorProperty,
            maxWidth: 700,
          }
        ),
        new Text("Equations of Motion:", {
          font: new PhetFont({size: FONT_SIZE_SECONDARY_LABEL, weight: "bold"}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        new VBox({
          spacing: 12,
          align: "left",
          children: [equation1, equation2],
        }),
        new Text("Where:", {
          font: new PhetFont({size: FONT_SIZE_BODY_TEXT}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        variablesList,
      ],
    });
  }

  private updateVisualization(): void {
    // Convert model positions to view coordinates (vertical configuration)
    // Positions are displacements from natural length
    // Total distances from fixed point:
    // - Mass 1: naturalLength1 + position1
    // - Mass 2: naturalLength1 + position1 + naturalLength2 + (position2 - position1) = naturalLength1 + naturalLength2 + position2
    const naturalLength1 = this.model.naturalLength1Property.value;
    const naturalLength2 = this.model.naturalLength2Property.value;
    const position1 = this.model.position1Property.value;
    const position2 = this.model.position2Property.value;

    const mass1TotalLength = naturalLength1 + position1;
    const mass2TotalLength = naturalLength1 + position1 + naturalLength2 + (position2 - position1);

    const mass1ModelPos = new Vector2(0, mass1TotalLength);
    const mass2ModelPos = new Vector2(0, mass2TotalLength);
    const mass1ViewPos =
      this.modelViewTransform!.modelToViewPosition(mass1ModelPos);
    const mass2ViewPos =
      this.modelViewTransform!.modelToViewPosition(mass2ModelPos);

    // Update mass positions
    this.mass1Node.center = mass1ViewPos;
    this.mass2Node.center = mass2ViewPos;

    // Update center of mass reference lines (horizontal lines across each mass)
    const mass1HalfWidth = this.mass1Node.width / 2;
    this.mass1ReferenceLine.setLine(
      mass1ViewPos.x - mass1HalfWidth,
      mass1ViewPos.y,
      mass1ViewPos.x + mass1HalfWidth,
      mass1ViewPos.y
    );

    const mass2HalfWidth = this.mass2Node.width / 2;
    this.mass2ReferenceLine.setLine(
      mass2ViewPos.x - mass2HalfWidth,
      mass2ViewPos.y,
      mass2ViewPos.x + mass2HalfWidth,
      mass2ViewPos.y
    );

    // Account for mass heights which vary with mass values
    const mass1HalfHeight = this.mass1Node.height / 2;
    const mass2HalfHeight = this.mass2Node.height / 2;

    // Update spring endpoints (vertical springs)
    this.currentSpring1Node.setEndpoints(
      this.fixedPoint,
      new Vector2(mass1ViewPos.x, mass1ViewPos.y - mass1HalfHeight), // Connect to top of mass 1
    );

    this.currentSpring2Node.setEndpoints(
      new Vector2(mass1ViewPos.x, mass1ViewPos.y + mass1HalfHeight), // From bottom of mass 1
      new Vector2(mass2ViewPos.x, mass2ViewPos.y - mass2HalfHeight), // To top of mass 2
    );
  }

  /**
   * Update spring 1 appearance based on its spring constant.
   * Stiffer springs (higher k) appear with thicker lines.
   */
  private updateSpring1Appearance(springConstant: number): void {
    // Map spring constant [1, 50] to lineWidth [1, 2.5]
    const minK = 1, maxK = 50;
    const minLineWidth = 1, maxLineWidth = 2.5;
    const lineWidth = minLineWidth + (springConstant - minK) * (maxLineWidth - minLineWidth) / (maxK - minK);

    this.currentSpring1Node.setLineWidth(lineWidth);
  }

  /**
   * Update spring 2 appearance based on its spring constant.
   * Stiffer springs (higher k) appear with thicker lines.
   */
  private updateSpring2Appearance(springConstant: number): void {
    // Map spring constant [1, 50] to lineWidth [1, 2.5]
    const minK = 1, maxK = 50;
    const minLineWidth = 1, maxLineWidth = 2.5;
    const lineWidth = minLineWidth + (springConstant - minK) * (maxLineWidth - minLineWidth) / (maxK - minK);

    this.currentSpring2Node.setLineWidth(lineWidth);
  }

  /**
   * Update mass 1 block size based on mass value.
   * Larger masses appear as larger blocks.
   */
  private updateMass1Size(mass: number): void {
    // Map mass [0.1, 5.0] kg to size [25, 60] pixels
    const minMass = 0.1, maxMass = 5.0;
    const minSize = 25, maxSize = 60;
    const size = minSize + (mass - minMass) * (maxSize - minSize) / (maxMass - minMass);

    // Update rectangle dimensions (keeping it centered)
    this.mass1Node.setRect(-size / 2, -size / 2, size, size);

    // Update visualization to reconnect springs to new mass size
    this.updateVisualization();
  }

  /**
   * Update mass 2 block size based on mass value.
   * Larger masses appear as larger blocks.
   */
  private updateMass2Size(mass: number): void {
    // Map mass [0.1, 5.0] kg to size [25, 60] pixels
    const minMass = 0.1, maxMass = 5.0;
    const minSize = 25, maxSize = 60;
    const size = minSize + (mass - minMass) * (maxSize - minSize) / (maxMass - minMass);

    // Update rectangle dimensions (keeping it centered)
    this.mass2Node.setRect(-size / 2, -size / 2, size, size);

    // Update visualization to reconnect springs to new mass size
    this.updateVisualization();
  }

  public override reset(): void {
    super.reset(); // Reset base view properties (including vector visibility properties and graph)

    // Update visualization to match reset model state
    this.updateVisualization();
  }

  public override step(dt: number): void {
    super.step(dt); // Step the stopwatch, graph, and other base view components
    this.model.step(dt);

    // Update vector visualizations
    this.updateVectors();
  }

  /**
   * Update vector positions and magnitudes for both masses (vertical configuration)
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
    const g = this.model.gravityProperty.value;

    // Calculate forces on mass 1 (positive downward)
    // F1 = -k1*x1 + k2*(x2 - x1) - b1*v1 + m1*g
    const force1 = -k1 * x1 + k2 * (x2 - x1) - b1 * v1 + m1 * g;
    const acceleration1 = force1 / m1;

    // Calculate forces on mass 2 (positive downward)
    // F2 = -k2*(x2 - x1) - b2*v2 + m2*g
    const force2 = -k2 * (x2 - x1) - b2 * v2 + m2 * g;
    const acceleration2 = force2 / m2;

    // Get mass center positions in view coordinates
    const mass1Center = this.mass1Node.center;
    const mass2Center = this.mass2Node.center;

    // Update vectors for mass 1 (vertical)
    // Offset horizontally to avoid overlap: velocity left, acceleration right, force further right
    this.velocity1VectorNode.setTailPosition(mass1Center.plusXY(-15, 0));
    this.velocity1VectorNode.setVector(new Vector2(0, v1));

    this.acceleration1VectorNode.setTailPosition(mass1Center.plusXY(10, 0));
    this.acceleration1VectorNode.setVector(new Vector2(0, acceleration1));

    this.force1VectorNode.setTailPosition(mass1Center.plusXY(25, 0));
    this.force1VectorNode.setVector(new Vector2(0, force1));

    // Update vectors for mass 2 (vertical)
    // Offset horizontally to avoid overlap: velocity left, acceleration right, force further right
    this.velocity2VectorNode.setTailPosition(mass2Center.plusXY(-15, 0));
    this.velocity2VectorNode.setVector(new Vector2(0, v2));

    this.acceleration2VectorNode.setTailPosition(mass2Center.plusXY(10, 0));
    this.acceleration2VectorNode.setVector(new Vector2(0, acceleration2));

    this.force2VectorNode.setTailPosition(mass2Center.plusXY(25, 0));
    this.force2VectorNode.setVector(new Vector2(0, force2));
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

    // Clear the graph when switching presets (if it exists)
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
