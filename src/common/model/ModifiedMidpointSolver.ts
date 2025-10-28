/**
 * Modified Midpoint Method solver.
 *
 * This is a second-order accurate method that uses multiple substeps
 * with a modified midpoint rule. It's particularly effective for
 * oscillatory problems and has good stability properties.
 *
 * Benefits:
 * - Second-order accurate like RK2
 * - Good for oscillatory systems (springs, pendulums)
 * - Better stability than standard Euler
 * - Simpler than RK4 but more accurate than Euler
 */

import { ODESolver, DerivativeFunction } from "./ODESolver.js";

export class ModifiedMidpointSolver implements ODESolver {
  // Temporary arrays to avoid reallocation
  private derivatives: number[] = [];
  private tempState1: number[] = [];
  private tempState2: number[] = [];

  // Fixed timestep for numerical integration
  private fixedTimeStep: number = 0.01;

  // Number of substeps (higher = more accurate but slower)
  private numSubsteps: number = 4;

  /**
   * Set the fixed timestep for integration.
   */
  public setFixedTimeStep(dt: number): void {
    this.fixedTimeStep = dt;
  }

  /**
   * Get the current fixed timestep.
   */
  public getFixedTimeStep(): number {
    return this.fixedTimeStep;
  }

  /**
   * Set the number of substeps for the modified midpoint method.
   * Higher values give better accuracy but require more computation.
   */
  public setNumSubsteps(n: number): void {
    this.numSubsteps = Math.max(2, Math.floor(n));
  }

  /**
   * Perform one step of the modified midpoint method.
   */
  private stepOnce(
    state: number[],
    derivativeFn: DerivativeFunction,
    time: number,
    dt: number,
  ): void {
    const n = state.length;

    // Ensure arrays are large enough
    if (this.derivatives.length < n) {
      this.derivatives = new Array(n);
      this.tempState1 = new Array(n);
      this.tempState2 = new Array(n);
    }

    const h = dt / this.numSubsteps; // substep size

    // Initial step: z0 = y
    for (let i = 0; i < n; i++) {
      this.tempState1[i] = state[i];
    }

    // First substep: z1 = y + h*f(t, y)
    derivativeFn(state, this.derivatives, time);
    for (let i = 0; i < n; i++) {
      this.tempState2[i] = state[i] + h * this.derivatives[i];
    }

    // Subsequent substeps: z_{m+1} = z_{m-1} + 2h*f(t + m*h, z_m)
    for (let m = 1; m < this.numSubsteps; m++) {
      derivativeFn(this.tempState2, this.derivatives, time + m * h);
      for (let i = 0; i < n; i++) {
        const temp = this.tempState2[i];
        this.tempState2[i] = this.tempState1[i] + 2 * h * this.derivatives[i];
        this.tempState1[i] = temp;
      }
    }

    // Final smoothing step: y_{n+1} = (z_{n-1} + z_n + h*f(t + dt, z_n)) / 2
    derivativeFn(this.tempState2, this.derivatives, time + dt);
    for (let i = 0; i < n; i++) {
      state[i] = (this.tempState1[i] + this.tempState2[i] + h * this.derivatives[i]) / 2;
    }
  }

  /**
   * Perform integration with automatic sub-stepping.
   */
  public step(
    state: number[],
    derivativeFn: DerivativeFunction,
    time: number,
    dt: number,
  ): number {
    // Handle the case where dt is smaller than or equal to fixedTimeStep
    if (dt <= this.fixedTimeStep) {
      this.stepOnce(state, derivativeFn, time, dt);
      return time + dt;
    }

    // Take multiple fixed steps to cover the requested time interval
    let remainingTime = dt;
    let currentTime = time;

    while (remainingTime > 0) {
      const stepSize = Math.min(this.fixedTimeStep, remainingTime);
      this.stepOnce(state, derivativeFn, currentTime, stepSize);
      currentTime += stepSize;
      remainingTime -= stepSize;
    }

    return currentTime;
  }
}
