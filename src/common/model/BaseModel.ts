/**
 * Base model class for all physics simulations.
 * Provides common functionality for time control, stepping, and physics integration.
 */

import {
  NumberProperty,
  BooleanProperty,
  EnumerationProperty,
} from "scenerystack/axon";
import { RungeKuttaSolver, type DerivativeFunction } from "./RungeKuttaSolver.js";
import { TimeSpeed } from "scenerystack/scenery-phet";

/**
 * Abstract base class that all physics models should extend.
 * Handles time management, play/pause state, and physics stepping.
 */
export abstract class BaseModel {
  // Time control properties (common to all simulations)
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;
  public readonly timeProperty: NumberProperty;

  // Physics solver
  protected readonly solver: RungeKuttaSolver;

  protected constructor() {
    // Initialize time control properties
    this.timeProperty = new NumberProperty(0.0); // seconds
    this.isPlayingProperty = new BooleanProperty(true);
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

    // Create physics solver
    this.solver = new RungeKuttaSolver();
  }

  /**
   * Reset time-related properties to their initial values.
   * Subclasses should override and call super.resetCommon() to also reset their specific properties.
   */
  protected resetCommon(): void {
    this.timeProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
  }

  /**
   * Step the simulation forward (or backward) in time.
   * This method handles the common stepping logic including play/pause state and time speed.
   *
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

    // Get the current state from the subclass
    const state = this.getState();

    // Use RK4 solver with automatic sub-stepping
    const newTime = this.solver.step(
      state,
      this.getDerivatives.bind(this),
      this.timeProperty.value,
      adjustedDt,
    );

    // Update the state in the subclass
    this.setState(state);

    // Update time
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
   * Get the current state vector for physics integration.
   * Subclasses must implement this to return their state variables.
   *
   * @returns Array of state variables (e.g., [position, velocity])
   */
  protected abstract getState(): number[];

  /**
   * Update the model's properties from the state vector after integration.
   * Subclasses must implement this to update their properties.
   *
   * @param state - Array of state variables after integration
   */
  protected abstract setState(state: number[]): void;

  /**
   * Compute derivatives for the ODE solver.
   * Subclasses must implement this to define their physics equations.
   *
   * @param state - Current state vector
   * @param derivatives - Output array for derivatives
   * @param time - Current time
   */
  protected abstract getDerivatives(
    state: number[],
    derivatives: number[],
    time: number,
  ): void;

  /**
   * Reset the model to initial conditions.
   * Subclasses must implement this to reset all their properties.
   */
  public abstract reset(): void;
}
