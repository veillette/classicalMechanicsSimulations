/**
 * Spring described by a parametric equation. This implementation is a variation of the cycloid equation.
 * A prolate cycloid comes closest to this implementation, although it doesn't include aspect ratio and delta phase.
 *
 * The origin (0, 0) of this node is at its left center.
 * The front and back of the spring are drawn as separate paths to provide pseudo-3D visual cues.
 *
 * Adapted from PhET's ParametricSpringNode (scenery-phet) for use with scenerystack.
 *
 * @author Martin Veillette (Berea College) - Original PhET implementation
 * @author Chris Malley (PixelZoom, Inc.) - Original PhET implementation
 */

import { Node, Path, type NodeOptions } from "scenerystack/scenery";
import { Color, ReadOnlyProperty } from "scenerystack";
import { Shape } from "scenerystack/kite";
import { Vector2 } from "scenerystack/dot";
import { LinearGradient } from "scenerystack/scenery";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";

type ParametricSpringNodeOptions = NodeOptions & {
  frontColorProperty?: ReadOnlyProperty<Color>;
  middleColorProperty?: ReadOnlyProperty<Color>;
  backColorProperty?: ReadOnlyProperty<Color>;
  lineWidth?: number;
  loops?: number;
  radius?: number;
  aspectRatio?: number;
  pointsPerLoop?: number;
  phase?: number;
  deltaPhase?: number;
  xScale?: number;
  leftEndLength?: number;
  rightEndLength?: number;
};

export class ParametricSpringNode extends Node {
  private readonly frontPath: Path;
  private readonly backPath: Path;
  private loops: number;
  private radius: number;
  private aspectRatio: number;
  private pointsPerLoop: number;
  private lineWidth: number;
  private phase: number;
  private deltaPhase: number;
  private xScale: number;
  private readonly leftEndLength: number;
  private readonly rightEndLength: number;
  private readonly frontColorProperty: ReadOnlyProperty<Color>;
  private readonly middleColorProperty: ReadOnlyProperty<Color>;
  private readonly backColorProperty: ReadOnlyProperty<Color>;

  private springPoints: Vector2[] = [];
  private frontShape: Shape | null = null;
  private backShape: Shape | null = null;
  private lastStart: Vector2 | null = null;
  private lastEnd: Vector2 | null = null;

  public constructor(options?: ParametricSpringNodeOptions) {
    super();

    this.loops = options?.loops ?? 10;
    this.radius = options?.radius ?? 10;
    this.aspectRatio = options?.aspectRatio ?? 4;
    this.pointsPerLoop = options?.pointsPerLoop ?? 40;
    this.lineWidth = options?.lineWidth ?? 3;
    this.phase = options?.phase ?? Math.PI;
    this.deltaPhase = options?.deltaPhase ?? Math.PI / 2;
    this.xScale = options?.xScale ?? 2.5;
    this.leftEndLength = options?.leftEndLength ?? 15;
    this.rightEndLength = options?.rightEndLength ?? 25;

    this.frontColorProperty =
      options?.frontColorProperty ??
      ClassicalMechanicsColors.springFrontColorProperty;
    this.middleColorProperty =
      options?.middleColorProperty ??
      ClassicalMechanicsColors.springFrontColorProperty;
    this.backColorProperty =
      options?.backColorProperty ??
      ClassicalMechanicsColors.springBackColorProperty;

    // Back part of spring (goes behind)
    this.backPath = new Path(null, {
      lineWidth: this.lineWidth,
      lineCap: "round",
      lineJoin: "round",
    });

    // Front part of spring (goes in front)
    this.frontPath = new Path(null, {
      lineWidth: this.lineWidth,
      lineCap: "round",
      lineJoin: "round",
    });

    this.addChild(this.backPath);
    this.addChild(this.frontPath);

    // Initialize the spring shapes
    this.updateShapes();
    this.updateGradients();

    // Apply remaining options
    this.mutate(options);
  }

