// NOTE: brand.js needs to be the first import. This is because SceneryStack for sims needs a very specific loading
// order: init.ts => assert.ts => splash.ts => brand.ts => everything else (here)
import "./brand.js";

import { onReadyToLaunch, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { SingleSpringScreen } from "./single-spring/SingleSpringScreen.js";
import { DoubleSpringScreen } from "./double-spring/DoubleSpringScreen.js";
import { PendulumScreen } from "./pendulum/PendulumScreen.js";
import { DoublePendulumScreen } from "./double-pendulum/DoublePendulumScreen.js";
import { StringManager } from "./i18n/StringManager.js";

onReadyToLaunch(() => {
  // Get the string manager instance
  const stringManager = StringManager.getInstance();
  const screenNames = stringManager.getScreenNames();

  const screens = [
    new SingleSpringScreen({
      name: screenNames.singleSpringStringProperty,
      tandem: Tandem.ROOT.createTandem("singleSpringScreen")
    }),
    new DoubleSpringScreen({
      name: screenNames.doubleSpringStringProperty,
      tandem: Tandem.ROOT.createTandem("doubleSpringScreen")
    }),
    new PendulumScreen({
      name: screenNames.pendulumStringProperty,
      tandem: Tandem.ROOT.createTandem("pendulumScreen")
    }),
    new DoublePendulumScreen({
      name: screenNames.doublePendulumStringProperty,
      tandem: Tandem.ROOT.createTandem("doublePendulumScreen")
    })
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens);
  sim.start();
});
