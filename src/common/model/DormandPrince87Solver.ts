/**
 * Dormand-Prince 8(7) adaptive solver - very high accuracy 8th order method.
 *
 * This solver uses an 8th order Runge-Kutta method with an embedded 7th order
 * solution for error estimation. It requires 13 function evaluations per step
 * and is one of the most accurate general-purpose ODE solvers available.
 *
 * Reference: Dormand, J.R., and Prince, P.J. (1981).
 * "High order embedded Runge-Kutta formulae"
 * Journal of Computational and Applied Mathematics, 7(1), 67-75.
 *
 * Benefits:
 * - Very high accuracy (8th order)
 * - Automatic step size control
 * - Excellent for smooth, well-behaved problems
 * - Efficient for problems requiring high precision
 *
 * Best used for: Smooth dynamics, high-precision calculations, and problems
 * where accuracy is more important than speed.
 */

import { ODESolver, DerivativeFunction } from "./ODESolver.js";

export class DormandPrince87Solver implements ODESolver {
  // Temporary arrays for the 13 stages
  private k1: number[] = [];
  private k2: number[] = [];
  private k3: number[] = [];
  private k4: number[] = [];
  private k5: number[] = [];
  private k6: number[] = [];
  private k7: number[] = [];
  private k8: number[] = [];
  private k9: number[] = [];
  private k10: number[] = [];
  private k11: number[] = [];
  private k12: number[] = [];
  private k13: number[] = [];
  private tempState: number[] = [];
  private error: number[] = [];

