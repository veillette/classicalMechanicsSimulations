/**
 * Icon for the Double Spring screen.
 * Shows two masses connected by springs in a vertical arrangement.
 */

import { ScreenIcon } from "scenerystack/sim";
import { Node, Rectangle, Path } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";

export class DoubleSpringScreenIcon extends ScreenIcon {
  public constructor() {
    // Helper function to create a spring shape
    const createSpring = (height: number, x: number, y: number) => {
      const springWidth = 25;
      const coils = 6;
      const coilHeight = height / coils;

      const springShape = new Shape();
      springShape.moveTo(x, y);

      for (let i = 0; i < coils; i++) {
        const y1 = y + i * coilHeight + coilHeight / 3;
        const y2 = y + i * coilHeight + (2 * coilHeight) / 3;
        const y3 = y + (i + 1) * coilHeight;

        springShape.lineTo(x + springWidth / 2, y1);
        springShape.lineTo(x - springWidth / 2, y2);
        springShape.lineTo(x, y3);
      }

      return new Path(springShape, {
        stroke: "#666666",
        lineWidth: 2.5,
        lineCap: "round",
        lineJoin: "round",
      });
    };

    // Create ceiling anchor
    const anchor = new Rectangle(-25, -10, 50, 10, {
      fill: "#888888",
      stroke: "#555555",
      lineWidth: 1,
    });

    // Create top spring
    const topSpring = createSpring(50, 0, 0);

    // Create first mass
    const massWidth = 45;
    const massHeight = 35;
    const mass1 = new Rectangle(-massWidth / 2, 50, massWidth, massHeight, {
      fill: "#4A90E2",
      stroke: "#2E5C8A",
      lineWidth: 2,
    });

    // Create middle spring
    const middleSpring = createSpring(45, 0, 85);

    // Create second mass
    const mass2 = new Rectangle(-massWidth / 2, 130, massWidth, massHeight, {
      fill: "#E24A90",
      stroke: "#8A2E5C",
      lineWidth: 2,
    });

    // Combine all elements
    const iconNode = new Node({
      children: [anchor, topSpring, mass1, middleSpring, mass2],
    });

    super(iconNode, {
      fill: "white",
      maxIconWidthProportion: 0.5,
      maxIconHeightProportion: 0.85,
    });
  }
}
