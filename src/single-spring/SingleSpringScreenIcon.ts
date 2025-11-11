/**
 * Icon for the Single Spring screen.
 * Shows a simple spring with a mass attached.
 */

import { ScreenIcon } from "scenerystack/sim";
import { Node, Rectangle, Path } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";
import classicalMechanics from '../ClassicalMechanicsNamespace.js';

export class SingleSpringScreenIcon extends ScreenIcon {
  public constructor() {
    // Spring dimensions
    const SPRING_WIDTH = 30;
    const SPRING_HEIGHT = 80;
    const NUMBER_OF_COILS = 8;
    const SPRING_STROKE_WIDTH = 3;

    // Mass dimensions
    const MASS_WIDTH = 50;
    const MASS_HEIGHT = 40;
    const MASS_STROKE_WIDTH = 2;
    const SPRING_TO_MASS_SPACING = 0;

    // Anchor dimensions
    const ANCHOR_X = -20;
    const ANCHOR_Y = -10;
    const ANCHOR_WIDTH = 40;
    const ANCHOR_HEIGHT = 10;
    const ANCHOR_STROKE_WIDTH = 1;

    // Icon proportions
    const MAX_ICON_WIDTH_PROPORTION = 0.6;
    const MAX_ICON_HEIGHT_PROPORTION = 0.8;

    // Coil drawing constants
    const FIRST_SEGMENT_FRACTION = 1 / 3;
    const SECOND_SEGMENT_FRACTION = 2 / 3;

    // Create the spring path - a vertical zigzag pattern
    const coilHeight = SPRING_HEIGHT / NUMBER_OF_COILS;

    const springShape = new Shape();
    springShape.moveTo(0, 0);

    for (let i = 0; i < NUMBER_OF_COILS; i++) {
      const y1 = i * coilHeight + coilHeight * FIRST_SEGMENT_FRACTION;
      const y2 = i * coilHeight + coilHeight * SECOND_SEGMENT_FRACTION;
      const y3 = (i + 1) * coilHeight;

      springShape.lineTo(SPRING_WIDTH / 2, y1);
      springShape.lineTo(-SPRING_WIDTH / 2, y2);
      springShape.lineTo(0, y3);
    }

    const spring = new Path(springShape, {
      stroke: "#666666",
      lineWidth: SPRING_STROKE_WIDTH,
      lineCap: "round",
      lineJoin: "round",
    });

    // Create the mass - a simple rectangle
    const mass = new Rectangle(0, 0, MASS_WIDTH, MASS_HEIGHT, {
      fill: "#64AAFF",
      stroke: "#468CDC",
      lineWidth: MASS_STROKE_WIDTH,
      centerX: 0,
      top: SPRING_HEIGHT + SPRING_TO_MASS_SPACING,
    });

    // Create a ceiling anchor point
    const anchor = new Rectangle(ANCHOR_X, ANCHOR_Y, ANCHOR_WIDTH, ANCHOR_HEIGHT, {
      fill: "#888888",
      stroke: "#555555",
      lineWidth: ANCHOR_STROKE_WIDTH,
    });

    // Combine all elements
    const iconNode = new Node({
      children: [anchor, spring, mass],
    });

    super(iconNode, {
      fill: "white",
      maxIconWidthProportion: MAX_ICON_WIDTH_PROPORTION,
      maxIconHeightProportion: MAX_ICON_HEIGHT_PROPORTION,
    });
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('SingleSpringScreenIcon', SingleSpringScreenIcon);
