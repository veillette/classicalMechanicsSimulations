/**
 * Model for two masses connected by springs in series (vertical configuration).
 *
 * Physics:
 * - Mass 1: m1 * a1 = -k1 * x1 + k2 * (x2 - x1) - b1 * v1 + m1 * g
 * - Mass 2: m2 * a2 = -k2 * (x2 - x1) - b2 * v2 + m2 * g
 *
 * State variables:
 * - position1 (x1), velocity1 (v1) - positive downward from natural length
 * - position2 (x2), velocity2 (v2) - positive downward from natural length
 */

import {
  NumberProperty,
  DerivedProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { BaseModel } from "../../common/model/BaseModel.js";
import { StatePropertyMapper } from "../../common/model/StatePropertyMapper.js";

export class DoubleSpringModel extends BaseModel {
  // State variables for mass 1
  public readonly position1Property: NumberProperty;
  public readonly velocity1Property: NumberProperty;

  // State variables for mass 2
  public readonly position2Property: NumberProperty;
  public readonly velocity2Property: NumberProperty;

  // State property mapper for cleaner state management
  private readonly stateMapper: StatePropertyMapper;

  // Physics parameters
  public readonly mass1Property: NumberProperty;
  public readonly mass2Property: NumberProperty;
  public readonly springConstant1Property: NumberProperty;
  public readonly springConstant2Property: NumberProperty;
  public readonly damping1Property: NumberProperty;
  public readonly damping2Property: NumberProperty;
  public readonly gravityProperty: NumberProperty;
  public readonly naturalLength1Property: NumberProperty;
  public readonly naturalLength2Property: NumberProperty;

  // Computed values
  public readonly acceleration1Property: TReadOnlyProperty<number>;
  public readonly acceleration2Property: TReadOnlyProperty<number>;
  public readonly totalEnergyProperty: TReadOnlyProperty<number>;

  public constructor() {
    super();

    // Initialize state
    // Start at equilibrium: x1_eq ≈ 0.98 m, x2_eq ≈ 1.47 m (with k=20 N/m)
    this.position1Property = new NumberProperty(1.0); // meters (positive downward from natural length)
    this.velocity1Property = new NumberProperty(0.0); // m/s
    this.position2Property = new NumberProperty(1.5); // meters (positive downward from natural length)
    this.velocity2Property = new NumberProperty(0.0); // m/s

    // Initialize parameters
    this.mass1Property = new NumberProperty(1.0); // kg
    this.mass2Property = new NumberProperty(1.0); // kg
    this.springConstant1Property = new NumberProperty(20.0); // N/m (increased from 10 to keep masses on screen)
    this.springConstant2Property = new NumberProperty(20.0); // N/m (increased from 10 to keep masses on screen)
    this.damping1Property = new NumberProperty(0.0); // N*s/m (no damping initially)
    this.damping2Property = new NumberProperty(0.0); // N*s/m (no damping initially)
    this.gravityProperty = new NumberProperty(9.8); // m/s^2
    this.naturalLength1Property = new NumberProperty(0.8); // meters
    this.naturalLength2Property = new NumberProperty(0.8); // meters

    // Computed accelerations
    this.acceleration1Property = new DerivedProperty(
      [this.position1Property, this.position2Property, this.velocity1Property, this.mass1Property, this.springConstant1Property, this.springConstant2Property, this.damping1Property, this.gravityProperty],
      (x1, x2, v1, m1, k1, k2, b1, g) => (-k1 * x1 + k2 * (x2 - x1) - b1 * v1 + m1 * g) / m1,
    );

    this.acceleration2Property = new DerivedProperty(
      [this.position1Property, this.position2Property, this.velocity2Property, this.mass2Property, this.springConstant2Property, this.damping2Property, this.gravityProperty],
      (x1, x2, v2, m2, k2, b2, g) => (-k2 * (x2 - x1) - b2 * v2 + m2 * g) / m2,
    );

    // Compute total energy (including gravitational potential energy)
    this.totalEnergyProperty = new DerivedProperty(
      [
        this.velocity1Property,
        this.velocity2Property,
        this.position1Property,
        this.position2Property,
        this.mass1Property,
        this.mass2Property,
        this.springConstant1Property,
        this.springConstant2Property,
        this.gravityProperty,
      ],
      (v1, v2, x1, x2, m1, m2, k1, k2, g) => {
        const ke1 = 0.5 * m1 * v1 * v1;
        const ke2 = 0.5 * m2 * v2 * v2;
        const pe1 = 0.5 * k1 * x1 * x1 - m1 * g * x1; // Spring 1 PE + Gravitational PE for mass 1
        const pe2 = 0.5 * k2 * (x2 - x1) * (x2 - x1) - m2 * g * x2; // Spring 2 PE + Gravitational PE for mass 2
        return ke1 + ke2 + pe1 + pe2;
      },
    );

    // Initialize state mapper with properties in state order
    this.stateMapper = new StatePropertyMapper([
      this.position1Property,
      this.velocity1Property,
      this.position2Property,
      this.velocity2Property,
    ]);
  }

  /**
   * Get the current state vector for physics integration.
   * @returns [position1, velocity1, position2, velocity2]
   */
  protected getState(): number[] {
    return this.stateMapper.getState();
  }

  /**
   * Update the model's properties from the state vector after integration.
   * @param state - [position1, velocity1, position2, velocity2]
   */
  protected setState(state: number[]): void {
    this.stateMapper.setState(state);
  }

  /**
   * Compute derivatives for coupled spring system (vertical configuration).
   * Note: positions x1 and x2 are positive downward from natural length
   */
  protected getDerivatives(
    state: number[],
    derivatives: number[],
    _: number,
  ): void {
    const x1 = state[0];
    const v1 = state[1];
    const x2 = state[2];
    const v2 = state[3];

    const m1 = this.mass1Property.value;
    const m2 = this.mass2Property.value;
    const k1 = this.springConstant1Property.value;
    const k2 = this.springConstant2Property.value;
    const b1 = this.damping1Property.value;
    const b2 = this.damping2Property.value;
    const g = this.gravityProperty.value;

    // dx1/dt = v1
    derivatives[0] = v1;

    // dv1/dt = (-k1*x1 + k2*(x2 - x1) - b1*v1 + m1*g) / m1
    derivatives[1] = (-k1 * x1 + k2 * (x2 - x1) - b1 * v1 + m1 * g) / m1;

    // dx2/dt = v2
    derivatives[2] = v2;

    // dv2/dt = (-k2*(x2 - x1) - b2*v2 + m2*g) / m2
    derivatives[3] = (-k2 * (x2 - x1) - b2 * v2 + m2 * g) / m2;
  }

  /**
   * Reset the model to initial conditions.
   */
  public reset(): void {
    this.position1Property.reset();
    this.velocity1Property.reset();
    this.position2Property.reset();
    this.velocity2Property.reset();
    this.mass1Property.reset();
    this.mass2Property.reset();
    this.springConstant1Property.reset();
    this.springConstant2Property.reset();
    this.damping1Property.reset();
    this.damping2Property.reset();
    this.gravityProperty.reset();
    this.naturalLength1Property.reset();
    this.naturalLength2Property.reset();
    this.resetCommon(); // Reset time-related properties from base class
  }
}
