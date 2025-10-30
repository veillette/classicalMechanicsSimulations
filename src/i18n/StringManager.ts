/**
 * StringManager.ts
 *
 * Centralizes string management for the Classical Mechanics Simulations.
 * Provides access to localized strings for all components.
 */

import { LocalizedString, ReadOnlyProperty } from "scenerystack";
import strings_en from "./strings_en.json";
import strings_fr from "./strings_fr.json";

/**
 * Manages all localized strings for the simulation
 */
export class StringManager {
  // The cached singleton instance
  private static instance: StringManager;

  // All string properties organized by category
  private readonly stringProperties;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Create localized string properties
    this.stringProperties = LocalizedString.getNestedStringProperties({
      en: strings_en,
      fr: strings_fr,
    });
  }

  /**
   * Get the singleton instance of StringManager
   * @returns The StringManager instance
   */
  public static getInstance(): StringManager {
    if (!StringManager.instance) {
      StringManager.instance = new StringManager();
    }
    return StringManager.instance;
  }

  /**
   * Get the title string property
   */
  public getTitleStringProperty(): ReadOnlyProperty<string> {
    return this.stringProperties.titleStringProperty;
  }

  /**
   * Get screen name string properties
   */
  public getScreenNames() {
    return {
      singleSpringStringProperty:
        this.stringProperties.screens.singleSpringStringProperty,
      doubleSpringStringProperty:
        this.stringProperties.screens.doubleSpringStringProperty,
      pendulumStringProperty:
        this.stringProperties.screens.pendulumStringProperty,
      doublePendulumStringProperty:
        this.stringProperties.screens.doublePendulumStringProperty,
    };
  }

  /**
   * Get control label string properties
   */
  public getControlLabels() {
    return {
      massStringProperty: this.stringProperties.controls.massStringProperty,
      mass1StringProperty: this.stringProperties.controls.mass1StringProperty,
      mass2StringProperty: this.stringProperties.controls.mass2StringProperty,
      springConstantStringProperty:
        this.stringProperties.controls.springConstantStringProperty,
      springConstant1StringProperty:
        this.stringProperties.controls.springConstant1StringProperty,
      springConstant2StringProperty:
        this.stringProperties.controls.springConstant2StringProperty,
      dampingStringProperty:
        this.stringProperties.controls.dampingStringProperty,
      damping1StringProperty:
        this.stringProperties.controls.damping1StringProperty,
      damping2StringProperty:
        this.stringProperties.controls.damping2StringProperty,
      lengthStringProperty: this.stringProperties.controls.lengthStringProperty,
      length1StringProperty:
        this.stringProperties.controls.length1StringProperty,
      length2StringProperty:
        this.stringProperties.controls.length2StringProperty,
      gravityStringProperty:
        this.stringProperties.controls.gravityStringProperty,
    };
  }

  /**
   * Get unit string properties
   */
  public getUnitStrings() {
    return {
      kilogramsStringProperty:
        this.stringProperties.units.kilogramsStringProperty,
      newtonsPerMeterStringProperty:
        this.stringProperties.units.newtonsPerMeterStringProperty,
      newtonSecondsPerMeterStringProperty:
        this.stringProperties.units.newtonSecondsPerMeterStringProperty,
      newtonMeterSecondsStringProperty:
        this.stringProperties.units.newtonMeterSecondsStringProperty,
      metersStringProperty: this.stringProperties.units.metersStringProperty,
      metersPerSecondSquaredStringProperty:
        this.stringProperties.units.metersPerSecondSquaredStringProperty,
    };
  }

  /**
   * Get graph label string properties
   */
  public getGraphLabels() {
    return {
      // Graph controls
      showGraphStringProperty: this.stringProperties.graph.showGraphStringProperty,
      xAxisLabelStringProperty: this.stringProperties.graph.xAxisLabelStringProperty,
      yAxisLabelStringProperty: this.stringProperties.graph.yAxisLabelStringProperty,

      // Axis labels
      xStringProperty: this.stringProperties.graph.axis.xStringProperty,
      yStringProperty: this.stringProperties.graph.axis.yStringProperty,
      timeStringProperty: this.stringProperties.graph.axis.timeStringProperty,
      valueStringProperty: this.stringProperties.graph.axis.valueStringProperty,

      // Legend labels
      line1StringProperty:
        this.stringProperties.graph.legend.line1StringProperty,
      line2StringProperty:
        this.stringProperties.graph.legend.line2StringProperty,
      line3StringProperty:
        this.stringProperties.graph.legend.line3StringProperty,

      // Pendulum-specific labels
      angleAndVelocityStringProperty:
        this.stringProperties.graph.pendulum.angleAndVelocityStringProperty,
    };
  }

  /**
   * Get graph property name string properties
   */
  public getGraphPropertyNames() {
    return {
      positionStringProperty: this.stringProperties.graph.properties.positionStringProperty,
      velocityStringProperty: this.stringProperties.graph.properties.velocityStringProperty,
      angleStringProperty: this.stringProperties.graph.properties.angleStringProperty,
      angularVelocityStringProperty: this.stringProperties.graph.properties.angularVelocityStringProperty,
      angle1StringProperty: this.stringProperties.graph.properties.angle1StringProperty,
      angle2StringProperty: this.stringProperties.graph.properties.angle2StringProperty,
      angularVelocity1StringProperty: this.stringProperties.graph.properties.angularVelocity1StringProperty,
      angularVelocity2StringProperty: this.stringProperties.graph.properties.angularVelocity2StringProperty,
      kineticEnergyStringProperty: this.stringProperties.graph.properties.kineticEnergyStringProperty,
      potentialEnergyStringProperty: this.stringProperties.graph.properties.potentialEnergyStringProperty,
      totalEnergyStringProperty: this.stringProperties.graph.properties.totalEnergyStringProperty,
      timeStringProperty: this.stringProperties.graph.properties.timeStringProperty,
    };
  }

  /**
   * Get time control string properties
   */
  public getTimeControlLabels() {
    return {
      autoPauseWhenTabHiddenStringProperty: this.stringProperties.timeControls.autoPauseWhenTabHiddenStringProperty,
    };
  }

  /**
   * Get preferences string properties
   */
  public getPreferencesLabels() {
    return {
      autoPauseWhenTabHiddenStringProperty: this.stringProperties.preferences.autoPauseWhenTabHiddenStringProperty,
      autoPauseDescriptionStringProperty: this.stringProperties.preferences.autoPauseDescriptionStringProperty,
      solverMethodStringProperty: this.stringProperties.preferences.solverMethodStringProperty,
      solverDescriptionStringProperty: this.stringProperties.preferences.solverDescriptionStringProperty,
    };
  }

  /**
   * Get solver name string properties
   */
  public getSolverNames() {
    return {
      rk4StringProperty: this.stringProperties.preferences.solvers.rk4StringProperty,
      adaptiveRK45StringProperty: this.stringProperties.preferences.solvers.adaptiveRK45StringProperty,
      adaptiveEulerStringProperty: this.stringProperties.preferences.solvers.adaptiveEulerStringProperty,
      modifiedMidpointStringProperty: this.stringProperties.preferences.solvers.modifiedMidpointStringProperty,
    };
  }

  /**
   * Get solver description string properties
   */
  public getSolverDescriptions() {
    return {
      rk4StringProperty: this.stringProperties.preferences.solverDescriptions.rk4StringProperty,
      adaptiveRK45StringProperty: this.stringProperties.preferences.solverDescriptions.adaptiveRK45StringProperty,
      adaptiveEulerStringProperty: this.stringProperties.preferences.solverDescriptions.adaptiveEulerStringProperty,
      modifiedMidpointStringProperty: this.stringProperties.preferences.solverDescriptions.modifiedMidpointStringProperty,
    };
  }

  /**
   * Get preset common string properties
   */
  public getPresetLabels() {
    return {
      labelStringProperty: this.stringProperties.presets.labelStringProperty,
      customStringProperty: this.stringProperties.presets.customStringProperty,
    };
  }

  /**
   * Get single spring preset string properties
   */
  public getSingleSpringPresets() {
    return {
      lightAndBouncyStringProperty: this.stringProperties.presets.singleSpring.lightAndBouncyStringProperty,
      lightAndBouncyDescStringProperty: this.stringProperties.presets.singleSpring.lightAndBouncyDescStringProperty,
      heavyAndSlowStringProperty: this.stringProperties.presets.singleSpring.heavyAndSlowStringProperty,
      heavyAndSlowDescStringProperty: this.stringProperties.presets.singleSpring.heavyAndSlowDescStringProperty,
      criticallyDampedStringProperty: this.stringProperties.presets.singleSpring.criticallyDampedStringProperty,
      criticallyDampedDescStringProperty: this.stringProperties.presets.singleSpring.criticallyDampedDescStringProperty,
      underdampedStringProperty: this.stringProperties.presets.singleSpring.underdampedStringProperty,
      underdampedDescStringProperty: this.stringProperties.presets.singleSpring.underdampedDescStringProperty,
      overdampedStringProperty: this.stringProperties.presets.singleSpring.overdampedStringProperty,
      overdampedDescStringProperty: this.stringProperties.presets.singleSpring.overdampedDescStringProperty,
    };
  }

  /**
   * Get double spring preset string properties
   */
  public getDoubleSpringPresets() {
    return {
      symmetricStringProperty: this.stringProperties.presets.doubleSpring.symmetricStringProperty,
      symmetricDescStringProperty: this.stringProperties.presets.doubleSpring.symmetricDescStringProperty,
      asymmetricMassesStringProperty: this.stringProperties.presets.doubleSpring.asymmetricMassesStringProperty,
      asymmetricMassesDescStringProperty: this.stringProperties.presets.doubleSpring.asymmetricMassesDescStringProperty,
      differentSpringsStringProperty: this.stringProperties.presets.doubleSpring.differentSpringsStringProperty,
      differentSpringsDescStringProperty: this.stringProperties.presets.doubleSpring.differentSpringsDescStringProperty,
      coupledResonanceStringProperty: this.stringProperties.presets.doubleSpring.coupledResonanceStringProperty,
      coupledResonanceDescStringProperty: this.stringProperties.presets.doubleSpring.coupledResonanceDescStringProperty,
    };
  }

  /**
   * Get pendulum preset string properties
   */
  public getPendulumPresets() {
    return {
      shortAndFastStringProperty: this.stringProperties.presets.pendulum.shortAndFastStringProperty,
      shortAndFastDescStringProperty: this.stringProperties.presets.pendulum.shortAndFastDescStringProperty,
      longAndSlowStringProperty: this.stringProperties.presets.pendulum.longAndSlowStringProperty,
      longAndSlowDescStringProperty: this.stringProperties.presets.pendulum.longAndSlowDescStringProperty,
      smallAngleStringProperty: this.stringProperties.presets.pendulum.smallAngleStringProperty,
      smallAngleDescStringProperty: this.stringProperties.presets.pendulum.smallAngleDescStringProperty,
      largeAmplitudeStringProperty: this.stringProperties.presets.pendulum.largeAmplitudeStringProperty,
      largeAmplitudeDescStringProperty: this.stringProperties.presets.pendulum.largeAmplitudeDescStringProperty,
    };
  }

  /**
   * Get double pendulum preset string properties
   */
  public getDoublePendulumPresets() {
    return {
      synchronizedStringProperty: this.stringProperties.presets.doublePendulum.synchronizedStringProperty,
      synchronizedDescStringProperty: this.stringProperties.presets.doublePendulum.synchronizedDescStringProperty,
      chaoticDanceStringProperty: this.stringProperties.presets.doublePendulum.chaoticDanceStringProperty,
      chaoticDanceDescStringProperty: this.stringProperties.presets.doublePendulum.chaoticDanceDescStringProperty,
      counterRotationStringProperty: this.stringProperties.presets.doublePendulum.counterRotationStringProperty,
      counterRotationDescStringProperty: this.stringProperties.presets.doublePendulum.counterRotationDescStringProperty,
      energyTransferStringProperty: this.stringProperties.presets.doublePendulum.energyTransferStringProperty,
      energyTransferDescStringProperty: this.stringProperties.presets.doublePendulum.energyTransferDescStringProperty,
    };
  }

  /**
   * Get visualization string properties
   */
  public getVisualizationLabels() {
    return {
      showVectorsStringProperty: this.stringProperties.visualization.showVectorsStringProperty,
      showEnergyChartStringProperty: this.stringProperties.visualization.showEnergyChartStringProperty,
      velocityStringProperty: this.stringProperties.visualization.velocityStringProperty,
      accelerationStringProperty: this.stringProperties.visualization.accelerationStringProperty,
      forceStringProperty: this.stringProperties.visualization.forceStringProperty,
      kineticStringProperty: this.stringProperties.visualization.energy.kineticStringProperty,
      potentialStringProperty: this.stringProperties.visualization.energy.potentialStringProperty,
      totalStringProperty: this.stringProperties.visualization.energy.totalStringProperty,
    };
  }

  /**
   * Get accessibility announcement string properties
   */
  public getAccessibilityStrings() {
    return {
      // Simulation state
      simulationResetStringProperty: this.stringProperties.accessibility.simulation.resetStringProperty,
      simulationPlayingStringProperty: this.stringProperties.accessibility.simulation.playingStringProperty,
      simulationPausedStringProperty: this.stringProperties.accessibility.simulation.pausedStringProperty,
      simulationStartedStringProperty: this.stringProperties.accessibility.simulation.startedStringProperty,
      steppedForwardStringProperty: this.stringProperties.accessibility.simulation.steppedForwardStringProperty,
      steppedBackwardStringProperty: this.stringProperties.accessibility.simulation.steppedBackwardStringProperty,
      speedChangedStringProperty: this.stringProperties.accessibility.simulation.speedChangedStringProperty,

      // Drag interactions
      draggingMassStringProperty: this.stringProperties.accessibility.drag.draggingMassStringProperty,
      draggingMass1StringProperty: this.stringProperties.accessibility.drag.draggingMass1StringProperty,
      draggingMass2StringProperty: this.stringProperties.accessibility.drag.draggingMass2StringProperty,
      draggingBobStringProperty: this.stringProperties.accessibility.drag.draggingBobStringProperty,
      draggingUpperBobStringProperty: this.stringProperties.accessibility.drag.draggingUpperBobStringProperty,
      draggingLowerBobStringProperty: this.stringProperties.accessibility.drag.draggingLowerBobStringProperty,
      massReleasedAtStringProperty: this.stringProperties.accessibility.drag.massReleasedAtStringProperty,
      mass1ReleasedAtStringProperty: this.stringProperties.accessibility.drag.mass1ReleasedAtStringProperty,
      mass2ReleasedAtStringProperty: this.stringProperties.accessibility.drag.mass2ReleasedAtStringProperty,
      bobReleasedAtStringProperty: this.stringProperties.accessibility.drag.bobReleasedAtStringProperty,
      upperBobReleasedAtStringProperty: this.stringProperties.accessibility.drag.upperBobReleasedAtStringProperty,
      lowerBobReleasedAtStringProperty: this.stringProperties.accessibility.drag.lowerBobReleasedAtStringProperty,

      // Parameter changes
      massChangedStringProperty: this.stringProperties.accessibility.parameters.massChangedStringProperty,
      springConstantChangedStringProperty: this.stringProperties.accessibility.parameters.springConstantChangedStringProperty,
      dampingChangedStringProperty: this.stringProperties.accessibility.parameters.dampingChangedStringProperty,
      lengthChangedStringProperty: this.stringProperties.accessibility.parameters.lengthChangedStringProperty,
      gravityChangedStringProperty: this.stringProperties.accessibility.parameters.gravityChangedStringProperty,
      presetAppliedStringProperty: this.stringProperties.accessibility.parameters.presetAppliedStringProperty,

      // Graph changes
      graphShownStringProperty: this.stringProperties.accessibility.graph.shownStringProperty,
      graphHiddenStringProperty: this.stringProperties.accessibility.graph.hiddenStringProperty,
      xAxisChangedStringProperty: this.stringProperties.accessibility.graph.xAxisChangedStringProperty,
      yAxisChangedStringProperty: this.stringProperties.accessibility.graph.yAxisChangedStringProperty,
    };
  }

  /**
   * Get all raw string properties
   * This can be used if direct access is needed to a specific string property
   */
  public getAllStringProperties() {
    return this.stringProperties;
  }
}
