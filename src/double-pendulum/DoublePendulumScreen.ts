/**
 * Screen for the Double Pendulum simulation.
 */

import { Screen, type ScreenOptions } from "scenerystack/sim";
import { DoublePendulumModel } from "./model/DoublePendulumModel.js";
import { DoublePendulumScreenView } from "./view/DoublePendulumScreenView.js";
import classicalMechanics from '../ClassicalMechanicsNamespace.js';

export class DoublePendulumScreen extends Screen<
  DoublePendulumModel,
  DoublePendulumScreenView
> {
  public constructor(options: ScreenOptions) {
    super(
      () => new DoublePendulumModel(),
      (model) => new DoublePendulumScreenView(model),
      options,
    );
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('DoublePendulumScreen', DoublePendulumScreen);
