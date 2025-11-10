/**
 * Base model class for all physics simulations.
 * Provides common functionality for time control, stepping, and physics integration.
 */

import {
  NumberProperty,
  BooleanProperty,
  EnumerationProperty,
} from "scenerystack/axon";
import { ODESolver } from "./ODESolver.js";
import { RungeKuttaSolver } from "./RungeKuttaSolver.js";
import { AdaptiveRK45Solver } from "./AdaptiveRK45Solver.js";
import { AdaptiveEulerSolver } from "./AdaptiveEulerSolver.js";
import { ModifiedMidpointSolver } from "./ModifiedMidpointSolver.js";
import { ForestRuthPEFRLSolver } from "./ForestRuthPEFRLSolver.js";
import { DormandPrince87Solver } from "./DormandPrince87Solver.js";
import SolverType from "./SolverType.js";
import NominalTimeStep from "./NominalTimeStep.js";
import { TimeSpeed } from "scenerystack/scenery-phet";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";

/**
 * Abstract base class that all physics models should extend.
 * Handles time management, play/pause state, and physics stepping.
 */
export abstract class BaseModel {
  // Time control properties (common to all simulations)
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;
  public readonly timeProperty: NumberProperty;

  // Physics solver (can be swapped based on preference)
  protected solver: ODESolver;

  protected constructor() {
    // Initialize time control properties
    this.timeProperty = new NumberProperty(0.0); // seconds
    this.isPlayingProperty = new BooleanProperty(true);
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

    // Create initial physics solver based on preference
    this.solver = this.createSolver(ClassicalMechanicsPreferences.solverTypeProperty.value);

    // Listen for solver type changes and recreate solver
    ClassicalMechanicsPreferences.solverTypeProperty.link((solverType: SolverType) => {
      this.solver = this.createSolver(solverType);
    });

    // Listen for nominal time step changes and update the solver
    ClassicalMechanicsPreferences.nominalTimeStepProperty.link((nominalTimeStep: NominalTimeStep) => {
      this.solver.setFixedTimeStep(nominalTimeStep.value);
    });
  }

  /**
   * Create a solver instance based on the solver type.
   */
  private createSolver(solverType: SolverType): ODESolver {
    let solver: ODESolver;

    if (solverType === SolverType.RK4) {
      solver = new RungeKuttaSolver();
    } else if (solverType === SolverType.ADAPTIVE_RK45) {
      solver = new AdaptiveRK45Solver();
    } else if (solverType === SolverType.ADAPTIVE_EULER) {
      solver = new AdaptiveEulerSolver();
    } else if (solverType === SolverType.MODIFIED_MIDPOINT) {
      solver = new ModifiedMidpointSolver();
    } else if (solverType === SolverType.FOREST_RUTH_PEFRL) {
      solver = new ForestRuthPEFRLSolver();
    } else if (solverType === SolverType.DORMAND_PRINCE_87) {
      solver = new DormandPrince87Solver();
    } else {
      // Default to RK4
      solver = new RungeKuttaSolver();
    }

    // Apply the current nominal time step preference
    solver.setFixedTimeStep(ClassicalMechanicsPreferences.nominalTimeStepProperty.value.value);

    return solver;
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

    // Cap dt to prevent large jumps when user switches tabs or browser loses focus
    // This prevents physics instabilities and large gaps in graphs
    const MAX_DT = 0.1; // 100ms maximum
    const cappedDt = Math.min(Math.abs(dt), MAX_DT) * Math.sign(dt);

    // Apply time speed multiplier (only when auto-playing, not for manual steps)
    const timeSpeedMultiplier = forceStep
      ? 1.0
      : this.getTimeSpeedMultiplier();
    const adjustedDt = cappedDt * timeSpeedMultiplier;

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
