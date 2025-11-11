/**
 * Enumeration of available ODE solver types.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export default class SolverType extends EnumerationValue {
  public static readonly RK4 = new SolverType();
  public static readonly ADAPTIVE_RK45 = new SolverType();
  public static readonly FOREST_RUTH_PEFRL = new SolverType();
  public static readonly DORMAND_PRINCE_87 = new SolverType();

  public static readonly enumeration = new Enumeration(SolverType);
}
