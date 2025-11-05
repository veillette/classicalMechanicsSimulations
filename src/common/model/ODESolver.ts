/**
 * Interface for ODE (Ordinary Differential Equation) solvers.
 * All solvers must implement this interface to be used by the models.
 */

export type DerivativeFunction = (
  state: number[],
  derivatives: number[],
  time: number,
) => void;

export type ODESolver = {
  /**
   * Perform one integration step.
   *
   * @param state - Current state vector (will be modified in place)
   * @param derivativeFn - Function that computes derivatives
   * @param time - Current time
   * @param dt - Time step
   * @returns The new time after integration
   */
  step(
    state: number[],
    derivativeFn: DerivativeFunction,
    time: number,
    dt: number,
  ): number;

  /**
   * Set the fixed timestep for integration (if applicable).
   * For adaptive solvers, this may set the initial timestep or maximum timestep.
   *
   * @param dt - Fixed timestep in seconds
   */
  setFixedTimeStep(dt: number): void;

  /**
   * Get the current fixed timestep.
   */
  getFixedTimeStep(): number;
}
