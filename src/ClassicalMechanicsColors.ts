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
      default: WHITE,
      projector: WHITE,
    },
  ),

  // Graph colors
  graphBackgroundColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphBackgroundColor",
    {
      default: WHITE,
      projector: WHITE,
    },
  ),

  graphBorderColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphBorderColor",
    {
      default: BLACK,
      projector: BLACK,
    },
  ),

  graphGridColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphGridColor",
    {
      default: new Color(211, 211, 211), // lightgray
      projector: new Color(180, 180, 180),
    },
  ),

  graphAxisColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphAxisColor",
    {
      default: BLACK,
      projector: BLACK,
    },
  ),

  graphLabelColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphLabelColor",
    {
      default: BLACK,
      projector: BLACK,
    },
  ),

  graphPanelBackgroundColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphPanelBackgroundColor",
    {
      default: new Color(230, 230, 230),
      projector: new Color(245, 245, 245),
    },
  ),

  graphPanelStrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphPanelStrokeColor",
    {
      default: new Color(128, 128, 128), // gray
      projector: new Color(150, 150, 150),
    },
  ),

  // Control panel colors
  controlPanelBackgroundColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "controlPanelBackgroundColor",
    {
      default: new Color(255, 255, 255, 0.8),
      projector: new Color(255, 255, 255, 0.9),
    },
  ),

  controlPanelStrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "controlPanelStrokeColor",
    {
      default: new Color(204, 204, 204), // #ccc
      projector: new Color(180, 180, 180),
    },
  ),

  // Spring colors
  springFrontColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "springFrontColor",
    {
      default: new Color(136, 136, 136), // #888888
      projector: new Color(100, 100, 100),
    },
  ),

  springBackColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "springBackColor",
    {
      default: new Color(68, 68, 68), // #444444
      projector: new Color(50, 50, 50),
    },
  ),

  // Mass/Bob colors - Blue variant
  mass1FillColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "mass1FillColor",
    {
      default: new Color(74, 144, 226), // #4A90E2
      projector: new Color(50, 120, 200),
    },
  ),

  mass1StrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "mass1StrokeColor",
    {
      default: new Color(46, 92, 138), // #2E5C8A
      projector: new Color(30, 80, 130),
    },
  ),

  // Mass/Bob colors - Orange variant
  mass2FillColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "mass2FillColor",
    {
      default: new Color(230, 126, 34), // #E67E22
      projector: new Color(200, 100, 30),
    },
  ),

  mass2StrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "mass2StrokeColor",
    {
      default: new Color(211, 84, 0), // #D35400
      projector: new Color(180, 70, 0),
    },
  ),

  // Pendulum pivot colors
  pivotFillColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "pivotFillColor",
    {
      default: new Color(51, 51, 51), // #333
      projector: new Color(40, 40, 40),
    },
  ),

  pivotStrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "pivotStrokeColor",
    {
      default: BLACK,
      projector: BLACK,
    },
  ),

  // Rod/Connector colors
  rodStrokeColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "rodStrokeColor",
    {
      default: new Color(102, 102, 102), // #666
      projector: new Color(80, 80, 80),
    },
  ),

  // Graph line colors (for plotting data)
  graphLine1ColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphLine1Color",
    {
      default: new Color(0, 255, 0), // lime
      projector: new Color(0, 180, 0),
    },
  ),

  graphLine2ColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphLine2Color",
    {
      default: new Color(255, 0, 0), // red
      projector: new Color(200, 0, 0),
    },
  ),

  graphLine3ColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphLine3Color",
    {
      default: new Color(0, 0, 255), // blue
      projector: new Color(0, 0, 200),
    },
  ),

  graphLine4ColorProperty: new ProfileColorProperty(
    classicalMechanics,
    "graphLine4Color",
    {
      default: new Color(255, 165, 0), // orange
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
