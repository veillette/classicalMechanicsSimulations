/**
 * Model for a double pendulum - two pendulums connected in series.
 *
 * This is a complex chaotic system with highly nonlinear coupled equations.
 * The equations are derived using Lagrangian mechanics.
 *
 * State variables:
 * - angle1 (θ1) - angle of first pendulum from vertical
 * - angularVelocity1 (ω1) - angular velocity of first pendulum
 * - angle2 (θ2) - angle of second pendulum from vertical
 * - angularVelocity2 (ω2) - angular velocity of second pendulum
 *
 * The full equations are quite complex and involve trigonometric functions
 * of the relative angle (θ2 - θ1).
 */

import {
  NumberProperty,
  DerivedProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { RungeKuttaSolver } from "../../common/model/RungeKuttaSolver.js";

export class DoublePendulumModel {
  // State variables
  public readonly angle1Property: NumberProperty;
  public readonly angularVelocity1Property: NumberProperty;
  public readonly angle2Property: NumberProperty;
  public readonly angularVelocity2Property: NumberProperty;

  // Physics parameters
  public readonly length1Property: NumberProperty;
  public readonly length2Property: NumberProperty;
  public readonly mass1Property: NumberProperty;
  public readonly mass2Property: NumberProperty;
  public readonly gravityProperty: NumberProperty;
  public readonly dampingProperty: NumberProperty;

  // Computed values
  public readonly totalEnergyProperty: TReadOnlyProperty<number>;

  private readonly solver: RungeKuttaSolver;
  private time: number = 0;

  public constructor() {
    // Initialize state (both start at 90 degrees)
    this.angle1Property = new NumberProperty(Math.PI / 2); // radians
    this.angularVelocity1Property = new NumberProperty(0.0); // rad/s
    this.angle2Property = new NumberProperty(Math.PI / 2); // radians
    this.angularVelocity2Property = new NumberProperty(0.0); // rad/s

    // Initialize parameters
    this.length1Property = new NumberProperty(1.5); // meters
    this.length2Property = new NumberProperty(1.5); // meters
    this.mass1Property = new NumberProperty(1.0); // kg
    this.mass2Property = new NumberProperty(1.0); // kg
    this.gravityProperty = new NumberProperty(9.8); // m/s²
    this.dampingProperty = new NumberProperty(0.0); // N*m*s (default: no damping for chaos)

    // Compute total energy
    this.totalEnergyProperty = new DerivedProperty(
      [
        this.angle1Property,
        this.angle2Property,
        this.angularVelocity1Property,
        this.angularVelocity2Property,
        this.mass1Property,
        this.mass2Property,
        this.length1Property,
        this.length2Property,
        this.gravityProperty,
      ],
      (theta1, theta2, omega1, omega2, m1, m2, L1, L2, g) => {
        // Kinetic energy (complex due to coupling)
        const ke1 = 0.5 * (m1 + m2) * L1 * L1 * omega1 * omega1;
        const ke2 = 0.5 * m2 * L2 * L2 * omega2 * omega2;
        const ke_coupling =
          m2 * L1 * L2 * omega1 * omega2 * Math.cos(theta1 - theta2);
        const ke = ke1 + ke2 + ke_coupling;

        // Potential energy
        const y1 = -L1 * Math.cos(theta1);
        const y2 = y1 - L2 * Math.cos(theta2);
        const pe = (m1 + m2) * g * y1 + m2 * g * y2;

        return ke + pe;
      },
    );

    this.solver = new RungeKuttaSolver();
  }

  public reset(): void {
    this.angle1Property.reset();
    this.angularVelocity1Property.reset();
    this.angle2Property.reset();
    this.angularVelocity2Property.reset();
    this.length1Property.reset();
    this.length2Property.reset();
    this.mass1Property.reset();
    this.mass2Property.reset();
    this.gravityProperty.reset();
    this.dampingProperty.reset();
    this.time = 0;
  }

  public step(dt: number): void {
    // State vector: [θ1, ω1, θ2, ω2]
    const state = [
      this.angle1Property.value,
      this.angularVelocity1Property.value,
      this.angle2Property.value,
      this.angularVelocity2Property.value,
    ];

    this.solver.step(state, this.getDerivatives.bind(this), this.time, dt);

    // Update properties
    this.angle1Property.value = state[0];
    this.angularVelocity1Property.value = state[1];
    this.angle2Property.value = state[2];
    this.angularVelocity2Property.value = state[3];

    this.time += dt;
  }

  /**
   * Compute derivatives for the double pendulum system.
   * These are the coupled nonlinear equations derived from Lagrangian mechanics.
   */
  private getDerivatives(
    state: number[],
    derivatives: number[],
    _time: number,
  ): void {
    const theta1 = state[0];
    const omega1 = state[1];
    const theta2 = state[2];
    const omega2 = state[3];

    const m1 = this.mass1Property.value;
    const m2 = this.mass2Property.value;
    const L1 = this.length1Property.value;
    const L2 = this.length2Property.value;
    const g = this.gravityProperty.value;
    const b = this.dampingProperty.value;

    const delta = theta2 - theta1;
    const cosDelta = Math.cos(delta);
    const sinDelta = Math.sin(delta);

    // Denominators for the angular accelerations
    const denom1 = (m1 + m2) * L1 - m2 * L1 * cosDelta * cosDelta;
    const denom2 = (L2 / L1) * denom1;

    // dθ1/dt = ω1
    derivatives[0] = omega1;

    // dω1/dt (angular acceleration of first pendulum)
    const num1 =
      m2 * L1 * omega1 * omega1 * sinDelta * cosDelta +
      m2 * g * Math.sin(theta2) * cosDelta +
      m2 * L2 * omega2 * omega2 * sinDelta -
      (m1 + m2) * g * Math.sin(theta1) -
      b * omega1;

    derivatives[1] = num1 / denom1;

    // dθ2/dt = ω2
    derivatives[2] = omega2;

    // dω2/dt (angular acceleration of second pendulum)
    const num2 =
      -m2 * L2 * omega2 * omega2 * sinDelta * cosDelta +
      (m1 + m2) * g * Math.sin(theta1) * cosDelta -
      (m1 + m2) * L1 * omega1 * omega1 * sinDelta -
      (m1 + m2) * g * Math.sin(theta2) -
      b * omega2;

    derivatives[3] = num2 / denom2;
  }
}
