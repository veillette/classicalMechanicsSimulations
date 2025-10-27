/**
 * Base class for all screen views in the classical mechanics simulations.
 * Provides common functionality including time controls and reset button.
 */

import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import {
  TimeControlNode,
  ResetAllButton,
  PhetFont,
} from "scenerystack/scenery-phet";
import { KeyboardListener, Text, VBox } from "scenerystack/scenery";
import {
  BooleanProperty,
  EnumerationProperty,
  DerivedProperty,
} from "scenerystack/axon";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";

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

  // Auto-pause preference: pause simulation when tab is hidden
  private readonly autoPauseProperty: BooleanProperty;

  // Store the playing state before auto-pause so we can restore it
  private wasPlayingBeforeHidden: boolean = false;

  protected constructor(model: T, options?: ScreenViewOptions) {
    super(options);
    this.model = model;

    // Initialize auto-pause preference (default: enabled)
    this.autoPauseProperty = new BooleanProperty(true);

    // Set up Page Visibility API to handle tab switching
    this.setupPageVisibilityListener();
  }

  /**
   * Sets up common UI components (time controls and reset button).
   * Call this method at the end of the subclass constructor after all other components are added.
   */
  protected setupCommonControls(): void {
    // Default time step for manual stepping (in seconds)
    const manualStepSize = 0.016; // ~1 frame at 60 FPS

    // Create derived property: stepper buttons enabled only when paused
    const stepperEnabledProperty = new DerivedProperty(
      [this.model.isPlayingProperty],
      (isPlaying) => !isPlaying,
    );

    // Time controls (play/pause and speed)
    const timeControlNode = new TimeControlNode(this.model.isPlayingProperty, {
      timeSpeedProperty: this.model.timeSpeedProperty,
      playPauseStepButtonOptions: {
        includeStepForwardButton: true,
        includeStepBackwardButton: true,
        stepForwardButtonOptions: {
          listener: () => {
            // Step forward by one frame (forced even when paused)
            this.model.step(manualStepSize, true);
            this.step(manualStepSize);
          },
          enabledProperty: stepperEnabledProperty,
          radius: 15, // Smaller than play/pause button
        },
        stepBackwardButtonOptions: {
          listener: () => {
            // Step backward by one frame (negative time step, forced even when paused)
            this.model.step(-manualStepSize, true);
            this.step(-manualStepSize);
          },
          enabledProperty: stepperEnabledProperty,
          radius: 15, // Smaller than play/pause button
        }
      },
      speedRadioButtonGroupPlacement: "left",
    });

    // Auto-pause checkbox
    const autoPauseCheckbox = new Checkbox(
      this.autoPauseProperty,
      new Text("Auto-pause when tab hidden", {
        font: new PhetFont(14),
      }),
      {
        boxWidth: 16,
      },
    );

    // Combine controls and checkbox vertically
    const bottomControls = new VBox({
      spacing: 8,
      children: [autoPauseCheckbox, timeControlNode],
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.maxY - 10,
    });
    this.addChild(bottomControls);

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
   * Set up Page Visibility API to automatically pause when tab is hidden.
   * This prevents large dt jumps when user switches tabs.
   */
  private setupPageVisibilityListener(): void {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden
        if (this.autoPauseProperty.value && this.model.isPlayingProperty.value) {
          // Store that we were playing before hiding
          this.wasPlayingBeforeHidden = true;
          // Pause the simulation
          this.model.isPlayingProperty.value = false;
        }
      } else {
        // Tab became visible
        if (this.autoPauseProperty.value && this.wasPlayingBeforeHidden) {
          // Restore playing state
          this.model.isPlayingProperty.value = true;
          this.wasPlayingBeforeHidden = false;
        }
      }
    };

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);
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
