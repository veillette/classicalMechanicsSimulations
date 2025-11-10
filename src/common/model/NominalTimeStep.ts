/**
 * Enumeration of available nominal time step values for numerical integration.
 * The actual time step may vary for adaptive solvers.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export default class NominalTimeStep extends EnumerationValue {
  public static readonly FINEST = new NominalTimeStep(0.00001); // 0.01 ms
  public static readonly VERY_SMALL = new NominalTimeStep(0.0001); // 0.1 ms
  public static readonly SMALL = new NominalTimeStep(0.0005); // 0.5 ms
  public static readonly DEFAULT = new NominalTimeStep(0.001); // 1 ms
  public static readonly MEDIUM = new NominalTimeStep(0.005); // 5 ms

  public static readonly enumeration = new Enumeration(NominalTimeStep);

  // The time step value in seconds
  public readonly value: number;

  public constructor(value: number) {
    super();
    this.value = value;
  }
}
