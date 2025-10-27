/**
 * ClassicalMechanicsColors.ts
 *
 * Central location for all colors used in the Classical Mechanics Simulations, providing
 * support for different color profiles (default and projector mode).
 */

import { Color, ProfileColorProperty } from "scenerystack";
import classicalMechanics from "./ClassicalMechanicsNamespace.js";

// Basic color constants
const BLACK = new Color(0, 0, 0);
const WHITE = new Color(255, 255, 255);

/**
 * Color definitions for the Classical Mechanics Simulations
 */
const ClassicalMechanicsColors = {
  // Background colors
  backgroundColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "backgroundColor",
    {
      default: BLACK,
      projector: WHITE,
    },
  ),

  // Graph colors
  graphBackgroundColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphBackgroundColor",
    {
      default: new Color(25, 25, 25), // dark gray for default
      projector: WHITE,
    },
  ),

  graphBorderColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphBorderColor",
    {
      default: WHITE,
      projector: BLACK,
    },
  ),

  graphGridColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphGridColor",
    {
      default: new Color(60, 60, 60), // darker grid for black background
      projector: new Color(180, 180, 180),
    },
  ),

  graphAxisColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphAxisColor",
    {
      default: WHITE,
      projector: BLACK,
    },
  ),

  graphLabelColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphLabelColor",
    {
      default: WHITE,
      projector: BLACK,
    },
  ),

  graphPanelBackgroundColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphPanelBackgroundColor",
    {
      default: new Color(40, 40, 40, 0.9), // dark panel for default
      projector: new Color(245, 245, 245),
    },
  ),

  graphPanelStrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphPanelStrokeColor",
    {
      default: new Color(120, 120, 120), // lighter stroke for dark background
      projector: new Color(150, 150, 150),
    },
  ),

  // Control panel colors
  controlPanelBackgroundColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "controlPanelBackgroundColor",
    {
      default: new Color(30, 30, 30, 0.9), // dark semi-transparent for default
      projector: new Color(255, 255, 255, 0.9),
    },
  ),

  controlPanelStrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "controlPanelStrokeColor",
    {
      default: new Color(100, 100, 100), // lighter stroke for dark background
      projector: new Color(180, 180, 180),
    },
  ),

  // Spring colors
  springFrontColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "springFrontColor",
    {
      default: new Color(180, 180, 180), // lighter for dark background
      projector: new Color(100, 100, 100),
    },
  ),

  springBackColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "springBackColor",
    {
      default: new Color(120, 120, 120), // lighter for dark background
      projector: new Color(50, 50, 50),
    },
  ),

  // Mass/Bob colors - Blue variant
  mass1FillColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "mass1FillColor",
    {
      default: new Color(100, 170, 255), // brighter blue for dark background
      projector: new Color(50, 120, 200),
    },
  ),

  mass1StrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "mass1StrokeColor",
    {
      default: new Color(70, 140, 220), // brighter stroke for dark background
      projector: new Color(30, 80, 130),
    },
  ),

  // Mass/Bob colors - Orange variant
  mass2FillColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "mass2FillColor",
    {
      default: new Color(255, 150, 50), // brighter orange for dark background
      projector: new Color(200, 100, 30),
    },
  ),

  mass2StrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "mass2StrokeColor",
    {
      default: new Color(230, 120, 20), // brighter stroke for dark background
      projector: new Color(180, 70, 0),
    },
  ),

  // Pendulum pivot colors
  pivotFillColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "pivotFillColor",
    {
      default: new Color(160, 160, 160), // much lighter for dark background
      projector: new Color(40, 40, 40),
    },
  ),

  pivotStrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "pivotStrokeColor",
    {
      default: WHITE,
      projector: BLACK,
    },
  ),

  // Rod/Connector colors
  rodStrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "rodStrokeColor",
    {
      default: new Color(200, 200, 200), // much lighter for dark background
      projector: new Color(80, 80, 80),
    },
  ),

  // Graph line colors (for plotting data)
  graphLine1ColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphLine1Color",
    {
      default: new Color(50, 255, 50), // bright lime for dark background
      projector: new Color(0, 180, 0),
    },
  ),

  graphLine2ColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphLine2Color",
    {
      default: new Color(255, 80, 80), // bright red for dark background
      projector: new Color(200, 0, 0),
    },
  ),

  graphLine3ColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphLine3Color",
    {
      default: new Color(100, 150, 255), // bright blue for dark background
      projector: new Color(0, 0, 200),
    },
  ),

  graphLine4ColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphLine4Color",
    {
      default: new Color(255, 200, 50), // bright orange for dark background
      projector: new Color(220, 140, 0),
    },
  ),
};

// Register the namespace
classicalMechanics.register(
  "ClassicalMechanicsColors",
  ClassicalMechanicsColors,
);

export default ClassicalMechanicsColors;
