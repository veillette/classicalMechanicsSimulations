/**
 * View for the Double Spring screen.
 * Displays two masses connected by springs.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { DoubleSpringModel } from "../model/DoubleSpringModel.js";
import { Rectangle, Line, VBox, Node } from "scenerystack/scenery";
import { Panel } from "scenerystack/sun";
import { NumberControl } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { SpringNode } from "../../common/view/SpringNode.js";
import { DragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";

export class DoubleSpringScreenView extends BaseScreenView<DoubleSpringModel> {
  private readonly mass1Node: Rectangle;
  private readonly mass2Node: Rectangle;
  private readonly spring1Node: SpringNode;
  private readonly spring2Node: SpringNode;
  private readonly fixedPoint: Vector2;
  private readonly modelViewTransform: ModelViewTransform2;

  public constructor(model: DoubleSpringModel, options?: ScreenViewOptions) {
    super(model, options);

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

    // Control panel
    const controlPanel = this.createControlPanel();
    this.addChild(controlPanel);

    // Setup common controls (time controls, reset button, keyboard shortcuts)
    this.setupCommonControls();

    // Initial visualization
    this.updateVisualization();
  }

  private createControlPanel(): Node {
    const stringManager = StringManager.getInstance();
    const controlLabels = stringManager.getControlLabels();

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

    const panel = new Panel(
      new VBox({
        spacing: 12,
        align: "left",
        children: [mass1Control, mass2Control, spring1Control, spring2Control],
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
  }
}
