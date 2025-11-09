/**
 * Icon for the Double Spring screen.
 * Shows two masses connected by springs in a vertical arrangement.
 */

import { ScreenIcon } from "scenerystack/sim";
import { Node, Rectangle, Path } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";

export class DoubleSpringScreenIcon extends ScreenIcon {
  public constructor() {
    // Spring dimensions
    const SPRING_WIDTH = 25;
    const NUMBER_OF_COILS = 6;
    const SPRING_STROKE_WIDTH = 2.5;
    const TOP_SPRING_HEIGHT = 50;
    const MIDDLE_SPRING_HEIGHT = 45;

    // Mass dimensions
    const MASS_WIDTH = 45;
    const MASS_HEIGHT = 35;
    const MASS_STROKE_WIDTH = 2;

    // Anchor dimensions
    const ANCHOR_X = -25;
    const ANCHOR_Y = -10;
    const ANCHOR_WIDTH = 50;
    const ANCHOR_HEIGHT = 10;
    const ANCHOR_STROKE_WIDTH = 1;

    // Positioning
    const TOP_SPRING_X = 0;
    const TOP_SPRING_Y = 0;
    const MASS1_Y = 50;
    const MIDDLE_SPRING_X = 0;
    const MIDDLE_SPRING_Y = 85;
    const MASS2_Y = 130;

    // Icon proportions
    const MAX_ICON_WIDTH_PROPORTION = 0.5;
    const MAX_ICON_HEIGHT_PROPORTION = 0.85;

    // Coil drawing constants
    const FIRST_SEGMENT_FRACTION = 1 / 3;
    const SECOND_SEGMENT_FRACTION = 2 / 3;

    // Helper function to create a spring shape
    const createSpring = (height: number, x: number, y: number) => {
      const coilHeight = height / NUMBER_OF_COILS;

      const springShape = new Shape();
      springShape.moveTo(x, y);

      for (let i = 0; i < NUMBER_OF_COILS; i++) {
        const y1 = y + i * coilHeight + coilHeight * FIRST_SEGMENT_FRACTION;
        const y2 = y + i * coilHeight + coilHeight * SECOND_SEGMENT_FRACTION;
        const y3 = y + (i + 1) * coilHeight;

        springShape.lineTo(x + SPRING_WIDTH / 2, y1);
        springShape.lineTo(x - SPRING_WIDTH / 2, y2);
        springShape.lineTo(x, y3);
      }

      return new Path(springShape, {
        stroke: "#666666",
        lineWidth: SPRING_STROKE_WIDTH,
        lineCap: "round",
        lineJoin: "round",
      });
    };

    // Create ceiling anchor
    const anchor = new Rectangle(ANCHOR_X, ANCHOR_Y, ANCHOR_WIDTH, ANCHOR_HEIGHT, {
      fill: "#888888",
      stroke: "#555555",
      lineWidth: ANCHOR_STROKE_WIDTH,
    });

    // Create top spring
    const topSpring = createSpring(TOP_SPRING_HEIGHT, TOP_SPRING_X, TOP_SPRING_Y);

    // Create first mass
    const mass1 = new Rectangle(-MASS_WIDTH / 2, MASS1_Y, MASS_WIDTH, MASS_HEIGHT, {
      fill: "#64AAFF",
      stroke: "#468CDC",
      lineWidth: MASS_STROKE_WIDTH,
    });

    // Create middle spring
    const middleSpring = createSpring(MIDDLE_SPRING_HEIGHT, MIDDLE_SPRING_X, MIDDLE_SPRING_Y);

    // Create second mass
    const mass2 = new Rectangle(-MASS_WIDTH / 2, MASS2_Y, MASS_WIDTH, MASS_HEIGHT, {
      fill: "#FF9632",
      stroke: "#E67814",
      lineWidth: MASS_STROKE_WIDTH,
    });

    // Combine all elements
    const iconNode = new Node({
      children: [anchor, topSpring, mass1, middleSpring, mass2],
    });

    super(iconNode, {
      fill: "white",
      maxIconWidthProportion: MAX_ICON_WIDTH_PROPORTION,
      maxIconHeightProportion: MAX_ICON_HEIGHT_PROPORTION,
    });
  }
}
