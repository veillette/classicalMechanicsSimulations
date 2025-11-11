/**
 * Screen for the Double Spring simulation.
 */

import { Screen, type ScreenOptions } from "scenerystack/sim";
import { DoubleSpringModel } from "./model/DoubleSpringModel.js";
import { DoubleSpringScreenView } from "./view/DoubleSpringScreenView.js";
import classicalMechanics from '../ClassicalMechanicsNamespace.js';

export class DoubleSpringScreen extends Screen<
  DoubleSpringModel,
  DoubleSpringScreenView
> {
  public constructor(options: ScreenOptions) {
    super(
      () => new DoubleSpringModel(),
      (model) => new DoubleSpringScreenView(model),
      options,
    );
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('DoubleSpringScreen', DoubleSpringScreen);
