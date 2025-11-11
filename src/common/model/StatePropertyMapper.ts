/**
 * Utility for managing state-to-property mapping in models.
 * Reduces boilerplate and adds validation for state vector operations.
 */

import { NumberProperty } from "scenerystack/axon";
import classicalMechanics from '../../ClassicalMechanicsNamespace.js';

/**
 * Maps between property values and state vectors, providing:
 * - Cleaner code with named indices
 * - Validation of state vector bounds
 * - Type safety for property access
 */
export class StatePropertyMapper {
  private readonly properties: NumberProperty[];

  /**
   * Create a new state property mapper.
   * @param properties - Array of NumberProperties in state order
   */
  constructor(properties: NumberProperty[]) {
    this.properties = properties;
  }

  /**
   * Get the current state vector from properties.
   * @returns Array of property values in the order specified during construction
   */
  public getState(): number[] {
    return this.properties.map(prop => prop.value);
  }

  /**
   * Update properties from a state vector.
   * Validates that the state vector has the correct length.
   * @param state - State vector with values to set
   * @throws Error if state vector length doesn't match number of properties
   */
  public setState(state: number[]): void {
    if (state.length !== this.properties.length) {
      throw new Error(
        `State vector length mismatch: expected ${this.properties.length}, got ${state.length}`
      );
    }

    // Validate that all state values are finite numbers
    for (let i = 0; i < state.length; i++) {
      if (!isFinite(state[i])) {
        throw new Error(
          `Invalid state value at index ${i}: ${state[i]} (must be a finite number)`
        );
      }
    }

    // Update all properties
    for (let i = 0; i < state.length; i++) {
      this.properties[i].value = state[i];
    }
  }

  /**
   * Get the number of state variables.
   */
  public get stateSize(): number {
    return this.properties.length;
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('StatePropertyMapper', StatePropertyMapper);
