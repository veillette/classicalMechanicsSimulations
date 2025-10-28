// NOTE: brand.js needs to be the first import. This is because SceneryStack for sims needs a very specific loading
// order: init.ts => assert.ts => splash.ts => brand.ts => everything else (here)
import "./brand.js";

import { onReadyToLaunch, Sim, PreferencesModel } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { VBox, Text } from "scenerystack/scenery";
import { Checkbox } from "scenerystack/sun";
import { PhetFont } from "scenerystack/scenery-phet";
import { SingleSpringScreen } from "./single-spring/SingleSpringScreen.js";
import { DoubleSpringScreen } from "./double-spring/DoubleSpringScreen.js";
import { PendulumScreen } from "./pendulum/PendulumScreen.js";
import { DoublePendulumScreen } from "./double-pendulum/DoublePendulumScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import ClassicalMechanicsColors from "./ClassicalMechanicsColors.js";
import ClassicalMechanicsPreferences from "./ClassicalMechanicsPreferences.js";

onReadyToLaunch(() => {
  // Get the string manager instance
  const stringManager = StringManager.getInstance();
  const screenNames = stringManager.getScreenNames();

  // Get preferences strings
  const preferencesLabels = stringManager.getPreferencesLabels();

  const simOptions = {
    webgl: true,
    preferencesModel: new PreferencesModel({
      visualOptions: {
        supportsProjectorMode: true,
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (_tandem: Tandem) => {
              return new VBox({
                align: "left",
                spacing: 8,
                children: [
                  new Checkbox(
                    ClassicalMechanicsPreferences.autoPauseWhenTabHiddenProperty,
                    new Text(preferencesLabels.autoPauseWhenTabHiddenStringProperty, {
                      font: new PhetFont(16),
                      fill: "black", // Preferences dialog always has white background
                    }),
                    {
                      boxWidth: 16,
                    },
                  ),
                  new Text(preferencesLabels.autoPauseDescriptionStringProperty, {
                    font: new PhetFont(12),
                    fill: "black", // Preferences dialog always has white background
                    maxWidth: 600,
                  }),
                ],
              });
            },
          },
        ],
      },
    }),
  };

  const screens = [
    new SingleSpringScreen({
      name: screenNames.singleSpringStringProperty,
      tandem: Tandem.ROOT.createTandem("singleSpringScreen"),
      backgroundColorProperty: ClassicalMechanicsColors.backgroundColorProperty,
    }),
    new DoubleSpringScreen({
      name: screenNames.doubleSpringStringProperty,
      tandem: Tandem.ROOT.createTandem("doubleSpringScreen"),
      backgroundColorProperty: ClassicalMechanicsColors.backgroundColorProperty,
    }),
    new PendulumScreen({
      name: screenNames.pendulumStringProperty,
      tandem: Tandem.ROOT.createTandem("pendulumScreen"),
      backgroundColorProperty: ClassicalMechanicsColors.backgroundColorProperty,
    }),
    new DoublePendulumScreen({
      name: screenNames.doublePendulumStringProperty,
      tandem: Tandem.ROOT.createTandem("doublePendulumScreen"),
      backgroundColorProperty: ClassicalMechanicsColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(
    stringManager.getTitleStringProperty(),
    screens,
    simOptions,
  );
  sim.start();
});
