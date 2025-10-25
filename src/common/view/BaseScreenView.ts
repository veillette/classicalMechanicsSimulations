/**
 * Base class for all screen views in the classical mechanics simulations.
 * Provides common functionality including time controls and reset button.
 */

import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { TimeControlNode, ResetAllButton } from "scenerystack/scenery-phet";
import { KeyboardListener } from "scenerystack/scenery";
import { BooleanProperty, EnumerationProperty } from "scenerystack/axon";
import { TimeSpeed } from "scenerystack/scenery-phet";

/**
 * Interface that all models must implement to work with BaseScreenView
 */
export interface TimeControllableModel {
  isPlayingProperty: BooleanProperty;
  timeSpeedProperty: EnumerationProperty<TimeSpeed>;
  reset(): void;
}

export abstract class BaseScreenView<T extends TimeControllableModel> extends ScreenView {
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
    // Time controls
    const timeControlNode = new TimeControlNode(this.model.isPlayingProperty, {
      timeSpeedProperty: this.model.timeSpeedProperty,
      playPauseStepButtonOptions: {
        includeStepForwardButton: true,
        includeStepBackwardButton: false,
      },
      speedRadioButtonGroupPlacement: 'left',
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.maxY - 10,
    });
    this.addChild(timeControlNode);

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
      keys: ['r'],
      fire: (event, keysPressed) => {
        if (keysPressed === 'r') {
          // Reset simulation with R key
          this.model.reset();
          this.reset();
        }
      }
    });
    this.addInputListener(keyboardListener);
  }

  /**
   * Reset method that subclasses can override to add custom reset behavior.
   */
  public reset(): void {
    // Subclasses can override to add custom reset behavior
  }
}
