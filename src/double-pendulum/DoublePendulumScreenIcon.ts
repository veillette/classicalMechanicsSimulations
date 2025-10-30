/**
 * Icon for the Double Pendulum screen.
 * Shows two connected pendulums demonstrating the double pendulum system.
 */

import { ScreenIcon } from "scenerystack/sim";
import { Node, Circle, Line, Rectangle } from "scenerystack/scenery";

export class DoublePendulumScreenIcon extends ScreenIcon {
  public constructor() {
    // Create ceiling anchor
    const anchor = new Rectangle(-25, -10, 50, 10, {
      fill: "#888888",
      stroke: "#555555",
      lineWidth: 1,
    });

    // Create top pivot point
    const topPivot = new Circle(4, {
      fill: "#555555",
      stroke: "#333333",
      lineWidth: 1.5,
      centerX: 0,
      centerY: 0,
    });

    // First pendulum rod (at about 25 degrees)
    const rod1Length = 60;
    const angle1 = Math.PI / 7; // ~25 degrees
    const rod1EndX = rod1Length * Math.sin(angle1);
    const rod1EndY = rod1Length * Math.cos(angle1);

    const rod1 = new Line(0, 0, rod1EndX, rod1EndY, {
      stroke: "#666666",
      lineWidth: 2.5,
      lineCap: "round",
    });

    // First bob
    const bob1Radius = 14;
    const bob1 = new Circle(bob1Radius, {
      fill: "#4A90E2",
      stroke: "#2E5C8A",
      lineWidth: 2,
      centerX: rod1EndX,
      centerY: rod1EndY,
    });

    // Middle pivot point
    const middlePivot = new Circle(3, {
      fill: "#555555",
      stroke: "#333333",
      lineWidth: 1.5,
      centerX: rod1EndX,
      centerY: rod1EndY,
    });

    // Second pendulum rod (at a different angle, about -40 degrees relative to vertical)
    const rod2Length = 55;
    const angle2 = -Math.PI / 4.5; // ~-40 degrees
    const rod2EndX = rod1EndX + rod2Length * Math.sin(angle2);
    const rod2EndY = rod1EndY + rod2Length * Math.cos(angle2);

    const rod2 = new Line(rod1EndX, rod1EndY, rod2EndX, rod2EndY, {
      stroke: "#666666",
      lineWidth: 2.5,
      lineCap: "round",
    });

    // Second bob
    const bob2Radius = 14;
    const bob2 = new Circle(bob2Radius, {
      fill: "#E24A90",
      stroke: "#8A2E5C",
      lineWidth: 2,
      centerX: rod2EndX,
      centerY: rod2EndY,
    });

    // Combine all elements
    const iconNode = new Node({
      children: [anchor, rod1, rod2, topPivot, bob1, middlePivot, bob2],
    });

    super(iconNode, {
      fill: "white",
      maxIconWidthProportion: 0.65,
      maxIconHeightProportion: 0.85,
    });
  }
}
