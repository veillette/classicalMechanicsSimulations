/**
 * View for the Double Spring screen.
 * Displays two masses connected by springs.
 */

import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { DoubleSpringModel } from "../model/DoubleSpringModel.js";
import { Rectangle, Line, VBox, Node } from "scenerystack/scenery";
import { Panel } from "scenerystack/sun";
import { NumberControl, ResetAllButton } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { SpringNode } from "../../common/view/SpringNode.js";
import { DragListener } from "scenerystack/scenery";

export class DoubleSpringScreenView extends ScreenView {
  private readonly model: DoubleSpringModel;
  private readonly mass1Node: Rectangle;
  private readonly mass2Node: Rectangle;
  private readonly spring1Node: SpringNode;
  private readonly spring2Node: SpringNode;
  private readonly fixedPoint: Vector2;
  private readonly scale: number = 50; // pixels per meter

  public constructor(model: DoubleSpringModel, options?: ScreenViewOptions) {
    super(options);

    this.model = model;

    // Fixed point for spring attachment
    this.fixedPoint = new Vector2(100, this.layoutBounds.centerY);

    // Wall
    const wall = new Line(
      this.fixedPoint.x - 20,
      this.layoutBounds.minY,
      this.fixedPoint.x - 20,
      this.layoutBounds.maxY,
      {
        stroke: "#666",
        lineWidth: 4
      }
    );
    this.addChild(wall);

    // Spring 1 (wall to mass 1)
    this.spring1Node = new SpringNode({
      loops: 10,
      radius: 12,
      frontColor: "#E74C3C",
      backColor: "#C0392B",
      lineWidth: 3
    });
    this.addChild(this.spring1Node);

    // Spring 2 (mass 1 to mass 2)
    this.spring2Node = new SpringNode({
      loops: 10,
      radius: 12,
      frontColor: "#3498DB",
      backColor: "#2C3E50",
      lineWidth: 3
    });
    this.addChild(this.spring2Node);

    // Mass 1
    this.mass1Node = new Rectangle(-20, -20, 40, 40, {
      fill: "#E74C3C",
      stroke: "#C0392B",
      lineWidth: 2,
      cornerRadius: 3,
      cursor: "pointer"
    });
    this.addChild(this.mass1Node);

    // Mass 2
    this.mass2Node = new Rectangle(-20, -20, 40, 40, {
      fill: "#3498DB",
      stroke: "#2C3E50",
      lineWidth: 2,
      cornerRadius: 3,
      cursor: "pointer"
    });
    this.addChild(this.mass2Node);

    // Drag listeners
    this.mass1Node.addInputListener(
      new DragListener({
        translateNode: false,
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const newPosition = (parentPoint.x - this.fixedPoint.x) / this.scale;
          this.model.position1Property.value = newPosition;
          this.model.velocity1Property.value = 0;
        }
      })
    );

    this.mass2Node.addInputListener(
      new DragListener({
        translateNode: false,
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const newPosition = (parentPoint.x - this.fixedPoint.x) / this.scale;
          this.model.position2Property.value = newPosition;
          this.model.velocity2Property.value = 0;
        }
      })
    );

    // Link model to view
    this.model.position1Property.link(() => this.updateVisualization());
    this.model.position2Property.link(() => this.updateVisualization());

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
    const mass1Control = new NumberControl("Mass 1:", this.model.mass1Property,
      new Range(0.1, 5.0), {
        delta: 0.1,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} kg"
        }
      });

    const mass2Control = new NumberControl("Mass 2:", this.model.mass2Property,
      new Range(0.1, 5.0), {
        delta: 0.1,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} kg"
        }
      });

    const spring1Control = new NumberControl("Spring 1:", this.model.springConstant1Property,
      new Range(1.0, 50.0), {
        delta: 1.0,
        numberDisplayOptions: {
          decimalPlaces: 0,
          valuePattern: "{0} N/m"
        }
      });

    const spring2Control = new NumberControl("Spring 2:", this.model.springConstant2Property,
      new Range(1.0, 50.0), {
        delta: 1.0,
        numberDisplayOptions: {
          decimalPlaces: 0,
          valuePattern: "{0} N/m"
        }
      });

    const panel = new Panel(
      new VBox({
        spacing: 12,
        align: "left",
        children: [mass1Control, mass2Control, spring1Control, spring2Control]
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
    const mass1X = this.fixedPoint.x + this.model.position1Property.value * this.scale;
    const mass2X = this.fixedPoint.x + this.model.position2Property.value * this.scale;
    const y = this.fixedPoint.y;

    // Update mass positions
    this.mass1Node.center = new Vector2(mass1X, y);
    this.mass2Node.center = new Vector2(mass2X, y);

    // Update spring endpoints
    this.spring1Node.setEndpoints(
      this.fixedPoint,
      new Vector2(mass1X - 20, y)
    );

    this.spring2Node.setEndpoints(
      new Vector2(mass1X + 20, y),
      new Vector2(mass2X - 20, y)
    );
  }

  public reset(): void {
    // Reset view-specific state
  }

  public override step(dt: number): void {
    this.model.step(dt);
  }
}
