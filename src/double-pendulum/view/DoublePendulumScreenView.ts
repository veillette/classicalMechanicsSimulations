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
  Node,
  Text,
  Path,
  KeyboardListener,
  RichText,
} from "scenerystack/scenery";
import { PhetFont, FormulaNode } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { BooleanProperty, Property } from "scenerystack/axon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import type { PlottableProperty } from "../../common/view/graph/PlottableProperty.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";
import SimulationAnnouncer from "../../common/util/SimulationAnnouncer.js";
import { DoublePendulumPresets } from "../model/DoublePendulumPresets.js";
import { Preset } from "../../common/model/Preset.js";
import { VectorNode } from "../../common/view/VectorNode.js";
import { PendulumLabProtractorNode } from "../../common/view/PendulumLabProtractorNode.js";
import { VectorNodeFactory } from "../../common/view/VectorNodeFactory.js";
import { ParameterControlPanel } from "../../common/view/ParameterControlPanel.js";
import { type PresetOption } from "../../common/view/PresetSelectorFactory.js";
import {
  FONT_SIZE_BODY_TEXT,
  FONT_SIZE_SECONDARY_LABEL,
  FONT_SIZE_SCREEN_TITLE,
} from "../../common/view/FontSizeConstants.js";
import {
  SPACING_LARGE,
} from "../../common/view/UILayoutConstants.js";

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
  private readonly trailPoints: Vector2[] = [];
  private readonly maxTrailPoints: number = 500;
  private readonly trailVisibleProperty: BooleanProperty;
  protected readonly presetProperty: Property<PresetOption>;
  protected readonly presets: Preset[];
  protected isApplyingPreset: boolean = false;

  // Dragging state for protractor
  private readonly isDraggingProperty: BooleanProperty;

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

    // Get accessibility strings for announcements
    const a11yStrings = this.getA11yStrings();

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
        angleProperty: this.model.angle1Property,
        isDraggingProperty: this.isDraggingProperty,
        color: ClassicalMechanicsColors.mass1FillColorProperty.value.toCSS(),
        lengthProperty: this.model.length1Property,
      },
      this.modelViewTransform
    );
    this.protractorNode = pendulumLabProtractor;
    this.addChild(pendulumLabProtractor);

    // Link visibility
    this.showProtractorProperty.link((visible: boolean) => {
      pendulumLabProtractor.visible = visible;
    });

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
    this.bob1Node.addInputListener(
      new DragListener({
        translateNode: false,
        start: () => {
          this.isDraggingProperty.value = true;
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
          this.isDraggingProperty.value = false;
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
          this.isDraggingProperty.value = true;
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
            this.modelViewTransform!.modelToViewPosition(bob1ModelPos);

          // Calculate angle for bob 2 relative to bob 1
          const delta = parentPoint.minus(bob1ViewPos);
          const angle = Math.atan2(delta.x, delta.y);
          this.model.angle2Property.value = angle;
          this.model.angularVelocity2Property.value = 0;
          this.clearTrail();
        },
        end: () => {
          this.isDraggingProperty.value = false;
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

    // Setup the configurable graph (angle1 vs time by default)
    this.setupConfigurableGraph(availableProperties, 0);
    this.addChild(this.configurableGraph!);

    // Position control panel at the top right
    controlPanel.right = this.layoutBounds.maxX - 10;
    controlPanel.top = this.layoutBounds.minY + 10;

    // Setup vector and tools panels using base class method (includes protractor for pendulum)
    this.setupVectorAndToolsPanels(true);

    // Position graph beneath vector panel
    this.positionConfigurableGraph(this.vectorPanel!);

    // Setup common controls (time controls, reset button, info button, keyboard shortcuts)
    this.setupCommonControls();

    // Manage z-order using base class method
    // Note: trail path needs to be behind everything
    this.trailPath.moveToBack();
    this.manageZOrder(
      [
        this.pivotNode,
        this.rod1Node,
        this.rod2Node,
        this.bob1Node,
        this.bob1ReferenceDot,
        this.bob2Node,
        this.bob2ReferenceDot,
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

    return new ParameterControlPanel({
      presetProperty: this.presetProperty,
      presets: this.presets,
      customLabelProperty: presetLabels.customStringProperty,
      presetLabelProperty: presetLabels.labelStringProperty,
      listParent: this,
      parameters: [
        {
          labelProperty: controlLabels.length1StringProperty,
          property: this.model.length1Property,
          range: new Range(0.5, 3.0),
          delta: 0.1,
          decimalPlaces: 1,
          unit: "m",
          thumbFill: ClassicalMechanicsColors.mass1FillColorProperty,
        },
        {
          labelProperty: controlLabels.length2StringProperty,
          property: this.model.length2Property,
          range: new Range(0.5, 3.0),
          delta: 0.1,
          decimalPlaces: 1,
          unit: "m",
          thumbFill: ClassicalMechanicsColors.mass2FillColorProperty,
        },
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
          labelProperty: controlLabels.gravityStringProperty,
          property: this.model.gravityProperty,
          range: new Range(0.0, 20.0),
          delta: 0.5,
          decimalPlaces: 1,
          unit: "m/s²",
        },
        {
          labelProperty: controlLabels.dampingStringProperty,
          property: this.model.dampingProperty,
          range: new Range(0.0, 2.0),
          delta: 0.05,
          decimalPlaces: 2,
          unit: "N·m·s",
        },
      ],
    });
  }

  /**
   * Create the content for the info dialog.
   */
  protected createInfoDialogContent(): Node {
    // Create formula nodes
    const equation1 = new FormulaNode(
      "(m_1 + m_2)l_1^2 \\ddot{\\theta}_1 + m_2 l_1 l_2 \\ddot{\\theta}_2 \\cos(\\theta_1-\\theta_2) + m_2 l_1 l_2 \\dot{\\theta}_2^2 \\sin(\\theta_1-\\theta_2) + (m_1 + m_2)gl_1 \\sin(\\theta_1) - b\\dot{\\theta}_1 = 0",
      {
        maxWidth: 750,
        scale: 1.0,
      }
    );
    const equation2 = new FormulaNode(
      "m_2 l_2^2 \\ddot{\\theta}_2 + m_2 l_1 l_2 \\ddot{\\theta}_1 \\cos(\\theta_1-\\theta_2) - m_2 l_1 l_2 \\dot{\\theta}_1^2 \\sin(\\theta_1-\\theta_2) + m_2 g l_2 \\sin(\\theta_2) - b\\dot{\\theta}_2 = 0",
      {
        maxWidth: 750,
        scale: 1.0,
      }
    );
    const variablesList = new FormulaNode(
      "\\begin{array}{l}" +
      "\\bullet\\; m_1, m_2 = \\text{masses (kg)}\\\\" +
      "\\bullet\\; l_1, l_2 = \\text{lengths (m)}\\\\" +
      "\\bullet\\; g = \\text{gravitational acceleration (m/s}^2\\text{)}\\\\" +
      "\\bullet\\; \\theta_1, \\theta_2 = \\text{angles from vertical (rad)}\\\\" +
      "\\bullet\\; b = \\text{damping coefficient (N}\\cdot\\text{m}\\cdot\\text{s)}" +
      "\\end{array}",
      {
        maxWidth: 750,
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
        new Text("Double Pendulum", {
          font: new PhetFont({size: FONT_SIZE_SCREEN_TITLE, weight: "bold"}),
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        new RichText(
          "This simulation models a double pendulum system, which exhibits rich dynamics including periodic motion and deterministic chaos depending on initial conditions and energy.",
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
      this.modelViewTransform!.modelToViewPosition(bob1ModelPos);

    // Calculate bob 2 position in model coordinates (relative to bob 1)
    const bob2ModelX = bob1ModelX + length2 * Math.sin(angle2);
    const bob2ModelY = bob1ModelY + length2 * Math.cos(angle2);
    const bob2ModelPos = new Vector2(bob2ModelX, bob2ModelY);

    // Convert bob 2 to view coordinates
    const bob2ViewPos =
      this.modelViewTransform!.modelToViewPosition(bob2ModelPos);

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
    super.reset(); // Reset base view properties (including vector visibility properties and graph)

    // Reset trail visibility
    this.trailVisibleProperty.reset();

    // Clear trail
    this.clearTrail();

    // Update visualization to match reset model state
    this.updateVisualization();
  }

  public override step(dt: number): void {
    super.step(dt); // Step the stopwatch, graph, and other base view components
    this.model.step(dt);
    // Update visualization after physics step completes
    // This ensures all state variables are updated consistently before drawing
    this.updateVisualization();

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
