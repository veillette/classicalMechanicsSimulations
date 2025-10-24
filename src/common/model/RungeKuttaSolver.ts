/**
 * Fourth-order Runge-Kutta numerical integration solver.
 * Adapted from myphysicslab's RungeKutta implementation.
 *
 * This solver is used to integrate ordinary differential equations (ODEs) of the form:
 * dy/dt = f(t, y)
 *
 * Where y is the state vector and f is the derivative function.
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

  /**
   * Perform one step of RK4 integration.
   * @param state - Current state vector (will be modified in place)
   * @param derivativeFn - Function that computes derivatives
   * @param time - Current time
   * @param dt - Time step
   */
  public step(
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
}
