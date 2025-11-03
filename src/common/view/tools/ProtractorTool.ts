/**
 * Protractor tool for measuring angles in the simulation.
 * Particularly useful for pendulum systems.
 */

import { Node, Circle, Path, Text, DragListener } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";
import { Vector2 } from "scenerystack/dot";
import { BooleanProperty } from "scenerystack/axon";
import ClassicalMechanicsColors from "../../../ClassicalMechanicsColors.js";

export class ProtractorTool extends Node {
  private readonly centerNode: Circle;
  private readonly arm1Node: Path;
  private readonly arm2Node: Path;
  private readonly arcNode: Path;
  private readonly labelNode: Text;
  private center: Vector2;
  private arm1End: Vector2;
  private arm2End: Vector2;
  private readonly armLength: number = 80;

  public constructor(visibleProperty: BooleanProperty) {
    super();

    this.center = new Vector2(300, 300);
    this.arm1End = new Vector2(300, 220); // Initial vertical
    this.arm2End = new Vector2(380, 300); // Initial horizontal

    // Center point (draggable to move entire protractor)
    this.centerNode = new Circle(6, {
      fill: "rgba(255, 150, 0, 0.8)",
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 2,
      cursor: "move",
    });
    this.addChild(this.centerNode);

    // Arm 1 (draggable endpoint)
    const arm1Handle = new Circle(6, {
      fill: "rgba(255, 150, 0, 0.6)",
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 2,
      cursor: "pointer",
    });

    this.arm1Node = new Path(null, {
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 3,
      children: [arm1Handle],
    });
    this.addChild(this.arm1Node);

    // Arm 2 (draggable endpoint)
    const arm2Handle = new Circle(6, {
      fill: "rgba(255, 150, 0, 0.6)",
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 2,
      cursor: "pointer",
    });

    this.arm2Node = new Path(null, {
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 3,
      children: [arm2Handle],
    });
    this.addChild(this.arm2Node);

    // Arc showing angle
    this.arcNode = new Path(null, {
      stroke: "rgba(255, 150, 0, 0.8)",
      lineWidth: 2,
    });
    this.addChild(this.arcNode);

    // Label showing angle
    this.labelNode = new Text("", {
      fontSize: 16,
      fontWeight: "bold",
      fill: ClassicalMechanicsColors.textColorProperty,
    });
    this.addChild(this.labelNode);

    // Setup drag listeners
    this.setupDragListeners(arm1Handle, arm2Handle);

    // Link visibility
    visibleProperty.link((visible) => {
      this.visible = visible;
    });

    // Initial visualization
    this.updateVisualization();
  }

  /**
   * Setup drag listeners for center and arm handles
   */
  private setupDragListeners(arm1Handle: Circle, arm2Handle: Circle): void {
    // Center drag - moves entire protractor
    this.centerNode.addInputListener(
      new DragListener({
        drag: (event) => {
          const localPoint = this.globalToLocalPoint(event.pointer.point);
          const delta = localPoint.minus(this.center);
          this.center = localPoint;
          this.arm1End = this.arm1End.plus(delta);
          this.arm2End = this.arm2End.plus(delta);
          this.updateVisualization();
        },
      })
    );

    // Arm 1 drag - rotates arm around center
    arm1Handle.addInputListener(
      new DragListener({
        drag: (event) => {
          const localPoint = this.globalToLocalPoint(event.pointer.point);
          const direction = localPoint.minus(this.center).normalized();
          this.arm1End = this.center.plus(direction.times(this.armLength));
          this.updateVisualization();
        },
      })
    );

    // Arm 2 drag - rotates arm around center
    arm2Handle.addInputListener(
      new DragListener({
        drag: (event) => {
          const localPoint = this.globalToLocalPoint(event.pointer.point);
          const direction = localPoint.minus(this.center).normalized();
          this.arm2End = this.center.plus(direction.times(this.armLength));
          this.updateVisualization();
        },
      })
    );
  }

  /**
   * Update the visualization based on current configuration
   */
  private updateVisualization(): void {
    // Update center
    this.centerNode.center = this.center;

    // Update arm 1
    const arm1Shape = new Shape()
      .moveToPoint(this.center)
      .lineToPoint(this.arm1End);
    this.arm1Node.shape = arm1Shape;
    this.arm1Node.children[0].center = this.arm1End;

    // Update arm 2
    const arm2Shape = new Shape()
      .moveToPoint(this.center)
      .lineToPoint(this.arm2End);
    this.arm2Node.shape = arm2Shape;
    this.arm2Node.children[0].center = this.arm2End;

    // Calculate angle
    const vector1 = this.arm1End.minus(this.center);
    const vector2 = this.arm2End.minus(this.center);
    const angle1 = Math.atan2(vector1.y, vector1.x);
    const angle2 = Math.atan2(vector2.y, vector2.x);
    let angleDiff = angle2 - angle1;

    // Normalize to 0-2π
    while (angleDiff < 0) angleDiff += 2 * Math.PI;
    while (angleDiff > 2 * Math.PI) angleDiff -= 2 * Math.PI;

    // Convert to degrees
    const angleDegrees = (angleDiff * 180) / Math.PI;

    // Draw arc
    const arcRadius = this.armLength * 0.4;
    const arcShape = new Shape().arc(
      this.center.x,
      this.center.y,
      arcRadius,
      angle1,
      angle2,
      false
    );
    this.arcNode.shape = arcShape;

    // Update label
    this.labelNode.string = `${angleDegrees.toFixed(1)}°`;

    // Position label near arc midpoint
    const midAngle = (angle1 + angle2) / 2;
    const labelPosition = this.center.plus(
      new Vector2(Math.cos(midAngle), Math.sin(midAngle)).times(arcRadius + 20)
    );
    this.labelNode.center = labelPosition;
  }
}