  /**
   * Update the spring shapes based on current parameters.
   */
  private updateShapes(): void {
    // Create new points and Shapes
    this.springPoints = [];
    this.frontShape = new Shape();
    this.backShape = new Shape();

    // Compute the points for the coil
    const coilPoints: Vector2[] = [];
    const numberOfCoilPoints = this.computeNumberOfCoilPoints();

    for (let index = 0; index < numberOfCoilPoints; index++) {
      const coilX = this.computeCoilX(index);
      const coilY = this.computeCoilY(index);
      coilPoints.push(new Vector2(coilX, coilY));
    }

    let wasFront = true; // was the previous point on the front path?

    // Add points to Shapes
    for (let index = 0; index < numberOfCoilPoints; index++) {
      // is the current point on the front path?
      const isFront =
        ((2 * Math.PI * index) / this.pointsPerLoop +
          this.phase +
          this.deltaPhase) %
          (2 * Math.PI) >
        Math.PI;

      // horizontal line at left end
      if (index === 0) {
        const p = new Vector2(0, coilPoints[0].y);
        this.springPoints.push(p);
        if (isFront) {
          this.frontShape.moveToPoint(p);
        } else {
          this.backShape.moveToPoint(p);
        }
      }

      // coil point
      this.springPoints.push(coilPoints[index]);
      if (isFront) {
        // we're in the front
        if (!wasFront && index !== 0) {
          // ... and we've just moved to the front
          this.frontShape.moveToPoint(coilPoints[index - 1]);
        }
        this.frontShape.lineToPoint(coilPoints[index]);
      } else {
        // we're in the back
        if (wasFront && index !== 0) {
          // ... and we've just moved to the back
          this.backShape.moveToPoint(coilPoints[index - 1]);
        }
        this.backShape.lineToPoint(coilPoints[index]);
      }

      wasFront = isFront;
    }

    // horizontal line at right end
    const lastCoilPoint = coilPoints[numberOfCoilPoints - 1];
    const p = new Vector2(
      lastCoilPoint.x + this.rightEndLength,
      lastCoilPoint.y,
    );
    this.springPoints.push(p);
    if (wasFront) {
      this.frontShape.lineToPoint(p);
    } else {
      this.backShape.lineToPoint(p);
    }

    this.frontPath.shape = this.frontShape;
    this.backPath.shape = this.backShape;
  }

  /**
   * Update the gradient strokes based on current radius and aspect ratio.
   */
  private updateGradients(): void {
    const yRadius = this.radius * this.aspectRatio;

    const frontColor = this.frontColorProperty.value;
    const middleColor = this.middleColorProperty.value;
    const backColor = this.backColorProperty.value;

    this.frontPath.stroke = new LinearGradient(0, -yRadius, 0, yRadius)
      .addColorStop(0, middleColor)
      .addColorStop(0.35, frontColor)
      .addColorStop(0.65, frontColor)
      .addColorStop(1, middleColor);

    this.backPath.stroke = new LinearGradient(0, -yRadius, 0, yRadius)
      .addColorStop(0, middleColor)
      .addColorStop(0.5, backColor)
      .addColorStop(1, middleColor);
  }

  /**
   * Gets the number of points in the coil part of the spring.
   */
  private computeNumberOfCoilPoints(): number {
    return this.loops * this.pointsPerLoop + 1;
  }

  /**
   * Computes the x coordinate for a point on the coil.
   */
  private computeCoilX(index: number): number {
    return (
      this.leftEndLength +
      this.radius +
      this.radius *
        Math.cos(
          (2 * Math.PI * index) / this.pointsPerLoop + this.phase,
        ) +
      this.xScale * (index / this.pointsPerLoop) * this.radius
    );
  }

  /**
   * Computes the y coordinate for a point on the coil.
   */
  private computeCoilY(index: number): number {
    return (
      this.aspectRatio *
      this.radius *
      Math.cos(
        (2 * Math.PI * index) / this.pointsPerLoop +
          this.deltaPhase +
          this.phase,
      )
    );
  }

  /**
   * Update the spring to stretch between two points.
   * @param start - Starting point of the spring
   * @param end - Ending point of the spring
   */
  public setEndpoints(start: Vector2, end: Vector2): void {
    this.lastStart = start;
    this.lastEnd = end;

    const delta = end.minus(start);
    const length = delta.magnitude;
    const angle = delta.angle;

    // Calculate the natural length of the spring (without stretching)
    const naturalLength =
      this.leftEndLength +
      this.rightEndLength +
      2 * this.radius +
      this.xScale * this.loops * this.radius;

    // Adjust xScale to match the desired length
    if (naturalLength > 0) {
      const adjustedXScale = Math.max(
        0.1,
        (length -
          this.leftEndLength -
          this.rightEndLength -
          2 * this.radius) /
          (this.loops * this.radius),
      );
      this.xScale = adjustedXScale;
    }

    // Update the shapes with new xScale
    this.updateShapes();
    this.updateGradients();

    // Position and rotate the spring
    this.translation = start;
    this.rotation = angle;
  }

  /**
   * Update the spring between two points (convenience method).
   */
  public setEndpointsXY(x1: number, y1: number, x2: number, y2: number): void {
    this.setEndpoints(new Vector2(x1, y1), new Vector2(x2, y2));
  }

  /**
   * Update the line width of the spring (makes it thicker or thinner).
   */
  public setLineWidth(lineWidth: number): void {
    this.lineWidth = lineWidth;
    this.frontPath.lineWidth = lineWidth;
    this.backPath.lineWidth = lineWidth;
  }

  /**
   * Update the radius of the spring coils (makes them wider or narrower).
   */
  public setRadius(radius: number): void {
    this.radius = radius;
    this.updateShapes();
    this.updateGradients();

    // Re-render the spring with the new radius
    if (this.lastStart && this.lastEnd) {
      this.setEndpoints(this.lastStart, this.lastEnd);
    }
  }
}