  // Solver parameters
  private fixedTimeStep: number = 0.001;
  private tolerance: number = 1e-8; // Very tight tolerance for high accuracy
  private minStepSize: number = 1e-8;
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
   * Perform one Dormand-Prince 8(7) step with error estimation.
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
      this.k3 = new Array(n);
      this.k4 = new Array(n);
      this.k5 = new Array(n);
      this.k6 = new Array(n);
      this.k7 = new Array(n);
      this.k8 = new Array(n);
      this.k9 = new Array(n);
      this.k10 = new Array(n);
      this.k11 = new Array(n);
      this.k12 = new Array(n);
      this.k13 = new Array(n);
      this.tempState = new Array(n);
      this.error = new Array(n);
    }

    // Dormand-Prince 8(7) coefficients
    // Stage 1: k1 = f(t, y)
    derivativeFn(state, this.k1, time);

    // Stage 2: k2 = f(t + dt/18, y + dt*k1/18)
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * this.k1[i] / 18;
    }
    derivativeFn(this.tempState, this.k2, time + dt / 18);

    // Stage 3: k3 = f(t + dt/12, y + dt*(k1/48 + k2/16))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (this.k1[i] / 48 + this.k2[i] / 16);
    }
    derivativeFn(this.tempState, this.k3, time + dt / 12);

    // Stage 4: k4 = f(t + dt/8, y + dt*(k1/32 + 3*k3/32))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (this.k1[i] / 32 + 3 * this.k3[i] / 32);
    }
    derivativeFn(this.tempState, this.k4, time + dt / 8);

    // Stage 5: k5 = f(t + 5*dt/16, y + dt*(5*k1/16 - 75*k3/64 + 75*k4/64))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (5 * this.k1[i] / 16 - 75 * this.k3[i] / 64 + 75 * this.k4[i] / 64);
    }
    derivativeFn(this.tempState, this.k5, time + 5 * dt / 16);

    // Stage 6: k6 = f(t + 3*dt/8, y + dt*(3*k1/80 + 3*k4/16 + 3*k5/20))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (3 * this.k1[i] / 80 + 3 * this.k4[i] / 16 + 3 * this.k5[i] / 20);
    }
    derivativeFn(this.tempState, this.k6, time + 3 * dt / 8);

    // Stage 7: k7 = f(t + 59*dt/400, y + dt*(29443841*k1/614563906 + ...))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (
        29443841 * this.k1[i] / 614563906 +
        77736538 * this.k4[i] / 692538347 -
        28693883 * this.k5[i] / 1125000000 +
        23124283 * this.k6[i] / 1800000000
      );
    }
    derivativeFn(this.tempState, this.k7, time + 59 * dt / 400);

    // Stage 8: k8 = f(t + 93*dt/200, y + dt*(...))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (
        16016141 * this.k1[i] / 946692911 +
        61564180 * this.k4[i] / 158732637 +
        22789713 * this.k5[i] / 633445777 +
        545815736 * this.k6[i] / 2771057229 -
        180193667 * this.k7[i] / 1043307555
      );
    }
    derivativeFn(this.tempState, this.k8, time + 93 * dt / 200);

    // Stage 9: k9 = f(t + 5490023248*dt/9719169821, y + dt*(...))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (
        39632708 * this.k1[i] / 573591083 -
        433636366 * this.k4[i] / 683701615 -
        421739975 * this.k5[i] / 2616292301 +
        100302831 * this.k6[i] / 723423059 +
        790204164 * this.k7[i] / 839813087 +
        800635310 * this.k8[i] / 3783071287
      );
    }
    derivativeFn(this.tempState, this.k9, time + 5490023248 * dt / 9719169821);

    // Stage 10: k10 = f(t + 13*dt/20, y + dt*(...))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (
        246121993 * this.k1[i] / 1340847787 -
        37695042795 * this.k4[i] / 15268766246 -
        309121744 * this.k5[i] / 1061227803 -
        12992083 * this.k6[i] / 490766935 +
        6005943493 * this.k7[i] / 2108947869 +
        393006217 * this.k8[i] / 1396673457 +
        123872331 * this.k9[i] / 1001029789
      );
    }
    derivativeFn(this.tempState, this.k10, time + 13 * dt / 20);

    // Stage 11: k11 = f(t + 1201146811*dt/1299019798, y + dt*(...))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (
        -1028468189 * this.k1[i] / 846180014 +
        8478235783 * this.k4[i] / 508512852 +
        1311729495 * this.k5[i] / 1432422823 -
        10304129995 * this.k6[i] / 1701304382 -
        48777925059 * this.k7[i] / 3047939560 +
        15336726248 * this.k8[i] / 1032824649 -
        45442868181 * this.k9[i] / 3398467696 +
        3065993473 * this.k10[i] / 597172653
      );
    }
    derivativeFn(this.tempState, this.k11, time + 1201146811 * dt / 1299019798);

    // Stage 12: k12 = f(t + dt, y + dt*(...))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (
        185892177 * this.k1[i] / 718116043 -
        3185094517 * this.k4[i] / 667107341 -
        477755414 * this.k5[i] / 1098053517 -
        703635378 * this.k6[i] / 230739211 +
        5731566787 * this.k7[i] / 1027545527 +
        5232866602 * this.k8[i] / 850066563 -
        4093664535 * this.k9[i] / 808688257 +
        3962137247 * this.k10[i] / 1805957418 +
        65686358 * this.k11[i] / 487910083
      );
    }
    derivativeFn(this.tempState, this.k12, time + dt);

    // Stage 13: k13 = f(t + dt, y + dt*(...))
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + dt * (
        403863854 * this.k1[i] / 491063109 -
        5068492393 * this.k4[i] / 434740067 -
        411421997 * this.k5[i] / 543043805 +
        652783627 * this.k6[i] / 914296604 +
        11173962825 * this.k7[i] / 925320556 -
        13158990841 * this.k8[i] / 6184727034 +
        3936647629 * this.k9[i] / 1978049680 -
        160528059 * this.k10[i] / 685178525 +
        248638103 * this.k11[i] / 1413531060
      );
    }
    derivativeFn(this.tempState, this.k13, time + dt);

    // 8th order solution
    const state8 = new Array(n);
    for (let i = 0; i < n; i++) {
      state8[i] = state[i] + dt * (
        14005451 * this.k1[i] / 335480064 -
        59238493 * this.k6[i] / 1068277825 +
        181606767 * this.k7[i] / 758867731 +
        561292985 * this.k8[i] / 797845732 -
        1041891430 * this.k9[i] / 1371343529 +
        760417239 * this.k10[i] / 1151165299 +
        118820643 * this.k11[i] / 751138087 -
        528747749 * this.k12[i] / 2220607170 +
        this.k13[i] / 4
      );
    }

    // 7th order solution for error estimation
    const state7 = new Array(n);
    for (let i = 0; i < n; i++) {
      state7[i] = state[i] + dt * (
        13451932 * this.k1[i] / 455176623 -
        808719846 * this.k6[i] / 976000145 +
        1757004468 * this.k7[i] / 5645159321 +
        656045339 * this.k8[i] / 265891186 -
        3867574721 * this.k9[i] / 1518517206 +
        465885868 * this.k10[i] / 322736535 +
        53011238 * this.k11[i] / 667516719 +
        2 * this.k12[i] / 45
      );
    }

    // Estimate error
    let maxError = 0;
    for (let i = 0; i < n; i++) {
      this.error[i] = Math.abs(state8[i] - state7[i]);
      maxError = Math.max(maxError, this.error[i]);
    }

    return { error: maxError, newState: state8 };
  }

  /**
   * Perform adaptive Dormand-Prince 8(7) integration.
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
