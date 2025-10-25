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
  BooleanProperty,
  EnumerationProperty,
} from "scenerystack/axon";
import { RungeKuttaSolver } from "../../common/model/RungeKuttaSolver.js";
import { TimeSpeed } from "scenerystack/scenery-phet";

export class SingleSpringModel {
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

  // Time control properties
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  private readonly solver: RungeKuttaSolver;
  public readonly timeProperty: NumberProperty;

  public constructor() {
    // Initialize time
    this.timeProperty = new NumberProperty(0.0); // seconds

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

    // Time control properties
    this.isPlayingProperty = new BooleanProperty(true);
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

    this.solver = new RungeKuttaSolver();
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
    this.timeProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
  }

  /**
   * Step the simulation forward in time.
   * The solver automatically sub-steps for accuracy.
   * @param dt - Time step in seconds
   */
  public step(dt: number): void {
    // Only step if playing
    if (!this.isPlayingProperty.value) {
      return;
    }

    // Apply time speed multiplier
    const timeSpeedMultiplier = this.getTimeSpeedMultiplier();
    const adjustedDt = dt * timeSpeedMultiplier;

    // State vector: [position, velocity]
    const state = [this.positionProperty.value, this.velocityProperty.value];

    // Use RK4 solver with automatic sub-stepping
    const newTime = this.solver.step(
      state,
      this.getDerivatives.bind(this),
      this.timeProperty.value,
      adjustedDt
    );

    // Update properties
    this.positionProperty.value = state[0];
    this.velocityProperty.value = state[1];
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
   * Compute derivatives for the ODE solver.
   * Implements: x' = v, v' = (-k*x - b*v) / m
   */
  private getDerivatives(
    state: number[],
    derivatives: number[],
    _time: number,
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
}
