/**
 * Icon for the Double Pendulum screen.
 * Shows two connected pendulums demonstrating the double pendulum system.
 */

import { ScreenIcon } from "scenerystack/sim";
import { Node, Circle, Line, Rectangle } from "scenerystack/scenery";
import classicalMechanics from '../ClassicalMechanicsNamespace.js';

export class DoublePendulumScreenIcon extends ScreenIcon {
  public constructor() {
    // Anchor dimensions
    const ANCHOR_X = -25;
    const ANCHOR_Y = -10;
    const ANCHOR_WIDTH = 50;
    const ANCHOR_HEIGHT = 10;
    const ANCHOR_STROKE_WIDTH = 1;

    // Pivot dimensions
    const TOP_PIVOT_RADIUS = 4;
    const MIDDLE_PIVOT_RADIUS = 3;
    const PIVOT_STROKE_WIDTH = 1.5;

    // First rod dimensions and angle
    const ROD1_LENGTH = 60;
    const ROD1_ANGLE = Math.PI / 7; // ~25 degrees
    const ROD_STROKE_WIDTH = 2.5;

    // Second rod dimensions and angle
    const ROD2_LENGTH = 55;
    const ROD2_ANGLE = -Math.PI / 4.5; // ~-40 degrees

    // Bob dimensions
    const BOB_RADIUS = 14;
    const BOB_STROKE_WIDTH = 2;

    // Icon proportions
    const MAX_ICON_WIDTH_PROPORTION = 0.65;
    const MAX_ICON_HEIGHT_PROPORTION = 0.85;

    // Create ceiling anchor
    const anchor = new Rectangle(ANCHOR_X, ANCHOR_Y, ANCHOR_WIDTH, ANCHOR_HEIGHT, {
      fill: "#888888",
      stroke: "#555555",
      lineWidth: ANCHOR_STROKE_WIDTH,
    });

    // Create top pivot point
    const topPivot = new Circle(TOP_PIVOT_RADIUS, {
      fill: "#555555",
      stroke: "#333333",
      lineWidth: PIVOT_STROKE_WIDTH,
      centerX: 0,
      centerY: 0,
    });

    // First pendulum rod (at about 25 degrees)
    const rod1EndX = ROD1_LENGTH * Math.sin(ROD1_ANGLE);
    const rod1EndY = ROD1_LENGTH * Math.cos(ROD1_ANGLE);

    const rod1 = new Line(0, 0, rod1EndX, rod1EndY, {
      stroke: "#666666",
      lineWidth: ROD_STROKE_WIDTH,
      lineCap: "round",
    });

    // First bob
    const bob1 = new Circle(BOB_RADIUS, {
      fill: "#64AAFF",
      stroke: "#468CDC",
      lineWidth: BOB_STROKE_WIDTH,
      centerX: rod1EndX,
      centerY: rod1EndY,
    });

    // Middle pivot point
    const middlePivot = new Circle(MIDDLE_PIVOT_RADIUS, {
      fill: "#555555",
      stroke: "#333333",
      lineWidth: PIVOT_STROKE_WIDTH,
      centerX: rod1EndX,
      centerY: rod1EndY,
    });

    // Second pendulum rod (at a different angle, about -40 degrees relative to vertical)
    const rod2EndX = rod1EndX + ROD2_LENGTH * Math.sin(ROD2_ANGLE);
    const rod2EndY = rod1EndY + ROD2_LENGTH * Math.cos(ROD2_ANGLE);

    const rod2 = new Line(rod1EndX, rod1EndY, rod2EndX, rod2EndY, {
      stroke: "#666666",
      lineWidth: ROD_STROKE_WIDTH,
      lineCap: "round",
    });

    // Second bob
    const bob2 = new Circle(BOB_RADIUS, {
      fill: "#FF9632",
      stroke: "#E67814",
      lineWidth: BOB_STROKE_WIDTH,
      centerX: rod2EndX,
      centerY: rod2EndY,
    });

    // Combine all elements
    const iconNode = new Node({
      children: [anchor, rod1, rod2, topPivot, bob1, middlePivot, bob2],
    });

    super(iconNode, {
      fill: "white",
      maxIconWidthProportion: MAX_ICON_WIDTH_PROPORTION,
      maxIconHeightProportion: MAX_ICON_HEIGHT_PROPORTION,
    });
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('DoublePendulumScreenIcon', DoublePendulumScreenIcon);
