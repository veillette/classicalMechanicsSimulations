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
import { Range } from "scenerystack/dot";
import { BaseModel } from "../../common/model/BaseModel.js";
import { StatePropertyMapper } from "../../common/model/StatePropertyMapper.js";
import classicalMechanics from '../../ClassicalMechanicsNamespace.js';

export class DoublePendulumModel extends BaseModel {
  // State variables
  public readonly angle1Property: NumberProperty;
  public readonly angularVelocity1Property: NumberProperty;
  public readonly angle2Property: NumberProperty;
  public readonly angularVelocity2Property: NumberProperty;

  // State property mapper for cleaner state management
  private readonly stateMapper: StatePropertyMapper;

  // Physics parameters
  public readonly length1Property: NumberProperty;
  public readonly length2Property: NumberProperty;
  public readonly mass1Property: NumberProperty;
  public readonly mass2Property: NumberProperty;
  public readonly gravityProperty: NumberProperty;
  public readonly dampingProperty: NumberProperty;

  // Computed values
  public readonly angularAcceleration1Property: TReadOnlyProperty<number>;
  public readonly angularAcceleration2Property: TReadOnlyProperty<number>;
  public readonly kineticEnergyProperty: TReadOnlyProperty<number>;
  public readonly potentialEnergyProperty: TReadOnlyProperty<number>;
  public readonly totalEnergyProperty: TReadOnlyProperty<number>;

  public constructor() {
    super();

    // Initialize state (both start at 90 degrees)
    this.angle1Property = new NumberProperty(Math.PI / 2, {
      range: new Range(-Math.PI, Math.PI)
    });

    this.angularVelocity1Property = new NumberProperty(0.0);

    this.angle2Property = new NumberProperty(Math.PI / 2, {
      range: new Range(-Math.PI, Math.PI)
    });

    this.angularVelocity2Property = new NumberProperty(0.0);

    // Initialize parameters
    this.length1Property = new NumberProperty(1.5, {
      range: new Range(0.5, 5.0)
    });

    this.length2Property = new NumberProperty(1.5, {
      range: new Range(0.5, 5.0)
    });

    this.mass1Property = new NumberProperty(1.0, {
      range: new Range(0.1, 5.0)
    });

    this.mass2Property = new NumberProperty(1.0, {
      range: new Range(0.1, 5.0)
    });

    this.gravityProperty = new NumberProperty(9.8, {
      range: new Range(0.0, 20.0)
    });

    this.dampingProperty = new NumberProperty(0.0, {
      range: new Range(0.0, 2.0)
    });

    // Computed angular accelerations (derived from Lagrangian mechanics)
    this.angularAcceleration1Property = new DerivedProperty(
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
        this.dampingProperty,
      ],
      (theta1, theta2, omega1, omega2, m1, m2, L1, L2, g, b) => {
        const delta = theta2 - theta1;
        const cosDelta = Math.cos(delta);
        const sinDelta = Math.sin(delta);
        const denom1 = (m1 + m2) * L1 - m2 * L1 * cosDelta * cosDelta;
        const num1 =
          m2 * L1 * omega1 * omega1 * sinDelta * cosDelta +
          m2 * g * Math.sin(theta2) * cosDelta +
          m2 * L2 * omega2 * omega2 * sinDelta -
          (m1 + m2) * g * Math.sin(theta1) -
          b * omega1;
        return num1 / denom1;
      }
    );

    this.angularAcceleration2Property = new DerivedProperty(
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
        this.dampingProperty,
      ],
      (theta1, theta2, omega1, omega2, m1, m2, L1, L2, g, b) => {
        const delta = theta2 - theta1;
        const cosDelta = Math.cos(delta);
        const sinDelta = Math.sin(delta);
        const denom1 = (m1 + m2) * L1 - m2 * L1 * cosDelta * cosDelta;
        const denom2 = (L2 / L1) * denom1;
        const num2 =
          -m2 * L2 * omega2 * omega2 * sinDelta * cosDelta +
          (m1 + m2) * g * Math.sin(theta1) * cosDelta -
          (m1 + m2) * L1 * omega1 * omega1 * sinDelta -
          (m1 + m2) * g * Math.sin(theta2) -
          b * omega2;
        return num2 / denom2;
      }
    );

    // Compute kinetic energy (complex due to coupling between pendulums)
    // KE = (1/2) * (m1 + m2) * L1² * ω1² + (1/2) * m2 * L2² * ω2² + m2 * L1 * L2 * ω1 * ω2 * cos(θ1 - θ2)
    this.kineticEnergyProperty = new DerivedProperty(
      [
        this.angle1Property,
        this.angle2Property,
        this.angularVelocity1Property,
        this.angularVelocity2Property,
        this.mass1Property,
        this.mass2Property,
        this.length1Property,
        this.length2Property,
      ],
      (theta1, theta2, omega1, omega2, m1, m2, L1, L2) => {
        const ke1 = 0.5 * (m1 + m2) * L1 * L1 * omega1 * omega1;
        const ke2 = 0.5 * m2 * L2 * L2 * omega2 * omega2;
        const ke_coupling =
          m2 * L1 * L2 * omega1 * omega2 * Math.cos(theta1 - theta2);
        return ke1 + ke2 + ke_coupling;
      }
    );

    // Compute potential energy
    // PE = (m1 + m2) * g * y1 + m2 * g * y2
    // where y1 = -L1 * cos(θ1) and y2 = y1 - L2 * cos(θ2)
    this.potentialEnergyProperty = new DerivedProperty(
      [
        this.angle1Property,
        this.angle2Property,
        this.mass1Property,
        this.mass2Property,
        this.length1Property,
        this.length2Property,
        this.gravityProperty,
      ],
      (theta1, theta2, m1, m2, L1, L2, g) => {
        const y1 = -L1 * Math.cos(theta1);
        const y2 = y1 - L2 * Math.cos(theta2);
        return (m1 + m2) * g * y1 + m2 * g * y2;
      }
    );

    // Total energy = KE + PE
    this.totalEnergyProperty = new DerivedProperty(
      [this.kineticEnergyProperty, this.potentialEnergyProperty],
      (ke, pe) => ke + pe
    );

    // Initialize state mapper with properties in state order
    this.stateMapper = new StatePropertyMapper([
      this.angle1Property,
      this.angularVelocity1Property,
      this.angle2Property,
      this.angularVelocity2Property,
    ]);
  }

  /**
   * Get the current state vector for physics integration.
   * @returns [angle1, angularVelocity1, angle2, angularVelocity2]
   */
  protected getState(): number[] {
    return this.stateMapper.getState();
  }

  /**
   * Update the model's properties from the state vector after integration.
   * @param state - [angle1, angularVelocity1, angle2, angularVelocity2]
   */
  protected setState(state: number[]): void {
    this.stateMapper.setState(state);
  }

  /**
   * Compute derivatives for the double pendulum system.
   * These are the coupled nonlinear equations derived from Lagrangian mechanics.
   */
  protected getDerivatives(
    state: number[],
    derivatives: number[],
    _: number,
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

  /**
   * Reset the model to initial conditions.
   */
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
    this.resetCommon(); // Reset time-related properties from base class
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('DoublePendulumModel', DoublePendulumModel);
