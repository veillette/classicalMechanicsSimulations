/**
 * Model for a single mass attached to a spring.
 *
 * Physics:
 * - Spring force: F = -k * x
 * - Damping force: F = -b * v
 * - Equation of motion: m * a = -k * x - b * v
 *
 * State variables:
 * - position (x)
 * - velocity (v)
 */

import {
  NumberProperty,
  DerivedProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { BaseModel } from "../../common/model/BaseModel.js";

export class SingleSpringModel extends BaseModel {
  // State variables
  public readonly positionProperty: NumberProperty;
  public readonly velocityProperty: NumberProperty;

  // Physics parameters
  public readonly massProperty: NumberProperty;
  public readonly springConstantProperty: NumberProperty;
  public readonly dampingProperty: NumberProperty;

  // Computed values
  public readonly kineticEnergyProperty: TReadOnlyProperty<number>;
  public readonly potentialEnergyProperty: TReadOnlyProperty<number>;
  public readonly totalEnergyProperty: TReadOnlyProperty<number>;

  public constructor() {
    super();

    // Initialize state
    this.positionProperty = new NumberProperty(2.0); // meters
    this.velocityProperty = new NumberProperty(0.0); // m/s

    // Initialize parameters
    this.massProperty = new NumberProperty(1.0); // kg
    this.springConstantProperty = new NumberProperty(10.0); // N/m
    this.dampingProperty = new NumberProperty(0.1); // N*s/m

    // Computed energies
    this.kineticEnergyProperty = new DerivedProperty(
      [this.velocityProperty, this.massProperty],
      (v, m) => 0.5 * m * v * v,
    );

    this.potentialEnergyProperty = new DerivedProperty(
      [this.positionProperty, this.springConstantProperty],
      (x, k) => 0.5 * k * x * x,
    );

    this.totalEnergyProperty = new DerivedProperty(
      [this.kineticEnergyProperty, this.potentialEnergyProperty],
      (ke, pe) => ke + pe,
    );
  }

  /**
   * Get the current state vector for physics integration.
   * @returns [position, velocity]
   */
  protected getState(): number[] {
    return [this.positionProperty.value, this.velocityProperty.value];
  }

  /**
   * Update the model's properties from the state vector after integration.
   * @param state - [position, velocity]
   */
  protected setState(state: number[]): void {
    this.positionProperty.value = state[0];
    this.velocityProperty.value = state[1];
  }

  /**
   * Compute derivatives for the ODE solver.
   * Implements: x' = v, v' = (-k*x - b*v) / m
   */
  protected getDerivatives(
    state: number[],
    derivatives: number[],
    _: number,
  ): void {
    const x = state[0];
    const v = state[1];

    const m = this.massProperty.value;
    const k = this.springConstantProperty.value;
    const b = this.dampingProperty.value;

    // dx/dt = v
    derivatives[0] = v;

    // dv/dt = (-k*x - b*v) / m
    derivatives[1] = (-k * x - b * v) / m;
  }

  /**
   * Reset the model to initial conditions.
   */
  public reset(): void {
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.massProperty.reset();
    this.springConstantProperty.reset();
    this.dampingProperty.reset();
    this.resetCommon(); // Reset time-related properties from base class
  }
}
