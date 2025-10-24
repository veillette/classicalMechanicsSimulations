/**
 * Screen for the Pendulum simulation.
 */

import { Screen, type ScreenOptions } from "scenerystack/sim";
import { PendulumModel } from "./model/PendulumModel.js";
import { PendulumScreenView } from "./view/PendulumScreenView.js";

export class PendulumScreen extends Screen<PendulumModel, PendulumScreenView> {
  public constructor(options: ScreenOptions) {
    super(
      () => new PendulumModel(),
      (model) => new PendulumScreenView(model),
      options
    );
  }
}
