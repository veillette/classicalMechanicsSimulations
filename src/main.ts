// NOTE: brand.js needs to be the first import. This is because SceneryStack for sims needs a very specific loading
// order: init.ts => assert.ts => splash.ts => brand.ts => everything else (here)
import "./brand.js";

import { onReadyToLaunch, Sim, PreferencesModel } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { VBox, Text, HStrut } from "scenerystack/scenery";
import { Checkbox, VerticalAquaRadioButtonGroup } from "scenerystack/sun";
import { PhetFont } from "scenerystack/scenery-phet";
import { SingleSpringScreen } from "./single-spring/SingleSpringScreen.js";
import { DoubleSpringScreen } from "./double-spring/DoubleSpringScreen.js";
import { PendulumScreen } from "./pendulum/PendulumScreen.js";
import { DoublePendulumScreen } from "./double-pendulum/DoublePendulumScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import ClassicalMechanicsColors from "./ClassicalMechanicsColors.js";
import ClassicalMechanicsPreferences from "./ClassicalMechanicsPreferences.js";
import SolverType from "./common/model/SolverType.js";

onReadyToLaunch(() => {
  // Get the string manager instance
  const stringManager = StringManager.getInstance();
  const screenNames = stringManager.getScreenNames();

  // Get preferences strings
  const preferencesLabels = stringManager.getPreferencesLabels();
  const solverNames = stringManager.getSolverNames();
  const solverDescriptions = stringManager.getSolverDescriptions();

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
              // Auto-pause preference
              const autoPauseSection = new VBox({
                align: "left",
                spacing: 8,
                children: [
                  new Checkbox(
                    ClassicalMechanicsPreferences.autoPauseWhenTabHiddenProperty,
                    new Text(preferencesLabels.autoPauseWhenTabHiddenStringProperty, {
                      font: new PhetFont(16),
                      fill: "black",
                    }),
                    {
                      boxWidth: 16,
                    },
                  ),
                  new Text(preferencesLabels.autoPauseDescriptionStringProperty, {
                    font: new PhetFont(12),
                    fill: "black",
                    maxWidth: 600,
                  }),
                ],
              });

              // Solver method preference
              const solverRadioButtonGroup = new VerticalAquaRadioButtonGroup(
                ClassicalMechanicsPreferences.solverTypeProperty,
                [
                  {
                    value: SolverType.RK4,
                    createNode: () => new VBox({
                      align: "left",
                      spacing: 4,
                      children: [
                        new Text(solverNames.rk4StringProperty, {
                          font: new PhetFont(14),
                          fill: "black",
                        }),
                        new Text(solverDescriptions.rk4StringProperty, {
                          font: new PhetFont(11),
                          fill: "rgb(80,80,80)",
                          maxWidth: 550,
                        }),
                      ],
                    }),
                    tandemName: "rk4RadioButton",
                  },
                  {
                    value: SolverType.ADAPTIVE_RK45,
                    createNode: () => new VBox({
                      align: "left",
                      spacing: 4,
                      children: [
                        new Text(solverNames.adaptiveRK45StringProperty, {
                          font: new PhetFont(14),
                          fill: "black",
                        }),
                        new Text(solverDescriptions.adaptiveRK45StringProperty, {
                          font: new PhetFont(11),
                          fill: "rgb(80,80,80)",
                          maxWidth: 550,
                        }),
                      ],
                    }),
                    tandemName: "adaptiveRK45RadioButton",
                  },
                  {
                    value: SolverType.ADAPTIVE_EULER,
                    createNode: () => new VBox({
                      align: "left",
                      spacing: 4,
                      children: [
                        new Text(solverNames.adaptiveEulerStringProperty, {
                          font: new PhetFont(14),
                          fill: "black",
                        }),
                        new Text(solverDescriptions.adaptiveEulerStringProperty, {
                          font: new PhetFont(11),
                          fill: "rgb(80,80,80)",
                          maxWidth: 550,
                        }),
                      ],
                    }),
                    tandemName: "adaptiveEulerRadioButton",
                  },
                  {
                    value: SolverType.MODIFIED_MIDPOINT,
                    createNode: () => new VBox({
                      align: "left",
                      spacing: 4,
                      children: [
                        new Text(solverNames.modifiedMidpointStringProperty, {
                          font: new PhetFont(14),
                          fill: "black",
                        }),
                        new Text(solverDescriptions.modifiedMidpointStringProperty, {
                          font: new PhetFont(11),
                          fill: "rgb(80,80,80)",
                          maxWidth: 550,
                        }),
                      ],
                    }),
                    tandemName: "modifiedMidpointRadioButton",
                  },
                ],
                {
                  spacing: 12,
                  radioButtonOptions: {
                    radius: 8,
                  },
                },
              );

              const solverSection = new VBox({
                align: "left",
                spacing: 12,
                children: [
                  new Text(preferencesLabels.solverMethodStringProperty, {
                    font: new PhetFont({ size: 16, weight: "bold" }),
                    fill: "black",
                  }),
                  new Text(preferencesLabels.solverDescriptionStringProperty, {
                    font: new PhetFont(12),
                    fill: "black",
                    maxWidth: 600,
                  }),
                  solverRadioButtonGroup,
                ],
              });

              return new VBox({
                align: "left",
                spacing: 20,
                children: [
                  autoPauseSection,
                  new HStrut(650), // Set minimum width
                  solverSection,
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
