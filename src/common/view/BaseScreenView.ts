/**
 * Base class for all screen views in the classical mechanics simulations.
 * Provides common functionality including time controls and reset button.
 */

import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import {
  TimeControlNode,
  ResetAllButton,
  StepForwardButton,
  StepBackwardButton,
} from "scenerystack/scenery-phet";
import { KeyboardListener } from "scenerystack/scenery";
import { BooleanProperty, EnumerationProperty } from "scenerystack/axon";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { HBox } from "scenerystack/scenery";

/**
 * Interface that all models must implement to work with BaseScreenView
 */
export interface TimeControllableModel {
  isPlayingProperty: BooleanProperty;
  timeSpeedProperty: EnumerationProperty<TimeSpeed>;
  reset(): void;
  step(dt: number, forceStep?: boolean): void;
}

export abstract class BaseScreenView<
  T extends TimeControllableModel,
> extends ScreenView {
  protected readonly model: T;

  protected constructor(model: T, options?: ScreenViewOptions) {
    super(options);
    this.model = model;
  }

  /**
   * Sets up common UI components (time controls and reset button).
   * Call this method at the end of the subclass constructor after all other components are added.
   */
  protected setupCommonControls(): void {
    // Default time step for manual stepping (in seconds)
    const manualStepSize = 0.016; // ~1 frame at 60 FPS

    // Time controls (play/pause and speed)
    const timeControlNode = new TimeControlNode(this.model.isPlayingProperty, {
      timeSpeedProperty: this.model.timeSpeedProperty,
      playPauseStepButtonOptions: {
        includeStepForwardButton: false,
        includeStepBackwardButton: false,
      },
      speedRadioButtonGroupPlacement: "left",
    });

    // Create step backward button
    const stepBackwardButton = new StepBackwardButton({
      listener: () => {
        // Step backward by one frame (negative time step, forced even when paused)
        this.model.step(-manualStepSize, true);
        this.step(-manualStepSize);
      },
      enabledProperty: new BooleanProperty(true), // Always enabled
    });

    // Create step forward button
    const stepForwardButton = new StepForwardButton({
      listener: () => {
        // Step forward by one frame (forced even when paused)
        this.model.step(manualStepSize, true);
        this.step(manualStepSize);
      },
      enabledProperty: new BooleanProperty(true), // Always enabled
    });

    // Combine time controls and step buttons in a horizontal layout
    const controlsBox = new HBox({
      spacing: 10,
      children: [stepBackwardButton, timeControlNode, stepForwardButton],
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.maxY - 10,
    });
    this.addChild(controlsBox);

    // Reset button
    const resetButton = new ResetAllButton({
      listener: () => {
        this.model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
    });
    this.addChild(resetButton);

    // Add keyboard shortcuts for accessibility
    const keyboardListener = new KeyboardListener({
      keys: ["r"],
      fire: (event, keysPressed) => {
        if (keysPressed === "r") {
          // Reset simulation with R key
          this.model.reset();
          this.reset();
        }
      },
    });
    this.addInputListener(keyboardListener);
  }

  /**
   * Reset method that subclasses can override to add custom reset behavior.
   */
  public reset(): void {
    // Subclasses can override to add custom reset behavior
  }

  /**
   * Step method that subclasses should override to update view-specific elements.
   * @param _dt - Time step in seconds (can be negative for backward stepping)
   */
  public step(_dt: number): void {
    // Subclasses should override to update their visualizations
  }
}
