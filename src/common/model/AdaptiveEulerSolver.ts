/**
 * Adaptive Euler-Heun solver with automatic step size control.
 *
 * This solver uses both the explicit Euler method and the Heun (improved Euler) method
 * to estimate the error and automatically adjusts the timestep to maintain a specified tolerance.
 *
 * Benefits:
 * - Simpler and faster than RK45 for well-behaved systems
 * - Automatic step size adaptation
 * - Good for smooth, non-stiff problems
 */

import { ODESolver, DerivativeFunction } from "./ODESolver.js";

export class AdaptiveEulerSolver implements ODESolver {
  // Temporary arrays to avoid reallocation
  private k1: number[] = [];
  private k2: number[] = [];
  private tempState: number[] = [];
  private error: number[] = [];

  // Default timestep and tolerance
  private fixedTimeStep: number = 0.01;
  private tolerance: number = 1e-4;
  private minStepSize: number = 1e-6;
  private maxStepSize: number = 0.1;

  /**
   * Set the initial/maximum timestep for integration.
   */
  public setFixedTimeStep(dt: number): void {
    this.fixedTimeStep = dt;
    this.maxStepSize = dt;
  }

  /**
   * Get the current fixed timestep.
   */
  public getFixedTimeStep(): number {
    return this.fixedTimeStep;
  }

  /**
   * Perform one adaptive Euler-Heun step with error estimation.
   */
  private stepOnce(
    state: number[],
    derivativeFn: DerivativeFunction,
    time: number,
    dt: number,
  ): { error: number; newState: number[] } {
    const n = state.length;

    // Ensure arrays are large enough
    if (this.k1.length < n) {
      this.k1 = new Array(n);
      this.k2 = new Array(n);
      this.tempState = new Array(n);
      this.error = new Array(n);
    }

    // Explicit Euler: k1 = f(t, y)
    derivativeFn(state, this.k1, time);

    // Euler step: y_euler = y + k1*dt
    const stateEuler = new Array(n);
    for (let i = 0; i < n; i++) {
      stateEuler[i] = state[i] + this.k1[i] * dt;
    }

    // Heun method (improved Euler)
    // First, get derivative at end point: k2 = f(t + dt, y + k1*dt)
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + this.k1[i] * dt;
    }
    derivativeFn(this.tempState, this.k2, time + dt);

    // Heun step: y_heun = y + (k1 + k2)*dt/2
    const stateHeun = new Array(n);
    for (let i = 0; i < n; i++) {
      stateHeun[i] = state[i] + ((this.k1[i] + this.k2[i]) * dt) / 2;
    }

    // Estimate error (difference between Euler and Heun)
    let maxError = 0;
    for (let i = 0; i < n; i++) {
      this.error[i] = Math.abs(stateHeun[i] - stateEuler[i]);
      maxError = Math.max(maxError, this.error[i]);
    }

    // Return the more accurate Heun result
    return { error: maxError, newState: stateHeun };
  }

  /**
   * Perform adaptive Euler-Heun integration.
   */
  public step(
    state: number[],
    derivativeFn: DerivativeFunction,
    time: number,
    dt: number,
  ): number {
    let currentTime = time;
    let remainingTime = dt;
    let currentStepSize = Math.min(this.fixedTimeStep, dt);

    while (remainingTime > 0) {
      // Try a step
      const result = this.stepOnce(state, derivativeFn, currentTime, currentStepSize);

      // Check if error is acceptable
      if (result.error < this.tolerance || currentStepSize <= this.minStepSize) {
        // Accept the step
        for (let i = 0; i < state.length; i++) {
          state[i] = result.newState[i];
        }
        currentTime += currentStepSize;
        remainingTime -= currentStepSize;

        // Increase step size for next iteration if error is very small
        if (result.error < this.tolerance / 10) {
          currentStepSize = Math.min(currentStepSize * 1.5, this.maxStepSize);
        }
      } else {
        // Reject the step and reduce step size
        currentStepSize = Math.max(currentStepSize * 0.5, this.minStepSize);
      }

      // Don't overshoot the target time
      currentStepSize = Math.min(currentStepSize, remainingTime);
    }

    return currentTime;
  }
}
