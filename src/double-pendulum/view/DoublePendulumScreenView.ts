/**
 * View for the Double Pendulum screen.
 * Displays two connected pendulums that exhibit chaotic motion.
 */

import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { DoublePendulumModel } from "../model/DoublePendulumModel.js";
import { Circle, Line, VBox, Node, Path } from "scenerystack/scenery";
import { Panel } from "scenerystack/sun";
import { NumberControl, ResetAllButton } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";

export class DoublePendulumScreenView extends ScreenView {
  private readonly model: DoublePendulumModel;
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

  public constructor(model: DoublePendulumModel, options?: ScreenViewOptions) {
    super(options);

    this.model = model;

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
      stroke: "rgba(230, 126, 34, 0.3)",
      lineWidth: 2,
    });
    this.addChild(this.trailPath);

    // Pivot
    this.pivotNode = new Circle(8, {
      fill: "#333",
      stroke: "#000",
      lineWidth: 2,
    });
    this.pivotNode.center = this.pivotPoint;
    this.addChild(this.pivotNode);

    // Rod 1
    this.rod1Node = new Line(0, 0, 0, 0, {
      stroke: "#E74C3C",
      lineWidth: 4,
      lineCap: "round",
    });
    this.addChild(this.rod1Node);

    // Rod 2
    this.rod2Node = new Line(0, 0, 0, 0, {
      stroke: "#3498DB",
      lineWidth: 4,
      lineCap: "round",
    });
    this.addChild(this.rod2Node);

    // Bob 1
    this.bob1Node = new Circle(15, {
      fill: "#E74C3C",
      stroke: "#C0392B",
      lineWidth: 2,
      cursor: "pointer",
    });
    this.addChild(this.bob1Node);

    // Bob 2
    this.bob2Node = new Circle(15, {
      fill: "#3498DB",
      stroke: "#2C3E50",
      lineWidth: 2,
      cursor: "pointer",
    });
    this.addChild(this.bob2Node);

    // Drag listener for bob 1
    this.bob1Node.addInputListener(
      new DragListener({
        translateNode: false,
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const delta = parentPoint.minus(this.pivotPoint);
          const angle = Math.atan2(delta.x, delta.y);
          this.model.angle1Property.value = angle;
          this.model.angularVelocity1Property.value = 0;
          this.clearTrail();
        },
      }),
    );

    // Drag listener for bob 2
    this.bob2Node.addInputListener(
      new DragListener({
        translateNode: false,
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

    // Reset button
    const resetButton = new ResetAllButton({
      listener: () => {
        this.model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
    });
    this.addChild(resetButton);

    // Initial visualization
    this.updateVisualization();
  }

  private createControlPanel(): Node {
    const stringManager = StringManager.getInstance();
    const controlLabels = stringManager.getControlLabels();

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
      },
    );

    const panel = new Panel(
      new VBox({
        spacing: 12,
        align: "left",
        children: [
          length1Control,
          length2Control,
          mass1Control,
          mass2Control,
          gravityControl,
        ],
      }),
      {
        xMargin: 10,
        yMargin: 10,
        fill: "rgba(255, 255, 255, 0.8)",
        stroke: "#ccc",
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
    this.clearTrail();
  }

  public override step(dt: number): void {
    this.model.step(dt);
    // Update visualization after physics step completes
    // This ensures all state variables are updated consistently before drawing
    this.updateVisualization();
  }
}
