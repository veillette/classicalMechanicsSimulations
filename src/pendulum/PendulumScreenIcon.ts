/**
 * Icon for the Pendulum screen.
 * Shows a simple pendulum with a pivot point, rod, and bob.
 */

import { ScreenIcon } from "scenerystack/sim";
import { Node, Circle, Line, Rectangle } from "scenerystack/scenery";

export class PendulumScreenIcon extends ScreenIcon {
  public constructor() {
    // Create ceiling anchor
    const anchor = new Rectangle(-25, -10, 50, 10, {
      fill: "#888888",
      stroke: "#555555",
      lineWidth: 1,
    });

    // Create pivot point
    const pivot = new Circle(5, {
      fill: "#555555",
      stroke: "#333333",
      lineWidth: 1.5,
      centerX: 0,
      centerY: 0,
    });

    // Create the rod at an angle (about 30 degrees)
    const rodLength = 100;
    const angle = Math.PI / 6; // 30 degrees
    const rodEndX = rodLength * Math.sin(angle);
    const rodEndY = rodLength * Math.cos(angle);

    const rod = new Line(0, 0, rodEndX, rodEndY, {
      stroke: "#666666",
      lineWidth: 3,
      lineCap: "round",
    });

    // Create the bob (pendulum mass)
    const bobRadius = 18;
    const bob = new Circle(bobRadius, {
      fill: "#4A90E2",
      stroke: "#2E5C8A",
      lineWidth: 2,
      centerX: rodEndX,
      centerY: rodEndY,
    });

    // Combine all elements
    const iconNode = new Node({
      children: [anchor, rod, pivot, bob],
    });

    super(iconNode, {
      fill: "white",
      maxIconWidthProportion: 0.6,
      maxIconHeightProportion: 0.8,
    });
  }
}
