/**
 * Model for a single mass attached to a spring in vertical configuration.
 *
 * Physics:
 * - Spring force: F = -k * x
 * - Damping force: F = -b * v
 * - Gravitational force: F = m * g
 * - Equation of motion: m * a = -k * x - b * v + m * g
 *
 * State variables:
 * - position (x) - displacement from natural length (positive downward)
 * - velocity (v)
 */

import {
  NumberProperty,
  DerivedProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { BaseModel } from "../../common/model/BaseModel.js";
import { StatePropertyMapper } from "../../common/model/StatePropertyMapper.js";

export class SingleSpringModel extends BaseModel {
  // State variables
  public readonly positionProperty: NumberProperty;
  public readonly velocityProperty: NumberProperty;

  // State property mapper for cleaner state management
  private readonly stateMapper: StatePropertyMapper;

  // Physics parameters
  public readonly massProperty: NumberProperty;
  public readonly springConstantProperty: NumberProperty;
  public readonly dampingProperty: NumberProperty;
  public readonly gravityProperty: NumberProperty;
  public readonly naturalLengthProperty: NumberProperty;

  // Computed values
  public readonly accelerationProperty: TReadOnlyProperty<number>;
  public readonly kineticEnergyProperty: TReadOnlyProperty<number>;
  public readonly potentialEnergyProperty: TReadOnlyProperty<number>;
  public readonly springPotentialEnergyProperty: TReadOnlyProperty<number>;
  public readonly gravitationalPotentialEnergyProperty: TReadOnlyProperty<number>;
  public readonly totalEnergyProperty: TReadOnlyProperty<number>;

  public constructor() {
    super();

    // Initialize state to match first preset ("Heavy and Slow")
    // Position matches first preset initial displacement
    this.positionProperty = new NumberProperty(1.0, {
      range: new Range(-5, 5)
    });

    this.velocityProperty = new NumberProperty(0.0);

    // Initialize parameters to match first preset ("Heavy and Slow")
    this.massProperty = new NumberProperty(5.0, {
      range: new Range(0.1, 5.0)
    });

    this.springConstantProperty = new NumberProperty(15.0, {
      range: new Range(1.0, 50.0)
    });

    this.dampingProperty = new NumberProperty(0.5, {
      range: new Range(0.0, 20.0)
    });

    this.gravityProperty = new NumberProperty(9.8, {
      range: new Range(0.0, 20.0)
    });

    this.naturalLengthProperty = new NumberProperty(1.0);

    // Computed acceleration
    this.accelerationProperty = new DerivedProperty(
      [this.positionProperty, this.velocityProperty, this.massProperty, this.springConstantProperty, this.dampingProperty, this.gravityProperty],
      (x, v, m, k, b, g) => (-k * x - b * v + m * g) / m
    );

    // Computed energies
    this.kineticEnergyProperty = new DerivedProperty(
      [this.velocityProperty, this.massProperty],
      (v, m) => 0.5 * m * v * v
    );

    // Potential energy includes both spring and gravitational components
    this.potentialEnergyProperty = new DerivedProperty(
      [this.positionProperty, this.springConstantProperty, this.massProperty, this.gravityProperty],
      (x, k, m, g) => 0.5 * k * x * x - m * g * x // Spring PE + Gravitational PE (taking downward as positive)
    );

    // Spring potential energy only
    this.springPotentialEnergyProperty = new DerivedProperty(
      [this.positionProperty, this.springConstantProperty],
      (x, k) => 0.5 * k * x * x
    );

    // Gravitational potential energy only
    this.gravitationalPotentialEnergyProperty = new DerivedProperty(
      [this.positionProperty, this.massProperty, this.gravityProperty],
      (x, m, g) => -m * g * x // Negative because downward is positive and PE decreases going down
    );

    this.totalEnergyProperty = new DerivedProperty(
      [this.kineticEnergyProperty, this.potentialEnergyProperty],
      (ke, pe) => ke + pe
    );

    // Initialize state mapper with properties in state order
    this.stateMapper = new StatePropertyMapper([
      this.positionProperty,
      this.velocityProperty,
    ]);
  }

  /**
   * Get the current state vector for physics integration.
   * @returns [position, velocity]
   */
  protected getState(): number[] {
    return this.stateMapper.getState();
  }

  /**
   * Update the model's properties from the state vector after integration.
   * @param state - [position, velocity]
   */
  protected setState(state: number[]): void {
    this.stateMapper.setState(state);
  }

  /**
   * Compute derivatives for the ODE solver.
   * Implements: x' = v, v' = (-k*x - b*v + m*g) / m
   * Note: position x is positive downward from natural length
   */
  protected getDerivatives(
    state: number[],
    derivatives: number[],
    _: number,
  ): void {
    const x = state[0];
    const v = state[1];

    const m = this.massProperty.value;
    const k = this.springConstantProperty.value;
    const b = this.dampingProperty.value;
    const g = this.gravityProperty.value;

    // dx/dt = v
    derivatives[0] = v;

    // dv/dt = (-k*x - b*v + m*g) / m = -k*x/m - b*v/m + g
    derivatives[1] = (-k * x - b * v + m * g) / m;
  }

  /**
   * Reset the model to initial conditions.
   */
  public reset(): void {
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.massProperty.reset();
    this.springConstantProperty.reset();
    this.dampingProperty.reset();
    this.gravityProperty.reset();
    this.naturalLengthProperty.reset();
    this.resetCommon(); // Reset time-related properties from base class
  }
}
