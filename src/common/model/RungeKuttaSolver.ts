/**
 * Fourth-order Runge-Kutta numerical integration solver.
 * Adapted from myphysicslab's RungeKutta implementation.
 *
 * This solver is used to integrate ordinary differential equations (ODEs) of the form:
 * dy/dt = f(t, y)
 *
 * Where y is the state vector and f is the derivative function.
 *
 * The solver uses fixed timesteps for better numerical stability and can automatically
 * sub-step when the requested timestep is larger than the fixed timestep.
 */

export type DerivativeFunction = (
  state: number[],
  derivatives: number[],
  time: number,
) => void;

export class RungeKuttaSolver {
  // Temporary arrays to avoid reallocation
  private k1: number[] = [];
  private k2: number[] = [];
  private k3: number[] = [];
  private k4: number[] = [];
  private tempState: number[] = [];

  // Fixed timestep for numerical integration (in seconds)
  // Smaller values = more accurate but slower
  private fixedTimeStep: number = 0.001; // 10ms default

  /**
   * Set the fixed timestep for integration.
   * Smaller values provide more accuracy but require more computation.
   * @param dt - Fixed timestep in seconds (default 0.01)
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
   * Perform one step of RK4 integration with a fixed timestep.
   * This is the low-level method that performs a single RK4 step.
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

    // Ensure arrays are large enough
    if (this.k1.length < n) {
      this.k1 = new Array(n);
      this.k2 = new Array(n);
      this.k3 = new Array(n);
      this.k4 = new Array(n);
      this.tempState = new Array(n);
    }

    // k1 = f(t, y)
    derivativeFn(state, this.k1, time);

    // k2 = f(t + dt/2, y + k1*dt/2)
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + (this.k1[i] * dt) / 2;
    }
    derivativeFn(this.tempState, this.k2, time + dt / 2);

    // k3 = f(t + dt/2, y + k2*dt/2)
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + (this.k2[i] * dt) / 2;
    }
    derivativeFn(this.tempState, this.k3, time + dt / 2);

    // k4 = f(t + dt, y + k3*dt)
    for (let i = 0; i < n; i++) {
      this.tempState[i] = state[i] + this.k3[i] * dt;
    }
    derivativeFn(this.tempState, this.k4, time + dt);

    // y_new = y + (k1 + 2*k2 + 2*k3 + k4) * dt/6
    for (let i = 0; i < n; i++) {
      state[i] +=
        ((this.k1[i] + 2 * this.k2[i] + 2 * this.k3[i] + this.k4[i]) * dt) / 6;
    }
  }

  /**
   * Perform RK4 integration for a variable timestep by taking multiple fixed steps.
   * This allows the physics to run at a fixed timestep independent of the frame rate.
   *
   * For example, if dt=0.05 and fixedTimeStep=0.01, this will take 5 substeps.
   *
   * @param state - Current state vector (will be modified in place)
   * @param derivativeFn - Function that computes derivatives
   * @param time - Current time (will be updated)
   * @param dt - Requested time step (can be larger or smaller than fixedTimeStep)
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

  /**
   * Legacy method for backward compatibility.
   * Takes a single step with the exact dt provided (no sub-stepping).
   *
   * @deprecated Use step() instead, which handles sub-stepping automatically
   */
  public stepExact(
    state: number[],
    derivativeFn: DerivativeFunction,
    time: number,
    dt: number,
  ): void {
    this.stepOnce(state, derivativeFn, time, dt);
  }
}
