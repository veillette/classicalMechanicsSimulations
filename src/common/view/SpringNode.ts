/**
 * Visual representation of a spring that can compress and extend.
 * Draws a realistic coil pattern that adjusts to the spring's current length.
 *
 * This implementation provides a simplified spring visualization with parameters
 * that align with ParametricSpringNode, making the two implementations easily swappable.
 */

import { Node, Path, type NodeOptions } from "scenerystack/scenery";
import { Color, ReadOnlyProperty } from "scenerystack";
import { Shape } from "scenerystack/kite";
import { Vector2 } from "scenerystack/dot";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";

type SpringNodeOptions = NodeOptions & {
  frontColorProperty?: ReadOnlyProperty<Color>;
  middleColorProperty?: ReadOnlyProperty<Color>;
  backColorProperty?: ReadOnlyProperty<Color>;
  lineWidth?: number;
  loops?: number;
  radius?: number;
  aspectRatio?: number;
  leftEndLength?: number;
  rightEndLength?: number;
};

export class SpringNode extends Node {
  private readonly frontPath: Path;
  private readonly backPath: Path;
  private readonly loops: number;
  private radius: number;
  private readonly aspectRatio: number;
  private readonly leftEndLength: number;
  private readonly rightEndLength: number;
  private lastStart: Vector2 | null = null;
  private lastEnd: Vector2 | null = null;

  /**
   * @param options - Configuration options
   */
  public constructor(options?: SpringNodeOptions) {
    super();

    this.loops = options?.loops ?? 10;
    this.radius = options?.radius ?? 10;
    this.aspectRatio = options?.aspectRatio ?? 4;
    this.leftEndLength = options?.leftEndLength ?? 15;
    this.rightEndLength = options?.rightEndLength ?? 25;

    const frontColorProperty =
      options?.frontColorProperty ??
      ClassicalMechanicsColors.springFrontColorProperty;
    const backColorProperty =
      options?.backColorProperty ??
      ClassicalMechanicsColors.springBackColorProperty;
    const lineWidth = options?.lineWidth ?? 3;

    // Back part of spring (goes behind)
    this.backPath = new Path(null, {
      stroke: backColorProperty,
      lineWidth: lineWidth,
      lineCap: "round",
      lineJoin: "round",
    });

    // Front part of spring (goes in front)
    this.frontPath = new Path(null, {
      stroke: frontColorProperty,
      lineWidth: lineWidth,
      lineCap: "round",
      lineJoin: "round",
    });

    this.addChild(this.backPath);
    this.addChild(this.frontPath);

    // Apply remaining options
    this.mutate(options);
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

    // Calculate coil length (total length minus end sections)
    const coilLength = length - this.leftEndLength - this.rightEndLength;

    // Points per loop (4 points make one complete coil)
    const pointsPerLoop = 4;
    const totalPoints = this.loops * pointsPerLoop;

    const frontShape = new Shape();
    const backShape = new Shape();

    // Start with left end horizontal line
    frontShape.moveTo(0, 0);
    frontShape.lineTo(this.leftEndLength, 0);

    let isFront = true;

    for (let i = 1; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const x = this.leftEndLength + t * coilLength;

      // Alternate between +radius and -radius
      const phase = (i % pointsPerLoop) / pointsPerLoop;
      const y = this.aspectRatio * this.radius * Math.sin(phase * 2 * Math.PI);

      // Alternate between front and back
      const wasfront = isFront;
      isFront = i % pointsPerLoop === 1 || i % pointsPerLoop === 2;

      if (isFront) {
        if (!wasfront && i > 1) {
          // Switching from back to front
          backShape.lineTo(x, y);
          frontShape.moveTo(x, y);
        }
        frontShape.lineTo(x, y);
      } else {
        if (wasfront && i > 1) {
          // Switching from front to back
          frontShape.lineTo(x, y);
          backShape.moveTo(x, y);
        }
        backShape.lineTo(x, y);
      }
    }

    // End with right end horizontal line
    frontShape.lineTo(length, 0);

    this.frontPath.shape = frontShape;
    this.backPath.shape = backShape;

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
    this.frontPath.lineWidth = lineWidth;
    this.backPath.lineWidth = lineWidth;
  }

  /**
   * Update the radius of the spring coils (makes them wider or narrower).
   */
  public setRadius(radius: number): void {
    this.radius = radius;
    // Re-render the spring with the new radius
    if (this.lastStart && this.lastEnd) {
      this.setEndpoints(this.lastStart, this.lastEnd);
    }
  }
}
