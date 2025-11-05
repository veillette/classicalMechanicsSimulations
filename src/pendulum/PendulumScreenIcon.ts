/**
 * Icon for the Pendulum screen.
 * Shows a simple pendulum with a pivot point, rod, and bob.
 */

import { ScreenIcon } from "scenerystack/sim";
import { Node, Circle, Line, Rectangle } from "scenerystack/scenery";

export class PendulumScreenIcon extends ScreenIcon {
  public constructor() {
    // Anchor dimensions
    const ANCHOR_X = -25;
    const ANCHOR_Y = -10;
    const ANCHOR_WIDTH = 50;
    const ANCHOR_HEIGHT = 10;
    const ANCHOR_STROKE_WIDTH = 1;

    // Pivot dimensions
    const PIVOT_RADIUS = 5;
    const PIVOT_STROKE_WIDTH = 1.5;

    // Rod dimensions and angle
    const ROD_LENGTH = 100;
    const ROD_ANGLE = Math.PI / 6; // 30 degrees
    const ROD_STROKE_WIDTH = 3;

    // Bob dimensions
    const BOB_RADIUS = 18;
    const BOB_STROKE_WIDTH = 2;

    // Icon proportions
    const MAX_ICON_WIDTH_PROPORTION = 0.6;
    const MAX_ICON_HEIGHT_PROPORTION = 0.8;

    // Create ceiling anchor
    const anchor = new Rectangle(ANCHOR_X, ANCHOR_Y, ANCHOR_WIDTH, ANCHOR_HEIGHT, {
      fill: "#888888",
      stroke: "#555555",
      lineWidth: ANCHOR_STROKE_WIDTH,
    });

    // Create pivot point
    const pivot = new Circle(PIVOT_RADIUS, {
      fill: "#555555",
      stroke: "#333333",
      lineWidth: PIVOT_STROKE_WIDTH,
      centerX: 0,
      centerY: 0,
    });

    // Create the rod at an angle (about 30 degrees)
    const rodEndX = ROD_LENGTH * Math.sin(ROD_ANGLE);
    const rodEndY = ROD_LENGTH * Math.cos(ROD_ANGLE);

    const rod = new Line(0, 0, rodEndX, rodEndY, {
      stroke: "#666666",
      lineWidth: ROD_STROKE_WIDTH,
      lineCap: "round",
    });

    // Create the bob (pendulum mass)
    const bob = new Circle(BOB_RADIUS, {
      fill: "#4A90E2",
      stroke: "#2E5C8A",
      lineWidth: BOB_STROKE_WIDTH,
      centerX: rodEndX,
      centerY: rodEndY,
    });

    // Combine all elements
    const iconNode = new Node({
      children: [anchor, rod, pivot, bob],
    });

    super(iconNode, {
      fill: "white",
      maxIconWidthProportion: MAX_ICON_WIDTH_PROPORTION,
      maxIconHeightProportion: MAX_ICON_HEIGHT_PROPORTION,
    });
  }
}
