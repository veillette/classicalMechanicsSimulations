/**
 * Enumeration of spring visualization types available in the simulation.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export default class SpringVisualizationType extends EnumerationValue {
  /**
   * Classic spring visualization with simple coil pattern
   */
  public static readonly CLASSIC = new SpringVisualizationType();

  /**
   * Parametric spring visualization with more realistic 3D appearance
   */
  public static readonly PARAMETRIC = new SpringVisualizationType();

  public static readonly enumeration = new Enumeration(SpringVisualizationType);
}
