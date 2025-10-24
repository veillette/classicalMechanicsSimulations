// Copyright 2025. All Rights Reserved.

import { TReadOnlyProperty } from 'scenerystack/axon';
import { Vector2 } from 'scenerystack/dot';

/**
 * GraphDataSet collects data from properties over time, storing it as a history
 * of Vector2 points. This is similar to myphysicslab's GraphLine but adapted
 * for SceneryStack's property system.
 *
 * The data can be displayed using bamboo's LinePlot component.
 */
export default class GraphDataSet {
  // Properties to track
  private readonly xProperty: TReadOnlyProperty<number>;
  private readonly yProperty: TReadOnlyProperty<number>;

  // History of collected points
  private readonly dataPoints: (Vector2 | null)[];

  // Maximum number of points to store (circular buffer)
  private readonly maxPoints: number;

  // Color for rendering this dataset
  public color: string;

  // Line width for rendering
  public lineWidth: number;

  /**
   * @param xProperty - Property for X values
   * @param yProperty - Property for Y values
   * @param color - Color for rendering this line
   * @param maxPoints - Maximum number of points to store (default 2000)
   */
  public constructor(
    xProperty: TReadOnlyProperty<number>,
    yProperty: TReadOnlyProperty<number>,
    color: string = 'lime',
    maxPoints: number = 2000
  ) {
    this.xProperty = xProperty;
    this.yProperty = yProperty;
    this.dataPoints = [];
    this.maxPoints = maxPoints;
    this.color = color;
    this.lineWidth = 2;
  }

  /**
   * Collect a new data point from the current property values.
   * Should be called regularly (e.g., in a step function or model step).
   */
  public addDataPoint(): void {
    const x = this.xProperty.value;
    const y = this.yProperty.value;

    // Skip if values are invalid
    if (!isFinite(x) || !isFinite(y)) {
      // Add null to create a gap in the plot
      this.dataPoints.push(null);
    } else {
      // Only add if it's different from the last point (avoid duplicates)
      const lastPoint = this.dataPoints[this.dataPoints.length - 1];
      if (!lastPoint || !lastPoint.equals(new Vector2(x, y))) {
        this.dataPoints.push(new Vector2(x, y));
      }
    }

    // Remove oldest point if we exceed maxPoints (circular buffer)
    if (this.dataPoints.length > this.maxPoints) {
      this.dataPoints.shift();
    }
  }

  /**
   * Get the collected data points.
   */
  public getDataPoints(): (Vector2 | null)[] {
    return this.dataPoints;
  }

  /**
   * Clear all collected data.
   */
  public clear(): void {
    this.dataPoints.length = 0;
  }

  /**
   * Get the number of data points.
   */
  public getLength(): number {
    return this.dataPoints.length;
  }

  /**
   * Get the X and Y ranges of the data for auto-scaling.
   * Returns null if there's no valid data.
   */
  public getDataBounds(): { xMin: number; xMax: number; yMin: number; yMax: number } | null {
    const validPoints = this.dataPoints.filter((p): p is Vector2 => p !== null);

    if (validPoints.length === 0) {
      return null;
    }

    let xMin = validPoints[0].x;
    let xMax = validPoints[0].x;
    let yMin = validPoints[0].y;
    let yMax = validPoints[0].y;

    for (const point of validPoints) {
      xMin = Math.min(xMin, point.x);
      xMax = Math.max(xMax, point.x);
      yMin = Math.min(yMin, point.y);
      yMax = Math.max(yMax, point.y);
    }

    return { xMin, xMax, yMin, yMax };
  }
}
