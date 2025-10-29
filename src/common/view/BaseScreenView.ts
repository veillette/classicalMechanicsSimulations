/**
 * Base class for all screen views in the classical mechanics simulations.
 * Provides common functionality including time controls and reset button.
 */

import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import {
  TimeControlNode,
  ResetAllButton,
} from "scenerystack/scenery-phet";
import { KeyboardListener } from "scenerystack/scenery";
import {
  BooleanProperty,
  EnumerationProperty,
  DerivedProperty,
} from "scenerystack/axon";
import { TimeSpeed } from "scenerystack/scenery-phet";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";

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

  // Store the playing state before auto-pause so we can restore it
  private wasPlayingBeforeHidden: boolean = false;

  // Screen reader announcement element
  private readonly ariaLiveRegion: HTMLElement;

  protected constructor(model: T, options?: ScreenViewOptions) {
    super(options);
    this.model = model;

    // Create ARIA live region for screen reader announcements
    this.ariaLiveRegion = this.createAriaLiveRegion();

    // Set up Page Visibility API to handle tab switching
    this.setupPageVisibilityListener();

    // Set up accessibility listeners for state changes
    this.setupAccessibilityListeners();
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
      speedRadioButtonGroupOptions: {
        labelOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      },
    });

    // Position time controls at bottom center
    timeControlNode.centerX = this.layoutBounds.centerX;
    timeControlNode.bottom = this.layoutBounds.maxY - 10;
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

    // Add comprehensive keyboard shortcuts for accessibility
    const keyboardListener = new KeyboardListener({
      keys: ["r", "space", "arrowLeft", "arrowRight"],
      fire: (event, keysPressed) => {
        if (keysPressed === "r") {
          // Reset simulation with R key
          this.model.reset();
          this.reset();
          this.announceToScreenReader("Simulation reset");
        } else if (keysPressed === "space") {
          // Toggle play/pause with Space key
          this.model.isPlayingProperty.value = !this.model.isPlayingProperty.value;
          const announcement = this.model.isPlayingProperty.value
            ? "Simulation playing"
            : "Simulation paused";
          this.announceToScreenReader(announcement);
        } else if (keysPressed === "arrowLeft" && !this.model.isPlayingProperty.value) {
          // Step backward with Left Arrow (only when paused)
          this.model.step(-manualStepSize, true);
          this.step(-manualStepSize);
          this.announceToScreenReader("Stepped backward");
        } else if (keysPressed === "arrowRight" && !this.model.isPlayingProperty.value) {
          // Step forward with Right Arrow (only when paused)
          this.model.step(manualStepSize, true);
          this.step(manualStepSize);
          this.announceToScreenReader("Stepped forward");
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
        if (ClassicalMechanicsPreferences.autoPauseWhenTabHiddenProperty.value && this.model.isPlayingProperty.value) {
          // Store that we were playing before hiding
          this.wasPlayingBeforeHidden = true;
          // Pause the simulation
          this.model.isPlayingProperty.value = false;
        }
      } else {
        // Tab became visible
        if (ClassicalMechanicsPreferences.autoPauseWhenTabHiddenProperty.value && this.wasPlayingBeforeHidden) {
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

  /**
   * Create an ARIA live region for screen reader announcements.
   */
  private createAriaLiveRegion(): HTMLElement {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
    return liveRegion;
  }

  /**
   * Announce a message to screen readers.
   * @param message - The message to announce
   */
  protected announceToScreenReader(message: string): void {
    // Clear previous announcement
    this.ariaLiveRegion.textContent = '';

    // Small delay to ensure screen readers pick up the change
    setTimeout(() => {
      this.ariaLiveRegion.textContent = message;
    }, 100);
  }

  /**
   * Set up listeners for accessibility-related state changes.
   */
  private setupAccessibilityListeners(): void {
    // Announce when play state changes
    this.model.isPlayingProperty.lazyLink((isPlaying) => {
      const announcement = isPlaying
        ? "Simulation started"
        : "Simulation paused";
      this.announceToScreenReader(announcement);
    });

    // Announce when speed changes
    this.model.timeSpeedProperty.lazyLink((speed) => {
      this.announceToScreenReader(`Speed changed to ${speed.name}`);
    });
  }
}
