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
   * Get all raw string properties
   * This can be used if direct access is needed to a specific string property
   */
  public getAllStringProperties() {
    return this.stringProperties;
  }
}
