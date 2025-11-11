/**
 * Adaptive Runge-Kutta-Fehlberg (RK45) solver with automatic step size control.
 *
 * This solver uses the Cash-Karp variant of RK45, which provides embedded 4th and 5th order
 * formulas. The difference between these solutions is used to estimate the local truncation
 * error and automatically adjust the step size to maintain accuracy within tolerance.
 *
 * Algorithm Details:
 * - Uses 6 function evaluations per step
 * - Provides embedded 4th and 5th order solutions
 * - Error estimate: |y5 - y4| where y5 is 5th order, y4 is 4th order
 * - Step size adaptation: increases when error < tolerance/10, decreases when error > tolerance
 * - Safety bounds: minStepSize ≤ dt ≤ maxStepSize
 *
 * Benefits:
 * - More efficient than fixed-step RK4 for smooth solutions (fewer steps needed)
 * - Automatically adapts to solution behavior (increases dt in smooth regions)
 * - Maintains accuracy without manual tuning of timestep
 * - Provides error estimate for monitoring numerical accuracy
 *
 * Trade-offs:
 * - More complex than fixed-step methods
 * - Overhead of error computation and step size adjustment
 * - May not be ideal for highly oscillatory or chaotic systems
 *
 * @author Martin Veillette (PhET Interactive Simulations)
 */

import { assert } from "scenerystack";
import { ODESolver, DerivativeFunction } from "./ODESolver.js";
import classicalMechanics from '../../ClassicalMechanicsNamespace.js';

export class AdaptiveRK45Solver implements ODESolver {
  // Temporary arrays to avoid reallocation
  private k1: number[] = [];
  private k2: number[] = [];
  private k3: number[] = [];
  private k4: number[] = [];
  private k5: number[] = [];
  private k6: number[] = [];
  private tempState: number[] = [];
  private error: number[] = [];

  // Default timestep and tolerance
  private fixedTimeStep: number = 0.01;
  private tolerance: number = 1e-6;
  private minStepSize: number = 1e-6;
  private maxStepSize: number = 0.1;

