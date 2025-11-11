/**
 * A node for displaying physics vectors (velocity, acceleration, force, etc.).
 * Displays an arrow with optional label that scales with vector magnitude.
 *
 * Features:
 * - Automatically hides vectors below minimum magnitude threshold
 * - Scales arrow length based on model units
 * - Positions label at arrow tip
 * - Supports dynamic visibility control
 *
 * @author Martin Veillette (PhET Interactive Simulations)
 */

import { Node, Text, type TColor, type NodeOptions } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { Vector2 } from "scenerystack/dot";
import { type TReadOnlyProperty } from "scenerystack/axon";
import { PhetFont } from "scenerystack";
import classicalMechanics from "../../ClassicalMechanicsNamespace.js";

/**
 * Self options for VectorNode - options specific to vector visualization.
 */
type SelfOptions = {
  /** The color of the vector arrow */
  color: TColor;

  /**
   * Scale factor to convert from model units to view units (pixels)
   * For example, if 1 m/s should be displayed as 50 pixels, scale = 50
   */
  scale: number;

  /** Optional label to display next to the vector */
  label?: string | TReadOnlyProperty<string>;

  /** Line width of the arrow */
  lineWidth?: number;

  /** Head width of the arrow */
  headWidth?: number;

  /** Head height of the arrow */
  headHeight?: number;

  /**
   * Minimum magnitude (in model units) to display the vector
   * Vectors smaller than this won't be shown
   */
  minMagnitude?: number;
};

/**
 * Options for VectorNode constructor.
 * Combines self options with parent NodeOptions.
 */
export type VectorNodeOptions = SelfOptions & NodeOptions;

/**
 * A node that displays a physics vector as an arrow
 */
export class VectorNode extends Node {
  private readonly arrowNode: ArrowNode;
  private readonly labelText: Text | null = null;
  private readonly vectorScale: number;
  private readonly minMagnitude: number;
  private tailPosition: Vector2 = Vector2.ZERO;
  private vectorValue: Vector2 = Vector2.ZERO;
  private shouldBeVisible: boolean = false; // Track user's visibility preference

  public constructor(options: VectorNodeOptions) {
    super();

    this.vectorScale = options.scale;
    this.minMagnitude = options.minMagnitude ?? 0.01;

    // Create arrow node
    this.arrowNode = new ArrowNode(0, 0, 0, 0, {
      fill: options.color,
      stroke: options.color,
      lineWidth: options.lineWidth ?? 2,
      headWidth: options.headWidth ?? 12,
      headHeight: options.headHeight ?? 10,
      tailWidth: options.lineWidth ?? 2,
    });
    this.addChild(this.arrowNode);

    // Create label if provided
    if (options.label) {
      this.labelText = new Text(options.label, {
        font: new PhetFont({size: 12}),
        fill: options.color,
      });
      this.addChild(this.labelText);
    }

    // Initially hidden until a vector is set
    this.visible = false;
  }

  /**
   * Set the tail position (starting point) of the vector in view coordinates
   */
  public setTailPosition(position: Vector2): void {
    this.tailPosition = position;
    this.updateArrow();
  }

  /**
   * Set the vector value in model coordinates
   * The arrow will be scaled and positioned automatically
   */
  public setVector(vector: Vector2): void {
    this.vectorValue = vector;
    this.updateArrow();
  }

  /**
   * Update the arrow visualization based on current tail position and vector value
   */
  private updateArrow(): void {
    const magnitude = this.vectorValue.magnitude;

    // Only show if user wants it visible AND magnitude is sufficient
    if (!this.shouldBeVisible || magnitude < this.minMagnitude) {
      this.visible = false;
      return;
    }

    this.visible = true;

    // Scale vector to view coordinates
    const scaledVector = this.vectorValue.times(this.vectorScale);
    const tipPosition = this.tailPosition.plus(scaledVector);

    // Update arrow
    this.arrowNode.setTailAndTip(
      this.tailPosition.x,
      this.tailPosition.y,
      tipPosition.x,
      tipPosition.y,
    );

    // Update label position if it exists
    if (this.labelText) {
      // Position label at the tip of the arrow, offset slightly
      const offset = scaledVector.normalized().times(15); // 15 pixels offset
      this.labelText.center = tipPosition.plus(offset);
    }
  }

  /**
   * Set whether the vector should be visible
   */
  public setVectorVisible(visible: boolean): void {
    this.shouldBeVisible = visible;
    this.updateArrow(); // Re-evaluate visibility
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('VectorNode', VectorNode);
