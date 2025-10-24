/**
 * View for the Pendulum screen.
 * Displays a pendulum that can be dragged and swings.
 */

import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { PendulumModel } from "../model/PendulumModel.js";
import { Circle, Line, VBox, Node } from "scenerystack/scenery";
import { Panel } from "scenerystack/sun";
import { NumberControl, ResetAllButton } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";

export class PendulumScreenView extends ScreenView {
  private readonly model: PendulumModel;
  private readonly bobNode: Circle;
  private readonly rodNode: Line;
  private readonly pivotNode: Circle;
  private readonly pivotPoint: Vector2;
  private readonly scale: number = 100; // pixels per meter

  public constructor(model: PendulumModel, options?: ScreenViewOptions) {
    super(options);

    this.model = model;

    // Pivot point (top center of screen)
    this.pivotPoint = new Vector2(
      this.layoutBounds.centerX,
      this.layoutBounds.minY + 100
    );

    // Pivot
    this.pivotNode = new Circle(8, {
      fill: "#333",
      stroke: "#000",
      lineWidth: 2
    });
    this.pivotNode.center = this.pivotPoint;
    this.addChild(this.pivotNode);

    // Rod
    this.rodNode = new Line(0, 0, 0, 0, {
      stroke: "#666",
      lineWidth: 4,
      lineCap: "round"
    });
    this.addChild(this.rodNode);

    // Bob
    this.bobNode = new Circle(20, {
      fill: "#E67E22",
      stroke: "#D35400",
      lineWidth: 2,
      cursor: "pointer"
    });
    this.addChild(this.bobNode);

    // Drag listener for bob
    this.bobNode.addInputListener(
      new DragListener({
        translateNode: false,
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const delta = parentPoint.minus(this.pivotPoint);
          const angle = Math.atan2(delta.x, delta.y); // angle from vertical
          this.model.angleProperty.value = angle;
          this.model.angularVelocityProperty.value = 0;
        }
      })
    );

    // Link model to view
    this.model.angleProperty.link(this.updateVisualization.bind(this));
    this.model.lengthProperty.link(this.updateVisualization.bind(this));

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
      bottom: this.layoutBounds.maxY - 10
    });
    this.addChild(resetButton);

    // Initial visualization
    this.updateVisualization();
  }

  private createControlPanel(): Node {
    const stringManager = StringManager.getInstance();
    const controlLabels = stringManager.getControlLabels();

    const lengthControl = new NumberControl(controlLabels.lengthStringProperty, this.model.lengthProperty,
      new Range(0.5, 3.0), {
        delta: 0.1,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} m"
        }
      });

    const massControl = new NumberControl(controlLabels.massStringProperty, this.model.massProperty,
      new Range(0.1, 5.0), {
        delta: 0.1,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} kg"
        }
      });

    const gravityControl = new NumberControl(controlLabels.gravityStringProperty, this.model.gravityProperty,
      new Range(0.0, 20.0), {
        delta: 0.5,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} m/s²"
        }
      });

    const dampingControl = new NumberControl(controlLabels.dampingStringProperty, this.model.dampingProperty,
      new Range(0.0, 2.0), {
        delta: 0.05,
        numberDisplayOptions: {
          decimalPlaces: 2,
          valuePattern: "{0} N·m·s"
        }
      });

    const panel = new Panel(
      new VBox({
        spacing: 15,
        align: "left",
        children: [lengthControl, massControl, gravityControl, dampingControl]
      }),
      {
        xMargin: 10,
        yMargin: 10,
        fill: "rgba(255, 255, 255, 0.8)",
        stroke: "#ccc",
        lineWidth: 1,
        cornerRadius: 5,
        right: this.layoutBounds.maxX - 10,
        top: this.layoutBounds.minY + 10
      }
    );

    return panel;
  }

  private updateVisualization(): void {
    const angle = this.model.angleProperty.value;
    const length = this.model.lengthProperty.value * this.scale;

    // Calculate bob position (angle is from vertical)
    const bobX = this.pivotPoint.x + length * Math.sin(angle);
    const bobY = this.pivotPoint.y + length * Math.cos(angle);

    // Update bob position
    this.bobNode.center = new Vector2(bobX, bobY);

    // Update rod
    this.rodNode.setLine(
      this.pivotPoint.x,
      this.pivotPoint.y,
      bobX,
      bobY
    );
  }

  public reset(): void {
    // Reset view-specific state
  }

  public override step(dt: number): void {
    this.model.step(dt);
  }
}
