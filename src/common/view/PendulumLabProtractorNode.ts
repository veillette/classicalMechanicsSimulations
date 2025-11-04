/**
 * Protractor node adapted from PhET's Pendulum Lab simulation.
 * Displays a protractor with degree markings and pendulum angle indicators.
 *
 * Original implementation: https://github.com/phetsims/pendulum-lab
 * Copyright 2014-2025, University of Colorado Boulder
 */

import { Circle, Line, Node, Path, Text } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";
import { Vector2 } from "scenerystack/dot";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { type TReadOnlyProperty } from "scenerystack/axon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";

// Constants for protractor appearance
const LINE_LENGTH_DEFAULT = 3.6;
const PENDULUM_TICK_LENGTH = 14.7;
const RADIUS = 106;
const TICK_5_LENGTH = 7.3;
const TICK_10_LENGTH = 11;

export interface PendulumData {
  angleProperty: TReadOnlyProperty<number>;
  isDraggingProperty?: TReadOnlyProperty<boolean>;
  color?: string;
  lengthProperty: TReadOnlyProperty<number>;
}

export interface PendulumLabProtractorNodeOptions {
  pickable?: boolean;
}

/**
 * Protractor node that displays angle measurements for pendulum simulations.
 */
export class PendulumLabProtractorNode extends Node {
  /**
   * @param pendulumData - Data for the pendulum (angle, color, etc.)
   * @param modelViewTransform - Transform between model and view coordinates
   * @param options - Optional configuration
   */
  public constructor(
    pendulumData: PendulumData,
    modelViewTransform: ModelViewTransform2,
    options?: PendulumLabProtractorNodeOptions
  ) {
    // Get the color from pendulum data or use default
    const pendulumColor = pendulumData.color || ClassicalMechanicsColors.mass2FillColorProperty.value;

    // Central dashed reference line (vertical line from pivot)
    const maxLength = modelViewTransform.modelToViewDeltaX(
      pendulumData.lengthProperty.value * 1.2
    );
    const centralDashLine = new Line(0, 0, 0, maxLength, {
      stroke: pendulumColor,
      lineDash: [4, 7],
    });

    // Pivot visualization
    const pivotDot = new Circle(2, { fill: "black" });
    const pivotCircle = new Circle(5, { stroke: pendulumColor });

    // Create background ticks for the protractor
    const protractorShape = new Shape();
    for (let currentAngleDegrees = 0; currentAngleDegrees <= 180; currentAngleDegrees += 1) {
      let tickLength: number;

      // Calculate the angle in radians
      const currentAngle = currentAngleDegrees * Math.PI / 180;

      // Determine tick length based on degree intervals
      if (currentAngleDegrees % 10 === 0) {
        tickLength = TICK_10_LENGTH; // Longest ticks at 10° intervals
      } else if (currentAngleDegrees % 5 === 0) {
        tickLength = TICK_5_LENGTH; // Medium ticks at 5° intervals
      } else {
        tickLength = LINE_LENGTH_DEFAULT; // Short ticks for 1° intervals
      }

      // Draw the tick by creating a line from radius to radius + tickLength
      protractorShape.moveToPoint(Vector2.createPolar(RADIUS, currentAngle));
      protractorShape.lineToPoint(Vector2.createPolar(RADIUS + tickLength, currentAngle));
    }

    const protractorPath = new Path(protractorShape, {
      stroke: "black",
      lineWidth: 0.5,
    });

    // Layer for the pendulum angle tick marks
    const pendulumTickLayer = new Node();

    // Layer for degrees labels
    const degreesLayer = new Node();

    // Initialize the node with all children
    super({
      pickable: options?.pickable ?? false,
      translation: modelViewTransform.modelToViewPosition(Vector2.ZERO),
      children: [
        centralDashLine,
        pivotDot,
        pivotCircle,
        degreesLayer,
        protractorPath,
        pendulumTickLayer,
      ],
    });

    // Create tick marks for the pendulum angle (left and right of vertical)
    const tickNodeLeft = new Line(
      RADIUS - PENDULUM_TICK_LENGTH - 2,
      0,
      RADIUS - 2,
      0,
      {
        stroke: pendulumColor,
        lineWidth: 2,
      }
    );
    pendulumTickLayer.addChild(tickNodeLeft);

    const tickNodeRight = new Line(
      RADIUS - PENDULUM_TICK_LENGTH - 2,
      0,
      RADIUS - 2,
      0,
      {
        stroke: pendulumColor,
        lineWidth: 2,
      }
    );
    pendulumTickLayer.addChild(tickNodeRight);

    // Function to update tick positions based on pendulum angle
    const updateTicksPosition = () => {
      const angle = pendulumData.angleProperty.value;
      tickNodeLeft.setRotation(Math.PI / 2 - angle);
      tickNodeRight.setRotation(Math.PI / 2 + angle);
    };

    // Create text to display the angle in degrees
    const degreesText = new Text("0°", {
      centerY: 15,
      font: "14px Arial",
      fill: pendulumColor,
    });
    degreesLayer.addChild(degreesText);

    // Function to update the degrees text
    const updateDegreesText = () => {
      const angle = pendulumData.angleProperty.value;
      const degrees = angle * 180 / Math.PI;

      degreesText.string = `${Math.abs(degrees).toFixed(0)}°`;

      // Position text based on which side of vertical the pendulum is on
      if (angle < 0) {
        degreesText.right = -25;
      } else {
        degreesText.left = 35;
      }
    };

    // Update tick position and text when angle changes
    pendulumData.angleProperty.link(() => {
      updateTicksPosition();
      updateDegreesText();
    });

    // If isDraggingProperty is provided, control visibility of ticks and text
    if (pendulumData.isDraggingProperty) {
      pendulumData.isDraggingProperty.link((isDragging: boolean) => {
        tickNodeLeft.visible = isDragging;
        tickNodeRight.visible = isDragging;
        degreesText.visible = isDragging;
        if (isDragging) {
          updateTicksPosition();
          updateDegreesText();
        }
      });
    } else {
      // If no dragging property, always show the ticks and text
      tickNodeLeft.visible = true;
      tickNodeRight.visible = true;
      degreesText.visible = true;
    }

    // Update central line length if pendulum length changes
    pendulumData.lengthProperty.link((length: number) => {
      const newMaxLength = modelViewTransform.modelToViewDeltaX(length * 1.2);
      centralDashLine.setLine(0, 0, 0, newMaxLength);
    });
  }
}
