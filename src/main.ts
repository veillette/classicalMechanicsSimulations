// NOTE: brand.js needs to be the first import. This is because SceneryStack for sims needs a very specific loading
// order: init.ts => assert.ts => splash.ts => brand.ts => everything else (here)
import "./brand.js";

import { onReadyToLaunch, Sim } from "scenerystack/sim";
import { StringProperty } from "scenerystack/axon";
import { Tandem } from "scenerystack/tandem";
import { SingleSpringScreen } from "./single-spring/SingleSpringScreen.js";
import { DoubleSpringScreen } from "./double-spring/DoubleSpringScreen.js";
import { PendulumScreen } from "./pendulum/PendulumScreen.js";
import { DoublePendulumScreen } from "./double-pendulum/DoublePendulumScreen.js";

onReadyToLaunch(() => {
  // The title, like most string-like things, is a StringProperty that can change to different values (e.g. for
  // different languages, see localeProperty from scenerystack/joist)
  const titleStringProperty = new StringProperty("Classical Mechanics Simulations");

  const screens = [
    new SingleSpringScreen({
      name: new StringProperty("Single Spring"),
      tandem: Tandem.ROOT.createTandem("singleSpringScreen")
    }),
    new DoubleSpringScreen({
      name: new StringProperty("Double Spring"),
      tandem: Tandem.ROOT.createTandem("doubleSpringScreen")
    }),
    new PendulumScreen({
      name: new StringProperty("Pendulum"),
      tandem: Tandem.ROOT.createTandem("pendulumScreen")
    }),
    new DoublePendulumScreen({
      name: new StringProperty("Double Pendulum"),
      tandem: Tandem.ROOT.createTandem("doublePendulumScreen")
    })
  ];

  const sim = new Sim(titleStringProperty, screens);
  sim.start();
});
