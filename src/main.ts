// NOTE: brand.js needs to be the first import. This is because SceneryStack for sims needs a very specific loading
// order: init.ts => assert.ts => splash.ts => brand.ts => everything else (here)
import "./brand.js";

// Import KaTeX and make it available globally for FormulaNode
// Import CSS locally so it's bundled and works offline
import "katex/dist/katex.min.css";
import * as katex from "katex";

// Extend Window interface to include katex
declare global {
  interface Window {
    katex: typeof katex;
  }
}

window.katex = katex;

import { onReadyToLaunch, Sim, PreferencesModel } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { VBox, Text, HStrut, HBox, Node } from "scenerystack/scenery";
import { Checkbox, VerticalAquaRadioButtonGroup, ComboBox } from "scenerystack/sun";
import { PhetFont } from "scenerystack/scenery-phet";
import { SingleSpringScreen } from "./single-spring/SingleSpringScreen.js";
import { DoubleSpringScreen } from "./double-spring/DoubleSpringScreen.js";
import { PendulumScreen } from "./pendulum/PendulumScreen.js";
import { DoublePendulumScreen } from "./double-pendulum/DoublePendulumScreen.js";
import { SingleSpringScreenIcon } from "./single-spring/SingleSpringScreenIcon.js";
import { DoubleSpringScreenIcon } from "./double-spring/DoubleSpringScreenIcon.js";
import { PendulumScreenIcon } from "./pendulum/PendulumScreenIcon.js";
import { DoublePendulumScreenIcon } from "./double-pendulum/DoublePendulumScreenIcon.js";
import { StringManager } from "./i18n/StringManager.js";
import ClassicalMechanicsColors from "./ClassicalMechanicsColors.js";
import ClassicalMechanicsPreferences from "./ClassicalMechanicsPreferences.js";
import SolverType from "./common/model/SolverType.js";
import SpringVisualizationType from "./common/view/SpringVisualizationType.js";
import NominalTimeStep from "./common/model/NominalTimeStep.js";
import ClassicalMechanicsAudioPreferencesNode from "./common/view/ClassicalMechanicsAudioPreferencesNode.js";
import { KeyboardShortcutsNode } from "./common/view/KeyboardShortcutsNode.js";
import SimulationAnnouncer from "./common/util/SimulationAnnouncer.js";

