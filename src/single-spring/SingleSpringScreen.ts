/**
 * Screen for the Single Spring simulation.
 */

import { Screen, type ScreenOptions } from "scenerystack/sim";
import { SingleSpringModel } from "./model/SingleSpringModel.js";
import { SingleSpringScreenView } from "./view/SingleSpringScreenView.js";
import classicalMechanics from '../ClassicalMechanicsNamespace.js';

export class SingleSpringScreen extends Screen<
  SingleSpringModel,
  SingleSpringScreenView
> {
  public constructor(options: ScreenOptions) {
    super(
      () => new SingleSpringModel(),
      (model) => new SingleSpringScreenView(model),
      options,
    );
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('SingleSpringScreen', SingleSpringScreen);
