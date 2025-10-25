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
  BooleanProperty,
  EnumerationProperty,
} from "scenerystack/axon";
import { RungeKuttaSolver } from "../../common/model/RungeKuttaSolver.js";
import { TimeSpeed } from "scenerystack/scenery-phet";

export class PendulumModel {
  // State variables
  public readonly angleProperty: NumberProperty;
  public readonly angularVelocityProperty: NumberProperty;
  public readonly timeProperty: NumberProperty;

  // Physics parameters
  public readonly lengthProperty: NumberProperty;
  public readonly massProperty: NumberProperty;
  public readonly gravityProperty: NumberProperty;
  public readonly dampingProperty: NumberProperty;

  // Computed values
  public readonly kineticEnergyProperty: TReadOnlyProperty<number>;
  public readonly potentialEnergyProperty: TReadOnlyProperty<number>;
  public readonly totalEnergyProperty: TReadOnlyProperty<number>;

  // Time control properties
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  private readonly solver: RungeKuttaSolver;

  public constructor() {
    // Initialize state (start at 45 degrees)
    this.angleProperty = new NumberProperty(Math.PI / 4); // radians
    this.angularVelocityProperty = new NumberProperty(0.0); // rad/s
    this.timeProperty = new NumberProperty(0.0); // seconds

    // Initialize parameters
    this.lengthProperty = new NumberProperty(2.0); // meters
    this.massProperty = new NumberProperty(1.0); // kg
    this.gravityProperty = new NumberProperty(9.8); // m/s²
    this.dampingProperty = new NumberProperty(0.1); // N*m*s

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

    // Time control properties
    this.isPlayingProperty = new BooleanProperty(true);
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

    this.solver = new RungeKuttaSolver();
  }

  public reset(): void {
    this.angleProperty.reset();
    this.angularVelocityProperty.reset();
    this.timeProperty.reset();
    this.lengthProperty.reset();
    this.massProperty.reset();
    this.gravityProperty.reset();
    this.dampingProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
  }

  /**
   * Step the simulation forward in time.
   * @param dt - Time step in seconds (can be negative for backward stepping)
   * @param forceStep - If true, step even when paused (for manual stepping)
   */
  public step(dt: number, forceStep: boolean = false): void {
    // Only step if playing (unless forced for manual stepping)
    if (!this.isPlayingProperty.value && !forceStep) {
      return;
    }

    // Apply time speed multiplier (only when auto-playing, not for manual steps)
    const timeSpeedMultiplier = forceStep
      ? 1.0
      : this.getTimeSpeedMultiplier();
    const adjustedDt = dt * timeSpeedMultiplier;

    // State vector: [angle, angularVelocity]
    const state = [
      this.angleProperty.value,
      this.angularVelocityProperty.value,
    ];

    // The solver will automatically sub-step if dt is larger than the fixed timestep
    // This ensures accurate physics regardless of frame rate
    const newTime = this.solver.step(
      state,
      this.getDerivatives.bind(this),
      this.timeProperty.value,
      adjustedDt,
    );

    // Update properties
    this.angleProperty.value = state[0];
    this.angularVelocityProperty.value = state[1];
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
   * Smaller values provide more accuracy but require more computation.
   * Default is 0.01 seconds (10ms).
   *
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
   * Compute derivatives for pendulum equations.
   * θ' = ω
   * ω' = -(g/L)*sin(θ) - (b/mL²)*ω
   */
  private getDerivatives(
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
}
