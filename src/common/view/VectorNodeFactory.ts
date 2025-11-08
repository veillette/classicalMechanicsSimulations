/**
 * Factory for creating standard vector nodes.
 */

import { VectorNode } from "./VectorNode.js";
import { PhetColorScheme } from "scenerystack/scenery-phet";
import { BooleanProperty } from "scenerystack/axon";
import {
  VELOCITY_VECTOR_SCALE,
  FORCE_VECTOR_SCALE,
  ACCELERATION_VECTOR_SCALE,
  VELOCITY_MIN_MAGNITUDE,
  FORCE_MIN_MAGNITUDE,
  ACCELERATION_MIN_MAGNITUDE,
} from "./VectorScaleConstants.js";

/**
 * Set of vector nodes for a single mass/bob
 */
export interface VectorNodes {
  velocity: VectorNode;
  force: VectorNode;
  acceleration: VectorNode;
}

/**
 * Factory class for creating standard vector node sets
 */
export class VectorNodeFactory {
  /**
   * Create a set of vector nodes for a single mass/bob with standard parameters.
   */
  public static createVectorNodes(): VectorNodes {
    return {
      velocity: new VectorNode({
        color: PhetColorScheme.VELOCITY,
        scale: VELOCITY_VECTOR_SCALE,
        label: "v",
        minMagnitude: VELOCITY_MIN_MAGNITUDE,
      }),
      force: new VectorNode({
        color: PhetColorScheme.APPLIED_FORCE,
        scale: FORCE_VECTOR_SCALE,
        label: "F",
        minMagnitude: FORCE_MIN_MAGNITUDE,
      }),
      acceleration: new VectorNode({
        color: PhetColorScheme.ACCELERATION,
        scale: ACCELERATION_VECTOR_SCALE,
        label: "a",
        minMagnitude: ACCELERATION_MIN_MAGNITUDE,
      }),
    };
  }

  /**
   * Link vector visibility to properties.
   * Sets up listeners that show/hide vectors based on property values.
   */
  public static linkVectorVisibility(
    vectorNodes: VectorNodes,
    showVelocityProperty: BooleanProperty,
    showForceProperty: BooleanProperty,
    showAccelerationProperty: BooleanProperty
  ): void {
    showVelocityProperty.link((show) =>
      vectorNodes.velocity.setVectorVisible(show)
    );
    showForceProperty.link((show) => vectorNodes.force.setVectorVisible(show));
    showAccelerationProperty.link((show) =>
      vectorNodes.acceleration.setVectorVisible(show)
    );
  }
}
