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
  public getScreenNames(): {
    singleSpringStringProperty: ReadOnlyProperty<string>;
    doubleSpringStringProperty: ReadOnlyProperty<string>;
    pendulumStringProperty: ReadOnlyProperty<string>;
    doublePendulumStringProperty: ReadOnlyProperty<string>;
  } {
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
  public getControlLabels(): {
    massStringProperty: ReadOnlyProperty<string>;
    mass1StringProperty: ReadOnlyProperty<string>;
    mass2StringProperty: ReadOnlyProperty<string>;
    springConstantStringProperty: ReadOnlyProperty<string>;
    springConstant1StringProperty: ReadOnlyProperty<string>;
    springConstant2StringProperty: ReadOnlyProperty<string>;
    dampingStringProperty: ReadOnlyProperty<string>;
    damping1StringProperty: ReadOnlyProperty<string>;
    damping2StringProperty: ReadOnlyProperty<string>;
    lengthStringProperty: ReadOnlyProperty<string>;
    length1StringProperty: ReadOnlyProperty<string>;
    length2StringProperty: ReadOnlyProperty<string>;
    gravityStringProperty: ReadOnlyProperty<string>;
  } {
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
  public getUnitStrings(): {
    kilogramsStringProperty: ReadOnlyProperty<string>;
    newtonsPerMeterStringProperty: ReadOnlyProperty<string>;
    newtonSecondsPerMeterStringProperty: ReadOnlyProperty<string>;
    newtonMeterSecondsStringProperty: ReadOnlyProperty<string>;
    metersStringProperty: ReadOnlyProperty<string>;
    metersPerSecondSquaredStringProperty: ReadOnlyProperty<string>;
  } {
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
  public getGraphLabels(): {
    showGraphStringProperty: ReadOnlyProperty<string>;
    xAxisLabelStringProperty: ReadOnlyProperty<string>;
    yAxisLabelStringProperty: ReadOnlyProperty<string>;
    xStringProperty: ReadOnlyProperty<string>;
    yStringProperty: ReadOnlyProperty<string>;
    timeStringProperty: ReadOnlyProperty<string>;
    valueStringProperty: ReadOnlyProperty<string>;
    line1StringProperty: ReadOnlyProperty<string>;
    line2StringProperty: ReadOnlyProperty<string>;
    line3StringProperty: ReadOnlyProperty<string>;
    angleAndVelocityStringProperty: ReadOnlyProperty<string>;
  } {
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
  public getGraphPropertyNames(): {
    positionStringProperty: ReadOnlyProperty<string>;
    position1StringProperty: ReadOnlyProperty<string>;
    position2StringProperty: ReadOnlyProperty<string>;
    velocityStringProperty: ReadOnlyProperty<string>;
    velocity1StringProperty: ReadOnlyProperty<string>;
    velocity2StringProperty: ReadOnlyProperty<string>;
    accelerationStringProperty: ReadOnlyProperty<string>;
    acceleration1StringProperty: ReadOnlyProperty<string>;
    acceleration2StringProperty: ReadOnlyProperty<string>;
    angleStringProperty: ReadOnlyProperty<string>;
    angularVelocityStringProperty: ReadOnlyProperty<string>;
    angle1StringProperty: ReadOnlyProperty<string>;
    angle2StringProperty: ReadOnlyProperty<string>;
    angularVelocity1StringProperty: ReadOnlyProperty<string>;
    angularVelocity2StringProperty: ReadOnlyProperty<string>;
    angularAccelerationStringProperty: ReadOnlyProperty<string>;
    angularAcceleration1StringProperty: ReadOnlyProperty<string>;
    angularAcceleration2StringProperty: ReadOnlyProperty<string>;
    kineticEnergyStringProperty: ReadOnlyProperty<string>;
    potentialEnergyStringProperty: ReadOnlyProperty<string>;
    springPotentialEnergyStringProperty: ReadOnlyProperty<string>;
    gravitationalPotentialEnergyStringProperty: ReadOnlyProperty<string>;
    totalEnergyStringProperty: ReadOnlyProperty<string>;
    timeStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      positionStringProperty: this.stringProperties.graph.properties.positionStringProperty,
      position1StringProperty: this.stringProperties.graph.properties.position1StringProperty,
      position2StringProperty: this.stringProperties.graph.properties.position2StringProperty,
      velocityStringProperty: this.stringProperties.graph.properties.velocityStringProperty,
      velocity1StringProperty: this.stringProperties.graph.properties.velocity1StringProperty,
      velocity2StringProperty: this.stringProperties.graph.properties.velocity2StringProperty,
      accelerationStringProperty: this.stringProperties.graph.properties.accelerationStringProperty,
      acceleration1StringProperty: this.stringProperties.graph.properties.acceleration1StringProperty,
      acceleration2StringProperty: this.stringProperties.graph.properties.acceleration2StringProperty,
      angleStringProperty: this.stringProperties.graph.properties.angleStringProperty,
      angularVelocityStringProperty: this.stringProperties.graph.properties.angularVelocityStringProperty,
      angle1StringProperty: this.stringProperties.graph.properties.angle1StringProperty,
      angle2StringProperty: this.stringProperties.graph.properties.angle2StringProperty,
      angularVelocity1StringProperty: this.stringProperties.graph.properties.angularVelocity1StringProperty,
      angularVelocity2StringProperty: this.stringProperties.graph.properties.angularVelocity2StringProperty,
      angularAccelerationStringProperty: this.stringProperties.graph.properties.angularAccelerationStringProperty,
      angularAcceleration1StringProperty: this.stringProperties.graph.properties.angularAcceleration1StringProperty,
      angularAcceleration2StringProperty: this.stringProperties.graph.properties.angularAcceleration2StringProperty,
      kineticEnergyStringProperty: this.stringProperties.graph.properties.kineticEnergyStringProperty,
      potentialEnergyStringProperty: this.stringProperties.graph.properties.potentialEnergyStringProperty,
      springPotentialEnergyStringProperty: this.stringProperties.graph.properties.springPotentialEnergyStringProperty,
      gravitationalPotentialEnergyStringProperty: this.stringProperties.graph.properties.gravitationalPotentialEnergyStringProperty,
      totalEnergyStringProperty: this.stringProperties.graph.properties.totalEnergyStringProperty,
      timeStringProperty: this.stringProperties.graph.properties.timeStringProperty,
    };
  }

  /**
   * Get time control string properties
   */
  public getTimeControlLabels(): {
    autoPauseWhenTabHiddenStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      autoPauseWhenTabHiddenStringProperty: this.stringProperties.timeControls.autoPauseWhenTabHiddenStringProperty,
    };
  }

  /**
   * Get preferences string properties
   */
  public getPreferencesLabels(): {
    autoPauseWhenTabHiddenStringProperty: ReadOnlyProperty<string>;
    autoPauseDescriptionStringProperty: ReadOnlyProperty<string>;
    solverMethodStringProperty: ReadOnlyProperty<string>;
    solverDescriptionStringProperty: ReadOnlyProperty<string>;
    nominalTimeStepStringProperty: ReadOnlyProperty<string>;
    nominalTimeStepDescriptionStringProperty: ReadOnlyProperty<string>;
    springVisualizationStringProperty: ReadOnlyProperty<string>;
    springVisualizationDescriptionStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      autoPauseWhenTabHiddenStringProperty: this.stringProperties.preferences.autoPauseWhenTabHiddenStringProperty,
      autoPauseDescriptionStringProperty: this.stringProperties.preferences.autoPauseDescriptionStringProperty,
      solverMethodStringProperty: this.stringProperties.preferences.solverMethodStringProperty,
      solverDescriptionStringProperty: this.stringProperties.preferences.solverDescriptionStringProperty,
      nominalTimeStepStringProperty: this.stringProperties.preferences.nominalTimeStepStringProperty,
      nominalTimeStepDescriptionStringProperty: this.stringProperties.preferences.nominalTimeStepDescriptionStringProperty,
      springVisualizationStringProperty: this.stringProperties.preferences.springVisualizationStringProperty,
      springVisualizationDescriptionStringProperty: this.stringProperties.preferences.springVisualizationDescriptionStringProperty,
    };
  }

  /**
   * Get solver name string properties
   */
  public getSolverNames(): {
    rk4StringProperty: ReadOnlyProperty<string>;
    adaptiveRK45StringProperty: ReadOnlyProperty<string>;
    forestRuthPEFRLStringProperty: ReadOnlyProperty<string>;
    dormandPrince87StringProperty: ReadOnlyProperty<string>;
  } {
    return {
      rk4StringProperty: this.stringProperties.preferences.solvers.rk4StringProperty,
      adaptiveRK45StringProperty: this.stringProperties.preferences.solvers.adaptiveRK45StringProperty,
      forestRuthPEFRLStringProperty: this.stringProperties.preferences.solvers.forestRuthPEFRLStringProperty,
      dormandPrince87StringProperty: this.stringProperties.preferences.solvers.dormandPrince87StringProperty,
    };
  }

  /**
   * Get audio preferences label string properties
   */
  public getAudioPreferencesLabels(): {
    simVoicingOptionsStringProperty: ReadOnlyProperty<string>;
    announceParameterChangesStringProperty: ReadOnlyProperty<string>;
    parameterAnnouncementsDescriptionStringProperty: ReadOnlyProperty<string>;
    announceStateChangesStringProperty: ReadOnlyProperty<string>;
    stateAnnouncementsDescriptionStringProperty: ReadOnlyProperty<string>;
    announceDragInteractionsStringProperty: ReadOnlyProperty<string>;
    dragAnnouncementsDescriptionStringProperty: ReadOnlyProperty<string>;
  } {
    // Type assertion needed due to TypeScript's limitations with deeply nested conditional types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioProps = this.stringProperties.preferences.audio as any;
    return {
      simVoicingOptionsStringProperty: audioProps.simVoicingOptionsStringProperty as ReadOnlyProperty<string>,
      announceParameterChangesStringProperty: audioProps.announceParameterChangesStringProperty as ReadOnlyProperty<string>,
      parameterAnnouncementsDescriptionStringProperty: audioProps.parameterAnnouncementsDescriptionStringProperty as ReadOnlyProperty<string>,
      announceStateChangesStringProperty: audioProps.announceStateChangesStringProperty as ReadOnlyProperty<string>,
      stateAnnouncementsDescriptionStringProperty: audioProps.stateAnnouncementsDescriptionStringProperty as ReadOnlyProperty<string>,
      announceDragInteractionsStringProperty: audioProps.announceDragInteractionsStringProperty as ReadOnlyProperty<string>,
      dragAnnouncementsDescriptionStringProperty: audioProps.dragAnnouncementsDescriptionStringProperty as ReadOnlyProperty<string>,
    };
  }

  /**
   * Get solver description string properties
   */
  public getSolverDescriptions(): {
    rk4StringProperty: ReadOnlyProperty<string>;
    adaptiveRK45StringProperty: ReadOnlyProperty<string>;
    forestRuthPEFRLStringProperty: ReadOnlyProperty<string>;
    dormandPrince87StringProperty: ReadOnlyProperty<string>;
  } {
    return {
      rk4StringProperty: this.stringProperties.preferences.solverDescriptions.rk4StringProperty,
      adaptiveRK45StringProperty: this.stringProperties.preferences.solverDescriptions.adaptiveRK45StringProperty,
      forestRuthPEFRLStringProperty: this.stringProperties.preferences.solverDescriptions.forestRuthPEFRLStringProperty,
      dormandPrince87StringProperty: this.stringProperties.preferences.solverDescriptions.dormandPrince87StringProperty,
    };
  }

  /**
   * Get time step option string properties
   */
  public getTimeStepNames(): {
    finestStringProperty: ReadOnlyProperty<string>;
    verySmallStringProperty: ReadOnlyProperty<string>;
    smallStringProperty: ReadOnlyProperty<string>;
    defaultStringProperty: ReadOnlyProperty<string>;
    mediumStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      finestStringProperty: this.stringProperties.preferences.timeSteps.finestStringProperty,
      verySmallStringProperty: this.stringProperties.preferences.timeSteps.verySmallStringProperty,
      smallStringProperty: this.stringProperties.preferences.timeSteps.smallStringProperty,
      defaultStringProperty: this.stringProperties.preferences.timeSteps.defaultStringProperty,
      mediumStringProperty: this.stringProperties.preferences.timeSteps.mediumStringProperty,
    };
  }

  /**
   * Get spring type name string properties
   */
  public getSpringTypeNames(): {
    classicStringProperty: ReadOnlyProperty<string>;
    parametricStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      classicStringProperty: this.stringProperties.preferences.springTypes.classicStringProperty,
      parametricStringProperty: this.stringProperties.preferences.springTypes.parametricStringProperty,
    };
  }

  /**
   * Get spring type description string properties
   */
  public getSpringTypeDescriptions(): {
    classicStringProperty: ReadOnlyProperty<string>;
    parametricStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      classicStringProperty: this.stringProperties.preferences.springTypeDescriptions.classicStringProperty,
      parametricStringProperty: this.stringProperties.preferences.springTypeDescriptions.parametricStringProperty,
    };
  }

  /**
   * Get preset common string properties
   */
  public getPresetLabels(): {
    labelStringProperty: ReadOnlyProperty<string>;
    customStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      labelStringProperty: this.stringProperties.presets.labelStringProperty,
      customStringProperty: this.stringProperties.presets.customStringProperty,
    };
  }

  /**
   * Get single spring preset string properties
   */
  public getSingleSpringPresets(): {
    lightAndBouncyStringProperty: ReadOnlyProperty<string>;
    lightAndBouncyDescStringProperty: ReadOnlyProperty<string>;
    heavyAndSlowStringProperty: ReadOnlyProperty<string>;
    heavyAndSlowDescStringProperty: ReadOnlyProperty<string>;
    criticallyDampedStringProperty: ReadOnlyProperty<string>;
    criticallyDampedDescStringProperty: ReadOnlyProperty<string>;
    underdampedStringProperty: ReadOnlyProperty<string>;
    underdampedDescStringProperty: ReadOnlyProperty<string>;
    overdampedStringProperty: ReadOnlyProperty<string>;
    overdampedDescStringProperty: ReadOnlyProperty<string>;
  } {
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
  public getDoubleSpringPresets(): {
    symmetricStringProperty: ReadOnlyProperty<string>;
    symmetricDescStringProperty: ReadOnlyProperty<string>;
    asymmetricMassesStringProperty: ReadOnlyProperty<string>;
    asymmetricMassesDescStringProperty: ReadOnlyProperty<string>;
    differentSpringsStringProperty: ReadOnlyProperty<string>;
    differentSpringsDescStringProperty: ReadOnlyProperty<string>;
    coupledResonanceStringProperty: ReadOnlyProperty<string>;
    coupledResonanceDescStringProperty: ReadOnlyProperty<string>;
  } {
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
  public getPendulumPresets(): {
    shortAndFastStringProperty: ReadOnlyProperty<string>;
    shortAndFastDescStringProperty: ReadOnlyProperty<string>;
    longAndSlowStringProperty: ReadOnlyProperty<string>;
    longAndSlowDescStringProperty: ReadOnlyProperty<string>;
    smallAngleStringProperty: ReadOnlyProperty<string>;
    smallAngleDescStringProperty: ReadOnlyProperty<string>;
    largeAmplitudeStringProperty: ReadOnlyProperty<string>;
    largeAmplitudeDescStringProperty: ReadOnlyProperty<string>;
  } {
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
  public getDoublePendulumPresets(): {
    synchronizedStringProperty: ReadOnlyProperty<string>;
    synchronizedDescStringProperty: ReadOnlyProperty<string>;
    chaoticDanceStringProperty: ReadOnlyProperty<string>;
    chaoticDanceDescStringProperty: ReadOnlyProperty<string>;
    counterRotationStringProperty: ReadOnlyProperty<string>;
    counterRotationDescStringProperty: ReadOnlyProperty<string>;
    energyTransferStringProperty: ReadOnlyProperty<string>;
    energyTransferDescStringProperty: ReadOnlyProperty<string>;
  } {
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
  public getVisualizationLabels(): {
    showVectorsStringProperty: ReadOnlyProperty<string>;
    showEnergyChartStringProperty: ReadOnlyProperty<string>;
    showGridStringProperty: ReadOnlyProperty<string>;
    velocityStringProperty: ReadOnlyProperty<string>;
    accelerationStringProperty: ReadOnlyProperty<string>;
    forceStringProperty: ReadOnlyProperty<string>;
    gridScaleLabelStringProperty: ReadOnlyProperty<string>;
    kineticStringProperty: ReadOnlyProperty<string>;
    potentialStringProperty: ReadOnlyProperty<string>;
    totalStringProperty: ReadOnlyProperty<string>;
    showDistanceToolStringProperty: ReadOnlyProperty<string>;
    showProtractorStringProperty: ReadOnlyProperty<string>;
    showStopwatchStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      showVectorsStringProperty: this.stringProperties.visualization.showVectorsStringProperty,
      showEnergyChartStringProperty: this.stringProperties.visualization.showEnergyChartStringProperty,
      showGridStringProperty: this.stringProperties.visualization.showGridStringProperty,
      velocityStringProperty: this.stringProperties.visualization.velocityStringProperty,
      accelerationStringProperty: this.stringProperties.visualization.accelerationStringProperty,
      forceStringProperty: this.stringProperties.visualization.forceStringProperty,
      gridScaleLabelStringProperty: this.stringProperties.visualization.grid.scaleLabelStringProperty,
      kineticStringProperty: this.stringProperties.visualization.energy.kineticStringProperty,
      potentialStringProperty: this.stringProperties.visualization.energy.potentialStringProperty,
      totalStringProperty: this.stringProperties.visualization.energy.totalStringProperty,
      showDistanceToolStringProperty: this.stringProperties.visualization.tools.showDistanceToolStringProperty,
      showProtractorStringProperty: this.stringProperties.visualization.tools.showProtractorStringProperty,
      showStopwatchStringProperty: this.stringProperties.visualization.tools.showStopwatchStringProperty,
    };
  }

  /**
   * Get accessibility announcement string properties
   */
  public getAccessibilityStrings(): {
    simulationResetStringProperty: ReadOnlyProperty<string>;
    simulationPlayingStringProperty: ReadOnlyProperty<string>;
    simulationPausedStringProperty: ReadOnlyProperty<string>;
    simulationStartedStringProperty: ReadOnlyProperty<string>;
    steppedForwardStringProperty: ReadOnlyProperty<string>;
    steppedBackwardStringProperty: ReadOnlyProperty<string>;
    speedChangedStringProperty: ReadOnlyProperty<string>;
    draggingMassStringProperty: ReadOnlyProperty<string>;
    draggingMass1StringProperty: ReadOnlyProperty<string>;
    draggingMass2StringProperty: ReadOnlyProperty<string>;
    draggingBobStringProperty: ReadOnlyProperty<string>;
    draggingUpperBobStringProperty: ReadOnlyProperty<string>;
    draggingLowerBobStringProperty: ReadOnlyProperty<string>;
    massReleasedAtStringProperty: ReadOnlyProperty<string>;
    mass1ReleasedAtStringProperty: ReadOnlyProperty<string>;
    mass2ReleasedAtStringProperty: ReadOnlyProperty<string>;
    bobReleasedAtStringProperty: ReadOnlyProperty<string>;
    upperBobReleasedAtStringProperty: ReadOnlyProperty<string>;
    lowerBobReleasedAtStringProperty: ReadOnlyProperty<string>;
    massChangedStringProperty: ReadOnlyProperty<string>;
    springConstantChangedStringProperty: ReadOnlyProperty<string>;
    dampingChangedStringProperty: ReadOnlyProperty<string>;
    lengthChangedStringProperty: ReadOnlyProperty<string>;
    gravityChangedStringProperty: ReadOnlyProperty<string>;
    presetAppliedStringProperty: ReadOnlyProperty<string>;
    graphShownStringProperty: ReadOnlyProperty<string>;
    graphHiddenStringProperty: ReadOnlyProperty<string>;
    xAxisChangedStringProperty: ReadOnlyProperty<string>;
    yAxisChangedStringProperty: ReadOnlyProperty<string>;
    velocityVectorsShownStringProperty: ReadOnlyProperty<string>;
    velocityVectorsHiddenStringProperty: ReadOnlyProperty<string>;
    forceVectorsShownStringProperty: ReadOnlyProperty<string>;
    forceVectorsHiddenStringProperty: ReadOnlyProperty<string>;
    accelerationVectorsShownStringProperty: ReadOnlyProperty<string>;
    accelerationVectorsHiddenStringProperty: ReadOnlyProperty<string>;
    gridShownStringProperty: ReadOnlyProperty<string>;
    gridHiddenStringProperty: ReadOnlyProperty<string>;
    distanceToolShownStringProperty: ReadOnlyProperty<string>;
    distanceToolHiddenStringProperty: ReadOnlyProperty<string>;
    protractorShownStringProperty: ReadOnlyProperty<string>;
    protractorHiddenStringProperty: ReadOnlyProperty<string>;
    stopwatchShownStringProperty: ReadOnlyProperty<string>;
    stopwatchHiddenStringProperty: ReadOnlyProperty<string>;
    solverChangedStringProperty: ReadOnlyProperty<string>;
    springVisualizationChangedStringProperty: ReadOnlyProperty<string>;
  } {
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

      // Visualization changes
      velocityVectorsShownStringProperty: this.stringProperties.accessibility.visualization.velocityVectorsShownStringProperty,
      velocityVectorsHiddenStringProperty: this.stringProperties.accessibility.visualization.velocityVectorsHiddenStringProperty,
      forceVectorsShownStringProperty: this.stringProperties.accessibility.visualization.forceVectorsShownStringProperty,
      forceVectorsHiddenStringProperty: this.stringProperties.accessibility.visualization.forceVectorsHiddenStringProperty,
      accelerationVectorsShownStringProperty: this.stringProperties.accessibility.visualization.accelerationVectorsShownStringProperty,
      accelerationVectorsHiddenStringProperty: this.stringProperties.accessibility.visualization.accelerationVectorsHiddenStringProperty,

      // Tool visibility changes
      gridShownStringProperty: this.stringProperties.accessibility.tools.gridShownStringProperty,
      gridHiddenStringProperty: this.stringProperties.accessibility.tools.gridHiddenStringProperty,
      distanceToolShownStringProperty: this.stringProperties.accessibility.tools.distanceToolShownStringProperty,
      distanceToolHiddenStringProperty: this.stringProperties.accessibility.tools.distanceToolHiddenStringProperty,
      protractorShownStringProperty: this.stringProperties.accessibility.tools.protractorShownStringProperty,
      protractorHiddenStringProperty: this.stringProperties.accessibility.tools.protractorHiddenStringProperty,
      stopwatchShownStringProperty: this.stringProperties.accessibility.tools.stopwatchShownStringProperty,
      stopwatchHiddenStringProperty: this.stringProperties.accessibility.tools.stopwatchHiddenStringProperty,

      // Preference changes
      solverChangedStringProperty: this.stringProperties.accessibility.preferences.solverChangedStringProperty,
      springVisualizationChangedStringProperty: this.stringProperties.accessibility.preferences.springVisualizationChangedStringProperty,
    };
  }

  /**
   * Get keyboard shortcuts string properties
   */
  public getKeyboardShortcutsStrings(): {
    titleStringProperty: ReadOnlyProperty<string>;
    simulationControlsStringProperty: ReadOnlyProperty<string>;
    graphInteractionsStringProperty: ReadOnlyProperty<string>;
    playPauseSimulationStringProperty: ReadOnlyProperty<string>;
    resetSimulationStringProperty: ReadOnlyProperty<string>;
    stepBackwardStringProperty: ReadOnlyProperty<string>;
    stepForwardStringProperty: ReadOnlyProperty<string>;
    resetZoomStringProperty: ReadOnlyProperty<string>;
    zoomInOutStringProperty: ReadOnlyProperty<string>;
    panViewStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      titleStringProperty: this.stringProperties.keyboardShortcuts.titleStringProperty,
      simulationControlsStringProperty: this.stringProperties.keyboardShortcuts.simulationControlsStringProperty,
      graphInteractionsStringProperty: this.stringProperties.keyboardShortcuts.graphInteractionsStringProperty,
      playPauseSimulationStringProperty: this.stringProperties.keyboardShortcuts.playPauseSimulationStringProperty,
      resetSimulationStringProperty: this.stringProperties.keyboardShortcuts.resetSimulationStringProperty,
      stepBackwardStringProperty: this.stringProperties.keyboardShortcuts.stepBackwardStringProperty,
      stepForwardStringProperty: this.stringProperties.keyboardShortcuts.stepForwardStringProperty,
      resetZoomStringProperty: this.stringProperties.keyboardShortcuts.resetZoomStringProperty,
      zoomInOutStringProperty: this.stringProperties.keyboardShortcuts.zoomInOutStringProperty,
      panViewStringProperty: this.stringProperties.keyboardShortcuts.panViewStringProperty,
    };
  }

  /**
   * Get voicing content for Single Spring screen
   */
  public getSingleSpringVoicingStrings(): {
    playAreaStringProperty: ReadOnlyProperty<string>;
    controlAreaStringProperty: ReadOnlyProperty<string>;
    detailsStringProperty: ReadOnlyProperty<string>;
    hintStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      playAreaStringProperty: this.stringProperties.voicing.singleSpring.playAreaStringProperty,
      controlAreaStringProperty: this.stringProperties.voicing.singleSpring.controlAreaStringProperty,
      detailsStringProperty: this.stringProperties.voicing.singleSpring.detailsStringProperty,
      hintStringProperty: this.stringProperties.voicing.singleSpring.hintStringProperty,
    };
  }

  /**
   * Get voicing content for Double Spring screen
   */
  public getDoubleSpringVoicingStrings(): {
    playAreaStringProperty: ReadOnlyProperty<string>;
    controlAreaStringProperty: ReadOnlyProperty<string>;
    detailsStringProperty: ReadOnlyProperty<string>;
    hintStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      playAreaStringProperty: this.stringProperties.voicing.doubleSpring.playAreaStringProperty,
      controlAreaStringProperty: this.stringProperties.voicing.doubleSpring.controlAreaStringProperty,
      detailsStringProperty: this.stringProperties.voicing.doubleSpring.detailsStringProperty,
      hintStringProperty: this.stringProperties.voicing.doubleSpring.hintStringProperty,
    };
  }

  /**
   * Get voicing content for Pendulum screen
   */
  public getPendulumVoicingStrings(): {
    playAreaStringProperty: ReadOnlyProperty<string>;
    controlAreaStringProperty: ReadOnlyProperty<string>;
    detailsStringProperty: ReadOnlyProperty<string>;
    hintStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      playAreaStringProperty: this.stringProperties.voicing.pendulum.playAreaStringProperty,
      controlAreaStringProperty: this.stringProperties.voicing.pendulum.controlAreaStringProperty,
      detailsStringProperty: this.stringProperties.voicing.pendulum.detailsStringProperty,
      hintStringProperty: this.stringProperties.voicing.pendulum.hintStringProperty,
    };
  }

  /**
   * Get voicing content for Double Pendulum screen
   */
  public getDoublePendulumVoicingStrings(): {
    playAreaStringProperty: ReadOnlyProperty<string>;
    controlAreaStringProperty: ReadOnlyProperty<string>;
    detailsStringProperty: ReadOnlyProperty<string>;
    hintStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      playAreaStringProperty: this.stringProperties.voicing.doublePendulum.playAreaStringProperty,
      controlAreaStringProperty: this.stringProperties.voicing.doublePendulum.controlAreaStringProperty,
      detailsStringProperty: this.stringProperties.voicing.doublePendulum.detailsStringProperty,
      hintStringProperty: this.stringProperties.voicing.doublePendulum.hintStringProperty,
    };
  }

  /**
   * Get all raw string properties
   * This can be used if direct access is needed to a specific string property
   */
  public getAllStringProperties(): typeof this.stringProperties {
    return this.stringProperties;
  }
}
