/**
 * SceneGridNode.ts
 *
 * Displays a grid overlay on the scene to help visualize spatial dimensions.
 * Features:
 * - Regular grid lines at specified spacing
 * - Highlighted origin axes (x=0, y=0)
 * - Scale indicator with double-sided arrow showing grid spacing
 */

import { Node, Path, Text, type NodeOptions } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";
import {  Bounds2 } from "scenerystack/dot";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { type TReadOnlyProperty } from "scenerystack/axon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { ArrowNode } from "scenerystack/scenery-phet";

type SceneGridNodeOptions = NodeOptions & {
  gridSpacing?: number; // spacing in model coordinates (meters)
  scaleLabelProperty: TReadOnlyProperty<string>; // label for the scale indicator
};

export class SceneGridNode extends Node {
  private readonly gridPath: Path;
  private readonly originPath: Path;
  private readonly scaleIndicator: Node;
  private readonly gridSpacing: number;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly viewBounds: Bounds2;

  /**
   * @param modelViewTransform - Transform between model and view coordinates
   * @param viewBounds - Bounds of the visible area in view coordinates
   * @param options - Configuration options
   */
  public constructor(
    modelViewTransform: ModelViewTransform2,
    viewBounds: Bounds2,
    options: SceneGridNodeOptions
  ) {
    super();

    this.modelViewTransform = modelViewTransform;
    this.viewBounds = viewBounds;
    this.gridSpacing = options.gridSpacing ?? 0.5; // default 0.5 meters

    // Grid lines (regular grid)
    this.gridPath = new Path(null, {
      stroke: ClassicalMechanicsColors.sceneGridColorProperty,
      lineWidth: 1,
    });
    this.addChild(this.gridPath);

    // Origin axes (x=0 and y=0)
    this.originPath = new Path(null, {
      stroke: ClassicalMechanicsColors.sceneGridOriginColorProperty,
      lineWidth: 2,
    });
    this.addChild(this.originPath);

    // Scale indicator (double-sided arrow with label)
    this.scaleIndicator = this.createScaleIndicator(options.scaleLabelProperty);
    this.addChild(this.scaleIndicator);

    // Build the grid
    this.updateGrid();

    // Apply remaining options
    this.mutate(options);
  }

  /**
   * Create the scale indicator showing the grid spacing
   */
  private createScaleIndicator(scaleLabelProperty: TReadOnlyProperty<string>): Node {
    const indicatorNode = new Node();

    // Position in bottom-left corner with some margin
    const margin = 20;
    const startX = this.viewBounds.minX + margin;
    const startY = this.viewBounds.maxY - margin;

    // Length of the arrow in view coordinates
    const arrowLengthModel = this.gridSpacing;
    const arrowLengthView = this.modelViewTransform.modelToViewDeltaX(arrowLengthModel);

    // Create double-sided arrow
    const arrow = new ArrowNode(
      startX,
      startY,
      startX + arrowLengthView,
      startY,
      {
        doubleHead: true,
        headHeight: 8,
        headWidth: 8,
        tailWidth: 2,
        fill: ClassicalMechanicsColors.textColorProperty,
        stroke: ClassicalMechanicsColors.textColorProperty,
        lineWidth: 1,
      }
    );
    indicatorNode.addChild(arrow);

    // Label below the arrow
    const label = new Text(scaleLabelProperty, {
      font: "14px sans-serif",
      fill: ClassicalMechanicsColors.textColorProperty,
      centerX: startX + arrowLengthView / 2,
      top: startY + 5,
    });
    indicatorNode.addChild(label);

    return indicatorNode;
  }

  /**
   * Update the grid lines based on current transform and bounds
   */
  private updateGrid(): void {
    const gridShape = new Shape();
    const originShape = new Shape();

    // Convert view bounds to model bounds
    const modelMinX = this.modelViewTransform.viewToModelX(this.viewBounds.minX);
    const modelMaxX = this.modelViewTransform.viewToModelX(this.viewBounds.maxX);
    const modelMinY = this.modelViewTransform.viewToModelY(this.viewBounds.minY);
    const modelMaxY = this.modelViewTransform.viewToModelY(this.viewBounds.maxY);

    // Calculate grid line positions in model coordinates
    const startX = Math.floor(modelMinX / this.gridSpacing) * this.gridSpacing;
    const startY = Math.floor(modelMinY / this.gridSpacing) * this.gridSpacing;

    // Draw vertical grid lines
    for (let x = startX; x <= modelMaxX; x += this.gridSpacing) {
      const viewX = this.modelViewTransform.modelToViewX(x);
      const viewMinY = this.modelViewTransform.modelToViewY(modelMinY);
      const viewMaxY = this.modelViewTransform.modelToViewY(modelMaxY);

      if (Math.abs(x) < this.gridSpacing / 100) {
        // This is the origin x-axis
        originShape.moveTo(viewX, viewMinY);
        originShape.lineTo(viewX, viewMaxY);
      } else {
        // Regular grid line
        gridShape.moveTo(viewX, viewMinY);
        gridShape.lineTo(viewX, viewMaxY);
      }
    }

    // Draw horizontal grid lines
    for (let y = startY; y <= modelMaxY; y += this.gridSpacing) {
      const viewY = this.modelViewTransform.modelToViewY(y);
      const viewMinX = this.modelViewTransform.modelToViewX(modelMinX);
      const viewMaxX = this.modelViewTransform.modelToViewX(modelMaxX);

      if (Math.abs(y) < this.gridSpacing / 100) {
        // This is the origin y-axis
        originShape.moveTo(viewMinX, viewY);
        originShape.lineTo(viewMaxX, viewY);
      } else {
        // Regular grid line
        gridShape.moveTo(viewMinX, viewY);
        gridShape.lineTo(viewMaxX, viewY);
      }
    }

    this.gridPath.shape = gridShape;
    this.originPath.shape = originShape;
  }
}
