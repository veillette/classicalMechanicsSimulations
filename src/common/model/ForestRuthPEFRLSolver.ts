/**
 * Position Extended Forest-Ruth Like (PEFRL) solver - optimized 4th order symplectic integrator.
 *
 * This solver is specifically designed for Hamiltonian systems and provides excellent energy
 * conservation properties. It uses carefully chosen coefficients to minimize energy drift
 * over long integration periods.
 *
 * Reference: Omelyan, I.P., Mryglod, I.M., and Folk, R. (2002).
 * "Optimized Forest-Ruth- and Suzuki-like algorithms for integration of motion in many-body systems"
 * Computer Physics Communications, 146, 188-202.
 *
 * Benefits:
 * - Minimal energy error for Hamiltonian systems
 * - 4th order accurate
 * - Excellent long-term stability
 * - Fixed timestep method optimized for oscillatory systems
 *
 * Best used for: Spring systems, pendulums, orbital mechanics, and other conservative systems.
 */

import { ODESolver, DerivativeFunction } from "./ODESolver.js";
import classicalMechanics from '../../ClassicalMechanicsNamespace.js';

export class ForestRuthPEFRLSolver implements ODESolver {
  // PEFRL coefficients optimized for minimal energy error
  private static readonly XI = 0.1786178958448091;
  private static readonly LAMBDA = -0.2123418310626054;
  private static readonly CHI = -0.06626458266981849;

  // Temporary arrays to avoid reallocation
  private derivatives: number[] = [];
  private tempState: number[] = [];

  // Fixed timestep for numerical integration (in seconds)
  private fixedTimeStep: number = 0.001; // 1ms default

  /**
   * Set the fixed timestep for integration.
   * @param dt - Fixed timestep in seconds
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
   * Perform one step of PEFRL integration.
   * This method assumes the state vector is organized as [positions..., velocities...]
   * for proper symplectic integration.
   *
   * @param state - Current state vector (will be modified in place)
   * @param derivativeFn - Function that computes derivatives
   * @param time - Current time
   * @param dt - Time step
   */
  private stepOnce(
    state: number[],
    derivativeFn: DerivativeFunction,
    time: number,
    dt: number,
  ): void {
    const n = state.length;
    const halfN = Math.floor(n / 2);

    // Ensure arrays are large enough
    if (this.derivatives.length < n) {
      this.derivatives = new Array(n);
      this.tempState = new Array(n);
    }

    // Copy initial state
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i];
    }

    // PEFRL algorithm - optimized 4-stage symplectic integrator
    // Stage 1: Position update with ξ
    derivativeFn(this.tempState, this.derivatives, time);
    for (let i = 0; i < halfN; i++) {
      this.tempState[i] += ForestRuthPEFRLSolver.XI * dt * this.derivatives[i];
    }

    // Stage 2: Velocity update with (1 - 2λ)/2
    derivativeFn(this.tempState, this.derivatives, time + ForestRuthPEFRLSolver.XI * dt);
    const coeff1 = (1 - 2 * ForestRuthPEFRLSolver.LAMBDA) / 2;
    for (let i = 0; i < halfN; i++) {
      this.tempState[halfN + i] += coeff1 * dt * this.derivatives[halfN + i];
    }

    // Stage 3: Position update with χ
    for (let i = 0; i < halfN; i++) {
      this.tempState[i] += ForestRuthPEFRLSolver.CHI * dt * this.tempState[halfN + i];
    }

    // Stage 4: Velocity update with λ
    const time2 = time + (ForestRuthPEFRLSolver.XI + ForestRuthPEFRLSolver.CHI) * dt;
    derivativeFn(this.tempState, this.derivatives, time2);
    for (let i = 0; i < halfN; i++) {
      this.tempState[halfN + i] += ForestRuthPEFRLSolver.LAMBDA * dt * this.derivatives[halfN + i];
    }

    // Stage 5: Position update with (1 - 2(χ + ξ))
    const coeff2 = 1 - 2 * (ForestRuthPEFRLSolver.CHI + ForestRuthPEFRLSolver.XI);
    for (let i = 0; i < halfN; i++) {
      this.tempState[i] += coeff2 * dt * this.tempState[halfN + i];
    }

    // Stage 6: Velocity update with λ
    const time3 = time + (1 - ForestRuthPEFRLSolver.CHI - ForestRuthPEFRLSolver.XI) * dt;
    derivativeFn(this.tempState, this.derivatives, time3);
    for (let i = 0; i < halfN; i++) {
      this.tempState[halfN + i] += ForestRuthPEFRLSolver.LAMBDA * dt * this.derivatives[halfN + i];
    }

    // Stage 7: Position update with χ
    for (let i = 0; i < halfN; i++) {
      this.tempState[i] += ForestRuthPEFRLSolver.CHI * dt * this.tempState[halfN + i];
    }

    // Stage 8: Velocity update with (1 - 2λ)/2
    const time4 = time + (1 - ForestRuthPEFRLSolver.XI) * dt;
    derivativeFn(this.tempState, this.derivatives, time4);
    for (let i = 0; i < halfN; i++) {
      this.tempState[halfN + i] += coeff1 * dt * this.derivatives[halfN + i];
    }

    // Stage 9: Final position update with ξ
    for (let i = 0; i < halfN; i++) {
      this.tempState[i] += ForestRuthPEFRLSolver.XI * dt * this.tempState[halfN + i];
    }

    // Copy result back to state
    for (let i = 0; i < n; i++) {
      state[i] = this.tempState[i];
    }
  }

  /**
   * Perform PEFRL integration for a variable timestep by taking multiple fixed steps.
   *
   * @param state - Current state vector (will be modified in place)
   * @param derivativeFn - Function that computes derivatives
   * @param time - Current time
   * @param dt - Requested time step
   * @returns The new time after integration
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

// Register with namespace for debugging accessibility
classicalMechanics.register('ForestRuthPEFRLSolver', ForestRuthPEFRLSolver);
