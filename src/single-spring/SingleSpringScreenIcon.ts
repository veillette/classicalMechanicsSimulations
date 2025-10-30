/**
 * Icon for the Single Spring screen.
 * Shows a simple spring with a mass attached.
 */

import { ScreenIcon } from "scenerystack/sim";
import { Node, Rectangle, Path } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";

export class SingleSpringScreenIcon extends ScreenIcon {
  public constructor() {
    // Create the spring path - a vertical zigzag pattern
    const springWidth = 30;
    const springHeight = 80;
    const coils = 8;
    const coilHeight = springHeight / coils;

    const springShape = new Shape();
    springShape.moveTo(0, 0);

    for (let i = 0; i < coils; i++) {
      const y1 = i * coilHeight + coilHeight / 3;
      const y2 = i * coilHeight + (2 * coilHeight) / 3;
      const y3 = (i + 1) * coilHeight;

      springShape.lineTo(springWidth / 2, y1);
      springShape.lineTo(-springWidth / 2, y2);
      springShape.lineTo(0, y3);
    }

    const spring = new Path(springShape, {
      stroke: "#666666",
      lineWidth: 3,
      lineCap: "round",
      lineJoin: "round",
    });

    // Create the mass - a simple rectangle
    const massWidth = 50;
    const massHeight = 40;
    const mass = new Rectangle(0, 0, massWidth, massHeight, {
      fill: "#4A90E2",
      stroke: "#2E5C8A",
      lineWidth: 2,
      centerX: 0,
      top: springHeight + 5,
    });

    // Create a ceiling anchor point
    const anchor = new Rectangle(-20, -10, 40, 10, {
      fill: "#888888",
      stroke: "#555555",
      lineWidth: 1,
    });

    // Combine all elements
    const iconNode = new Node({
      children: [anchor, spring, mass],
    });

    super(iconNode, {
      fill: "white",
      maxIconWidthProportion: 0.6,
      maxIconHeightProportion: 0.8,
    });
  }
}
