/**
 * Model for two masses connected by springs in series.
 *
 * Physics:
 * - Mass 1: m1 * a1 = -k1 * x1 + k2 * (x2 - x1) - b1 * v1
 * - Mass 2: m2 * a2 = -k2 * (x2 - x1) - b2 * v2
 *
 * State variables:
 * - position1 (x1), velocity1 (v1)
 * - position2 (x2), velocity2 (v2)
 */

import {
  NumberProperty,
  DerivedProperty,
  type TReadOnlyProperty,
  BooleanProperty,
  EnumerationProperty,
} from "scenerystack/axon";
import { RungeKuttaSolver } from "../../common/model/RungeKuttaSolver.js";
import { TimeSpeed } from "scenerystack/scenery-phet";

export class DoubleSpringModel {
  // State variables for mass 1
  public readonly position1Property: NumberProperty;
  public readonly velocity1Property: NumberProperty;

  // State variables for mass 2
  public readonly position2Property: NumberProperty;
  public readonly velocity2Property: NumberProperty;

  // Physics parameters
  public readonly mass1Property: NumberProperty;
  public readonly mass2Property: NumberProperty;
  public readonly springConstant1Property: NumberProperty;
  public readonly springConstant2Property: NumberProperty;
  public readonly damping1Property: NumberProperty;
  public readonly damping2Property: NumberProperty;

  // Computed values
  public readonly totalEnergyProperty: TReadOnlyProperty<number>;

  // Time control properties
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  private readonly solver: RungeKuttaSolver;
  public readonly timeProperty: NumberProperty;

  public constructor() {
    // Initialize time
    this.timeProperty = new NumberProperty(0.0); // seconds

    // Initialize state
    this.position1Property = new NumberProperty(1.5); // meters
    this.velocity1Property = new NumberProperty(0.0); // m/s
    this.position2Property = new NumberProperty(3.0); // meters
    this.velocity2Property = new NumberProperty(0.0); // m/s

    // Initialize parameters
    this.mass1Property = new NumberProperty(1.0); // kg
    this.mass2Property = new NumberProperty(1.0); // kg
    this.springConstant1Property = new NumberProperty(10.0); // N/m
    this.springConstant2Property = new NumberProperty(10.0); // N/m
    this.damping1Property = new NumberProperty(0.1); // N*s/m
    this.damping2Property = new NumberProperty(0.1); // N*s/m

    // Compute total energy
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
      ],
      (v1, v2, x1, x2, m1, m2, k1, k2) => {
        const ke1 = 0.5 * m1 * v1 * v1;
        const ke2 = 0.5 * m2 * v2 * v2;
        const pe1 = 0.5 * k1 * x1 * x1;
        const pe2 = 0.5 * k2 * (x2 - x1) * (x2 - x1);
        return ke1 + ke2 + pe1 + pe2;
      },
    );

    // Time control properties
    this.isPlayingProperty = new BooleanProperty(true);
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

    this.solver = new RungeKuttaSolver();
  }

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
    this.timeProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
  }

  public step(dt: number): void {
    // Only step if playing
    if (!this.isPlayingProperty.value) {
      return;
    }

    // Apply time speed multiplier
    const timeSpeedMultiplier = this.getTimeSpeedMultiplier();
    const adjustedDt = dt * timeSpeedMultiplier;

    // State vector: [x1, v1, x2, v2]
    const state = [
      this.position1Property.value,
      this.velocity1Property.value,
      this.position2Property.value,
      this.velocity2Property.value,
    ];

    // Use RK4 solver with automatic sub-stepping
    const newTime = this.solver.step(
      state,
      this.getDerivatives.bind(this),
      this.timeProperty.value,
      adjustedDt,
    );

    // Update properties
    this.position1Property.value = state[0];
    this.velocity1Property.value = state[1];
    this.position2Property.value = state[2];
    this.velocity2Property.value = state[3];
    this.timeProperty.value = newTime;
  }

  /**
   * Get the time speed multiplier based on the current time speed setting.
   */
  private getTimeSpeedMultiplier(): number {
    const timeSpeed = this.timeSpeedProperty.value;
    if (timeSpeed === TimeSpeed.SLOW) {
      return 0.5;
    } else if (timeSpeed === TimeSpeed.FAST) {
      return 2.0;
    } else {
      return 1.0; // NORMAL
    }
  }

  /**
   * Set the fixed timestep for the physics solver.
   * @param dt - Fixed timestep in seconds
   */
  public setPhysicsTimeStep(dt: number): void {
    this.solver.setFixedTimeStep(dt);
  }

  /**
   * Get the current physics timestep.
   */
  public getPhysicsTimeStep(): number {
    return this.solver.getFixedTimeStep();
  }

  /**
   * Compute derivatives for coupled spring system.
   */
  private getDerivatives(
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

    // dx1/dt = v1
    derivatives[0] = v1;

    // dv1/dt = (-k1*x1 + k2*(x2 - x1) - b1*v1) / m1
    derivatives[1] = (-k1 * x1 + k2 * (x2 - x1) - b1 * v1) / m1;

    // dx2/dt = v2
    derivatives[2] = v2;

    // dv2/dt = (-k2*(x2 - x1) - b2*v2) / m2
    derivatives[3] = (-k2 * (x2 - x1) - b2 * v2) / m2;
  }
}
