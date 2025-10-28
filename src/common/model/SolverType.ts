/**
 * Enumeration of available ODE solver types.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export default class SolverType extends EnumerationValue {
  public static readonly RK4 = new SolverType();
  public static readonly ADAPTIVE_RK45 = new SolverType();
  public static readonly ADAPTIVE_EULER = new SolverType();
  public static readonly MODIFIED_MIDPOINT = new SolverType();

  public static readonly enumeration = new Enumeration(SolverType);
}
