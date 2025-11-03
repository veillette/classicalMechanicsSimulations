/**
 * Stopwatch tool for timing events in the simulation.
 */

import { Node, Text, VBox, HBox } from "scenerystack/scenery";
import { Panel, RectangularPushButton } from "scenerystack/sun";
import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import ClassicalMechanicsColors from "../../../ClassicalMechanicsColors.js";

export class StopwatchTool extends Node {
  private readonly isRunningProperty: BooleanProperty;
  private readonly elapsedTimeProperty: NumberProperty;
  private readonly displayNode: Text;
  private readonly startStopButtonLabel: Text;

  public constructor(visibleProperty: BooleanProperty) {
    super();

    this.isRunningProperty = new BooleanProperty(false);
    this.elapsedTimeProperty = new NumberProperty(0);

    // Time display
    this.displayNode = new Text("0.00 s", {
      fontSize: 24,
      fontWeight: "bold",
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    // Update display when time changes
    this.elapsedTimeProperty.link((time) => {
      this.displayNode.string = `${time.toFixed(2)} s`;
    });

    // Start/Stop button label
    this.startStopButtonLabel = new Text("Start", {
      fontSize: 14,
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    // Start/Stop button
    const startStopButton = new RectangularPushButton({
      content: this.startStopButtonLabel,
      listener: () => {
        this.isRunningProperty.value = !this.isRunningProperty.value;
      },
      baseColor: "rgba(100, 200, 100, 0.8)",
      xMargin: 10,
      yMargin: 5,
    });

    // Update button label
    this.isRunningProperty.link((isRunning) => {
      this.startStopButtonLabel.string = isRunning ? "Stop" : "Start";
      startStopButton.baseColor = isRunning
        ? "rgba(200, 100, 100, 0.8)"
        : "rgba(100, 200, 100, 0.8)";
    });

    // Reset button
    const resetButton = new RectangularPushButton({
      content: new Text("Reset", {
        fontSize: 14,
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      listener: () => {
        this.elapsedTimeProperty.value = 0;
        this.isRunningProperty.value = false;
      },
      baseColor: "rgba(100, 100, 200, 0.8)",
      xMargin: 10,
      yMargin: 5,
    });

    // Layout
    const controls = new HBox({
      spacing: 10,
      children: [startStopButton, resetButton],
    });

    const content = new VBox({
      spacing: 10,
      align: "center",
      children: [this.displayNode, controls],
    });

    // Panel
    const panel = new Panel(content, {
      fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 2,
      cornerRadius: 5,
      xMargin: 15,
      yMargin: 10,
    });

    this.addChild(panel);

    // Link visibility
    visibleProperty.link((visible) => {
      this.visible = visible;
      if (!visible) {
        this.isRunningProperty.value = false;
      }
    });
  }

  /**
   * Step the stopwatch forward by dt (only if running)
   * @param dt - Time step in seconds
   */
  public step(dt: number): void {
    if (this.isRunningProperty.value) {
      this.elapsedTimeProperty.value += dt;
    }
  }

  /**
   * Reset the stopwatch
   */
  public reset(): void {
    this.elapsedTimeProperty.value = 0;
    this.isRunningProperty.value = false;
  }
}
