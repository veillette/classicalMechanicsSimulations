/**
 * Model for a simple pendulum.
 *
 * Physics:
 * - Torque equation: τ = I * α
 * - Torque from gravity: τ = -m * g * L * sin(θ)
 * - Torque from damping: τ = -b * ω
 * - Rotational inertia: I = m * L²
 *
 * Equation of motion:
 * θ'' = -(g/L) * sin(θ) - (b/mL²) * θ'
 *
 * State variables:
 * - angle (θ) - angle from vertical in radians
 * - angularVelocity (ω) - angular velocity in rad/s
 */

import {
  NumberProperty,
  DerivedProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { BaseModel } from "../../common/model/BaseModel.js";
import { StatePropertyMapper } from "../../common/model/StatePropertyMapper.js";

export class PendulumModel extends BaseModel {
  // State variables
  public readonly angleProperty: NumberProperty;
  public readonly angularVelocityProperty: NumberProperty;

  // State property mapper for cleaner state management
  private readonly stateMapper: StatePropertyMapper;

  // Physics parameters
  public readonly lengthProperty: NumberProperty;
  public readonly massProperty: NumberProperty;
  public readonly gravityProperty: NumberProperty;
  public readonly dampingProperty: NumberProperty;

  // Computed values
  public readonly angularAccelerationProperty: TReadOnlyProperty<number>;
  public readonly kineticEnergyProperty: TReadOnlyProperty<number>;
  public readonly potentialEnergyProperty: TReadOnlyProperty<number>;
  public readonly totalEnergyProperty: TReadOnlyProperty<number>;

  public constructor() {
    super();

    // Initialize state (start at 45 degrees)
    this.angleProperty = new NumberProperty(Math.PI / 4); // radians
    this.angularVelocityProperty = new NumberProperty(0.0); // rad/s

    // Initialize parameters
    this.lengthProperty = new NumberProperty(2.0); // meters
    this.massProperty = new NumberProperty(1.0); // kg
    this.gravityProperty = new NumberProperty(9.8); // m/s²
    this.dampingProperty = new NumberProperty(0.1); // N*m*s

    // Computed angular acceleration
    // α = -(g/L)*sin(θ) - (b/mL²)*ω
    this.angularAccelerationProperty = new DerivedProperty(
      [this.angleProperty, this.angularVelocityProperty, this.massProperty, this.lengthProperty, this.gravityProperty, this.dampingProperty],
      (theta, omega, m, L, g, b) => {
        const I = m * L * L; // rotational inertia
        return -(g / L) * Math.sin(theta) - (b / I) * omega;
      },
    );

    // Computed energies
    // KE = (1/2) * I * ω² = (1/2) * m * L² * ω²
    this.kineticEnergyProperty = new DerivedProperty(
      [this.angularVelocityProperty, this.massProperty, this.lengthProperty],
      (omega, m, L) => 0.5 * m * L * L * omega * omega,
    );

    // PE = m * g * h, where h = L * (1 - cos(θ))
    // Taking PE = 0 at the bottom (θ = 0)
    this.potentialEnergyProperty = new DerivedProperty(
      [
        this.angleProperty,
        this.massProperty,
        this.gravityProperty,
        this.lengthProperty,
      ],
      (theta, m, g, L) => m * g * L * (1 - Math.cos(theta)),
    );

    this.totalEnergyProperty = new DerivedProperty(
      [this.kineticEnergyProperty, this.potentialEnergyProperty],
      (ke, pe) => ke + pe,
    );

    // Initialize state mapper with properties in state order
    this.stateMapper = new StatePropertyMapper([
      this.angleProperty,
      this.angularVelocityProperty,
    ]);
  }

  /**
   * Get the current state vector for physics integration.
   * @returns [angle, angularVelocity]
   */
  protected getState(): number[] {
    return this.stateMapper.getState();
  }

  /**
   * Update the model's properties from the state vector after integration.
   * @param state - [angle, angularVelocity]
   */
  protected setState(state: number[]): void {
    this.stateMapper.setState(state);
  }

  /**
   * Compute derivatives for pendulum equations.
   * θ' = ω
   * ω' = -(g/L)*sin(θ) - (b/mL²)*ω
   */
  protected getDerivatives(
    state: number[],
    derivatives: number[],
    _: number,
  ): void {
    const theta = state[0];
    const omega = state[1];

    const m = this.massProperty.value;
    const L = this.lengthProperty.value;
    const g = this.gravityProperty.value;
    const b = this.dampingProperty.value;

    // dθ/dt = ω
    derivatives[0] = omega;

    // dω/dt = -(g/L)*sin(θ) - (b/mL²)*ω
    const I = m * L * L; // rotational inertia
    derivatives[1] = -(g / L) * Math.sin(theta) - (b / I) * omega;
  }

  /**
   * Reset the model to initial conditions.
   */
  public reset(): void {
    this.angleProperty.reset();
    this.angularVelocityProperty.reset();
    this.lengthProperty.reset();
    this.massProperty.reset();
    this.gravityProperty.reset();
    this.dampingProperty.reset();
    this.resetCommon(); // Reset time-related properties from base class
  }
}