onReadyToLaunch(() => {
  // Get the string manager instance
  const stringManager = StringManager.getInstance();
  const screenNames = stringManager.getScreenNames();

  // Get preferences strings
  const preferencesLabels = stringManager.getPreferencesLabels();
  const solverNames = stringManager.getSolverNames();
  const solverDescriptions = stringManager.getSolverDescriptions();
  const timeStepNames = stringManager.getTimeStepNames();
  const springTypeNames = stringManager.getSpringTypeNames();
  const springTypeDescriptions = stringManager.getSpringTypeDescriptions();

  const simOptions = {
    webgl: true,
    preferencesModel: new PreferencesModel({
      visualOptions: {
        supportsProjectorMode: true,
        supportsInteractiveHighlights: true,
      },
      audioOptions: {
        supportsVoicing: true,
        supportsSound: false,
        customPreferences: [
          {
            createContent: (tandem: Tandem) => {
              return new ClassicalMechanicsAudioPreferencesNode(tandem);
            },
            column: "right",
          },
        ],
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

              // Create a listParent for the combo box
              const comboBoxListParent = new Node();

              // Time step combo box
              const timeStepComboBoxItems = [
                {
                  value: NominalTimeStep.FINEST,
                  createNode: () => new Text(timeStepNames.finestStringProperty, {
                    font: new PhetFont(14),
                    fill: "black",
                  }),
                  tandemName: "finestTimeStepItem",
                },
                {
                  value: NominalTimeStep.VERY_SMALL,
                  createNode: () => new Text(timeStepNames.verySmallStringProperty, {
                    font: new PhetFont(14),
                    fill: "black",
                  }),
                  tandemName: "verySmallTimeStepItem",
                },
                {
                  value: NominalTimeStep.SMALL,
                  createNode: () => new Text(timeStepNames.smallStringProperty, {
                    font: new PhetFont(14),
                    fill: "black",
                  }),
                  tandemName: "smallTimeStepItem",
                },
                {
                  value: NominalTimeStep.DEFAULT,
                  createNode: () => new Text(timeStepNames.defaultStringProperty, {
                    font: new PhetFont(14),
                    fill: "black",
                  }),
                  tandemName: "defaultTimeStepItem",
                },
                {
                  value: NominalTimeStep.MEDIUM,
                  createNode: () => new Text(timeStepNames.mediumStringProperty, {
                    font: new PhetFont(14),
                    fill: "black",
                  }),
                  tandemName: "mediumTimeStepItem",
                },
              ];

              const timeStepComboBox = new ComboBox(
                ClassicalMechanicsPreferences.nominalTimeStepProperty,
                timeStepComboBoxItems,
                comboBoxListParent,
                {
                  cornerRadius: 5,
                  xMargin: 8,
                  yMargin: 4,
                }
              );

              // Time step section (right column)
              const timeStepSection = new VBox({
                align: "left",
                spacing: 8,
                children: [
                  new Text(preferencesLabels.nominalTimeStepStringProperty, {
                    font: new PhetFont({ size: 14, weight: "bold" }),
                    fill: "black",
                  }),
                  new Text(preferencesLabels.nominalTimeStepDescriptionStringProperty, {
                    font: new PhetFont(11),
                    fill: "rgb(80,80,80)",
                    maxWidth: 280,
                  }),
                  timeStepComboBox,
                ],
              });

              // Solver method section (left column) - reduced maxWidth for descriptions
              const solverMethodColumn = new VBox({
                align: "left",
                spacing: 8,
                children: [
                  new Text(preferencesLabels.solverMethodStringProperty, {
                    font: new PhetFont({ size: 14, weight: "bold" }),
                    fill: "black",
                  }),
                  new VerticalAquaRadioButtonGroup(
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
                              maxWidth: 280,
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
                              maxWidth: 280,
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
                              maxWidth: 280,
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
                              maxWidth: 280,
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
                  ),
                ],
              });

              // Combine solver method and time step in two columns
              const solverSection = new VBox({
                align: "left",
                spacing: 12,
                children: [
                  new Text(preferencesLabels.solverDescriptionStringProperty, {
                    font: new PhetFont(12),
                    fill: "black",
                    maxWidth: 600,
                  }),
                  new HBox({
                    align: "top",
                    spacing: 30,
                    children: [
                      solverMethodColumn,
                      timeStepSection,
                    ],
                  }),
                  comboBoxListParent, // Add the combo box list parent to the scene graph
                ],
              });

              // Spring visualization preference
              const springVisualizationRadioButtonGroup = new VerticalAquaRadioButtonGroup(
                ClassicalMechanicsPreferences.springVisualizationTypeProperty,
                [
                  {
                    value: SpringVisualizationType.CLASSIC,
                    createNode: () => new VBox({
                      align: "left",
                      spacing: 4,
                      children: [
                        new Text(springTypeNames.classicStringProperty, {
                          font: new PhetFont(14),
                          fill: "black",
                        }),
                        new Text(springTypeDescriptions.classicStringProperty, {
                          font: new PhetFont(11),
                          fill: "rgb(80,80,80)",
                          maxWidth: 550,
                        }),
                      ],
                    }),
                    tandemName: "classicSpringRadioButton",
                  },
                  {
                    value: SpringVisualizationType.PARAMETRIC,
                    createNode: () => new VBox({
                      align: "left",
                      spacing: 4,
                      children: [
                        new Text(springTypeNames.parametricStringProperty, {
                          font: new PhetFont(14),
                          fill: "black",
                        }),
                        new Text(springTypeDescriptions.parametricStringProperty, {
                          font: new PhetFont(11),
                          fill: "rgb(80,80,80)",
                          maxWidth: 550,
                        }),
                      ],
                    }),
                    tandemName: "parametricSpringRadioButton",
                  },
                ],
                {
                  spacing: 12,
                  radioButtonOptions: {
                    radius: 8,
                  },
                },
              );

              const springVisualizationSection = new VBox({
                align: "left",
                spacing: 12,
                children: [
                  new Text(preferencesLabels.springVisualizationStringProperty, {
                    font: new PhetFont({ size: 16, weight: "bold" }),
                    fill: "black",
                  }),
                  new Text(preferencesLabels.springVisualizationDescriptionStringProperty, {
                    font: new PhetFont(12),
                    fill: "black",
                    maxWidth: 600,
                  }),
                  springVisualizationRadioButtonGroup,
                ],
              });

              return new VBox({
                align: "left",
                spacing: 20,
                children: [
                  autoPauseSection,
                  new HStrut(650), // Set minimum width
                  solverSection,
                  springVisualizationSection,
                ],
              });
            },
          },
        ],
      },
    }),
  };

  // Add accessibility announcements for preference changes
  const a11yStrings = stringManager.getAccessibilityStrings();

  ClassicalMechanicsPreferences.solverTypeProperty.lazyLink((solverType) => {
    if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
      let solverName = "";
      switch (solverType) {
        case SolverType.RK4:
          solverName = solverNames.rk4StringProperty.value;
          break;
        case SolverType.ADAPTIVE_RK45:
          solverName = solverNames.adaptiveRK45StringProperty.value;
          break;
        case SolverType.ADAPTIVE_EULER:
          solverName = solverNames.adaptiveEulerStringProperty.value;
          break;
        case SolverType.MODIFIED_MIDPOINT:
          solverName = solverNames.modifiedMidpointStringProperty.value;
          break;
      }
      const template = a11yStrings.solverChangedStringProperty.value;
      const announcement = template.replace('{{solver}}', solverName);
      SimulationAnnouncer.announceSimulationState(announcement);
    }
  });

  ClassicalMechanicsPreferences.springVisualizationTypeProperty.lazyLink((springType) => {
    if (ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
      const springTypeName = springType === SpringVisualizationType.CLASSIC
        ? springTypeNames.classicStringProperty.value
        : springTypeNames.parametricStringProperty.value;
      const template = a11yStrings.springVisualizationChangedStringProperty.value;
      const announcement = template.replace('{{type}}', springTypeName);
      SimulationAnnouncer.announceSimulationState(announcement);
    }
  });

  const keyboardHelpNode = new KeyboardShortcutsNode();

  const screens = [
    new SingleSpringScreen({
      name: screenNames.singleSpringStringProperty,
      tandem: Tandem.ROOT.createTandem("singleSpringScreen"),
      backgroundColorProperty: ClassicalMechanicsColors.backgroundColorProperty,
      homeScreenIcon: new SingleSpringScreenIcon(),
      createKeyboardHelpNode: () => {
        return keyboardHelpNode;
      },
    }),
    new DoubleSpringScreen({
      name: screenNames.doubleSpringStringProperty,
      tandem: Tandem.ROOT.createTandem("doubleSpringScreen"),
      backgroundColorProperty: ClassicalMechanicsColors.backgroundColorProperty,
      homeScreenIcon: new DoubleSpringScreenIcon(),
      createKeyboardHelpNode: () => {
        return keyboardHelpNode;
      },
    }),
    new PendulumScreen({
      name: screenNames.pendulumStringProperty,
      tandem: Tandem.ROOT.createTandem("pendulumScreen"),
      backgroundColorProperty: ClassicalMechanicsColors.backgroundColorProperty,
      homeScreenIcon: new PendulumScreenIcon(),
      createKeyboardHelpNode: () => {
        return keyboardHelpNode;
      },
    }),
    new DoublePendulumScreen({
      name: screenNames.doublePendulumStringProperty,
      tandem: Tandem.ROOT.createTandem("doublePendulumScreen"),
      backgroundColorProperty: ClassicalMechanicsColors.backgroundColorProperty,
      homeScreenIcon: new DoublePendulumScreenIcon(),
      createKeyboardHelpNode: () => {
        return keyboardHelpNode;
      },
    }),
  ];

  const sim = new Sim(
    stringManager.getTitleStringProperty(),
    screens,
    simOptions,
  );
  sim.start();
});
