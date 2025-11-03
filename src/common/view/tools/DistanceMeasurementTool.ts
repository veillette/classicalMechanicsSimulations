/**
 * Tool for measuring distances in the simulation.
 * Users can click two points and see the distance between them.
 */

import { Node, Circle, Line, Text, DragListener } from "scenerystack/scenery";
import { Vector2 } from "scenerystack/dot";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { BooleanProperty } from "scenerystack/axon";
import ClassicalMechanicsColors from "../../../ClassicalMechanicsColors.js";

export class DistanceMeasurementTool extends Node {
  private readonly startPointNode: Circle;
  private readonly endPointNode: Circle;
  private readonly lineNode: Line;
  private readonly labelNode: Text;
  private readonly modelViewTransform: ModelViewTransform2;
  private startPoint: Vector2 | null = null;
  private endPoint: Vector2 | null = null;

  public constructor(
    modelViewTransform: ModelViewTransform2,
    visibleProperty: BooleanProperty
  ) {
    super();
    this.modelViewTransform = modelViewTransform;

    // Start point (draggable)
    this.startPointNode = new Circle(8, {
      fill: "rgba(0, 150, 255, 0.7)",
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 2,
      cursor: "pointer",
      visible: false,
    });
    this.addChild(this.startPointNode);

    // End point (draggable)
    this.endPointNode = new Circle(8, {
      fill: "rgba(0, 150, 255, 0.7)",
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 2,
      cursor: "pointer",
      visible: false,
    });
    this.addChild(this.endPointNode);

    // Line connecting the points
    this.lineNode = new Line(0, 0, 0, 0, {
      stroke: ClassicalMechanicsColors.textColorProperty,
      lineWidth: 2,
      lineDash: [5, 5],
      visible: false,
    });
    this.addChild(this.lineNode);

    // Label showing distance
    this.labelNode = new Text("", {
      fontSize: 14,
      fontWeight: "bold",
      fill: ClassicalMechanicsColors.textColorProperty,
      visible: false,
    });
    this.addChild(this.labelNode);

    // Setup drag listeners
    this.setupDragListeners();

    // Link visibility
    visibleProperty.link((visible) => {
      this.visible = visible;
      if (!visible) {
        this.reset();
      }
    });

    // Initialize with default points
    this.setPoints(new Vector2(100, 100), new Vector2(200, 200));
  }

  /**
   * Setup drag listeners for both points
   */
  private setupDragListeners(): void {
    // Start point drag listener
    this.startPointNode.addInputListener(
      new DragListener({
        drag: (event) => {
          const localPoint = this.globalToLocalPoint(event.pointer.point);
          this.setStartPoint(localPoint);
        },
      })
    );

    // End point drag listener
    this.endPointNode.addInputListener(
      new DragListener({
        drag: (event) => {
          const localPoint = this.globalToLocalPoint(event.pointer.point);
          this.setEndPoint(localPoint);
        },
      })
    );
  }

  /**
   * Set the start point
   */
  public setStartPoint(point: Vector2): void {
    this.startPoint = point;
    this.updateVisualization();
  }

  /**
   * Set the end point
   */
  public setEndPoint(point: Vector2): void {
    this.endPoint = point;
    this.updateVisualization();
  }

  /**
   * Set both points at once
   */
  public setPoints(start: Vector2, end: Vector2): void {
    this.startPoint = start;
    this.endPoint = end;
    this.updateVisualization();
  }

  /**
   * Update the visualization based on current points
   */
  private updateVisualization(): void {
    if (!this.startPoint || !this.endPoint) {
      return;
    }

    // Update point positions
    this.startPointNode.center = this.startPoint;
    this.endPointNode.center = this.endPoint;
    this.startPointNode.visible = true;
    this.endPointNode.visible = true;

    // Update line
    this.lineNode.setLine(
      this.startPoint.x,
      this.startPoint.y,
      this.endPoint.x,
      this.endPoint.y
    );
    this.lineNode.visible = true;

    // Calculate distance in model coordinates
    const startModel = this.modelViewTransform.viewToModelPosition(this.startPoint);
    const endModel = this.modelViewTransform.viewToModelPosition(this.endPoint);
    const distance = startModel.distance(endModel);

    // Update label
    this.labelNode.string = `${distance.toFixed(2)} m`;

    // Position label at midpoint, slightly offset
    const midpoint = this.startPoint.average(this.endPoint);
    this.labelNode.center = midpoint.plusXY(0, -20);
    this.labelNode.visible = true;
  }

  /**
   * Reset the tool
   */
  public reset(): void {
    this.startPoint = null;
    this.endPoint = null;
    this.startPointNode.visible = false;
    this.endPointNode.visible = false;
    this.lineNode.visible = false;
    this.labelNode.visible = false;
  }
}