  /**
   * Set the initial/maximum timestep for integration.
   * @param dt - Time step in seconds (must be positive and finite)
   */
  public setFixedTimeStep(dt: number): void {
    assert && assert(isFinite(dt) && dt > 0, 'dt must be finite and positive');
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
   * Perform one RK45 step with error estimation.
   * Uses Cash-Karp coefficients for embedded 4th/5th order formulas.
   *
   * @param state - Current state vector
   * @param derivativeFn - Function to compute derivatives
   * @param time - Current time
   * @param dt - Step size to attempt
   * @returns Object containing error estimate and new state (5th order solution)
   */
  private stepOnce(
    state: number[],
    derivativeFn: DerivativeFunction,
    time: number,
    dt: number,
  ): { error: number; newState: number[] } {
    // Validate inputs
    assert && assert(Array.isArray(state) && state.length > 0, 'state must be a non-empty array');
    assert && assert(state.every(v => isFinite(v)), 'all state values must be finite');
    assert && assert(isFinite(time), 'time must be finite');
    assert && assert(isFinite(dt) && dt !== 0, 'dt must be finite and non-zero');

    const n = state.length;

    // Ensure arrays are large enough
    if (this.k1.length < n) {
      this.k1 = new Array(n);
      this.k2 = new Array(n);
      this.k3 = new Array(n);
      this.k4 = new Array(n);
      this.k5 = new Array(n);
      this.k6 = new Array(n);
      this.tempState = new Array(n);
      this.error = new Array(n);
    }

    // Cash-Karp coefficients for RK45
    // k1 = f(t, y)
    derivativeFn(state, this.k1, time);

    // k2 = f(t + dt/5, y + k1*dt/5)
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + (this.k1[i] * dt) / 5;
    }
    derivativeFn(this.tempState, this.k2, time + dt / 5);

    // k3 = f(t + 3*dt/10, y + 3*k1*dt/40 + 9*k2*dt/40)
    for (let i = 0; i < n; i++) {
      this.tempState[i] =
        state[i] + ((3 * this.k1[i] + 9 * this.k2[i]) * dt) / 40;
    }
    derivativeFn(this.tempState, this.k3, time + (3 * dt) / 10);

    // k4 = f(t + 3*dt/5, y + 3*k1*dt/10 - 9*k2*dt/10 + 6*k3*dt/5)
    for (let i = 0; i < n; i++) {
      this.tempState[i] =
        state[i] + ((3 * this.k1[i] - 9 * this.k2[i] + 12 * this.k3[i]) * dt) / 10;
    }
    derivativeFn(this.tempState, this.k4, time + (3 * dt) / 5);

    // k5 = f(t + dt, y - 11*k1*dt/54 + 5*k2*dt/2 - 70*k3*dt/27 + 35*k4*dt/27)
    for (let i = 0; i < n; i++) {
      this.tempState[i] =
        state[i] +
        ((-11 * this.k1[i] + 135 * this.k2[i] - 140 * this.k3[i] + 70 * this.k4[i]) * dt) / 54;
    }
    derivativeFn(this.tempState, this.k5, time + dt);

    // k6 = f(t + 7*dt/8, y + 1631*k1*dt/55296 + 175*k2*dt/512 + 575*k3*dt/13824 + 44275*k4*dt/110592 + 253*k5*dt/4096)
    for (let i = 0; i < n; i++) {
      this.tempState[i] =
        state[i] +
        ((1631 * this.k1[i] / 55296 + 175 * this.k2[i] / 512 + 575 * this.k3[i] / 13824 +
          44275 * this.k4[i] / 110592 + 253 * this.k5[i] / 4096) * dt);
    }
    derivativeFn(this.tempState, this.k6, time + (7 * dt) / 8);

    // 4th order solution
    const state4 = new Array(n);
    for (let i = 0; i < n; i++) {
      state4[i] =
        state[i] +
        ((37 * this.k1[i] / 378 + 250 * this.k3[i] / 621 + 125 * this.k4[i] / 594 +
          512 * this.k6[i] / 1771) * dt);
    }

    // 5th order solution
    const state5 = new Array(n);
    for (let i = 0; i < n; i++) {
      state5[i] =
        state[i] +
        ((2825 * this.k1[i] / 27648 + 18575 * this.k3[i] / 48384 + 13525 * this.k4[i] / 55296 +
          277 * this.k5[i] / 14336 + this.k6[i] / 4) * dt);
    }

    // Estimate error (difference between 4th and 5th order solutions)
    let maxError = 0;
    for (let i = 0; i < n; i++) {
      this.error[i] = Math.abs(state5[i] - state4[i]);
      maxError = Math.max(maxError, this.error[i]);
    }

    // Validate computed results
    assert && assert(isFinite(maxError), 'computed error must be finite');
    assert && assert(state5.every(v => isFinite(v)), 'all computed state values must be finite');

    return { error: maxError, newState: state5 };
  }

  /**
   * Perform adaptive RK45 integration over the requested time interval.
   * Automatically subdivides the interval based on error estimates.
   *
   * Algorithm:
   * 1. Attempt a step with current step size
   * 2. Estimate local truncation error
   * 3. If error < tolerance: accept step, possibly increase step size
   * 4. If error > tolerance: reject step, decrease step size
   * 5. Repeat until full interval integrated
   *
   * @param state - State vector (modified in place)
   * @param derivativeFn - Function to compute derivatives
   * @param time - Initial time
   * @param dt - Time interval to integrate (can be negative for backward integration)
   * @returns Final time after integration
   */
  public step(
    state: number[],
    derivativeFn: DerivativeFunction,
    time: number,
    dt: number,
  ): number {
    // Validate inputs
    assert && assert(Array.isArray(state) && state.length > 0, 'state must be a non-empty array');
    assert && assert(state.every(v => isFinite(v)), 'all state values must be finite');
    assert && assert(isFinite(time), 'time must be finite');
    assert && assert(isFinite(dt) && dt !== 0, 'dt must be finite and non-zero');

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

// Register with namespace for debugging accessibility
classicalMechanics.register('AdaptiveRK45Solver', AdaptiveRK45Solver);
