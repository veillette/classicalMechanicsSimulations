/**
 * Base class for all screen views in the classical mechanics simulations.
 * Provides common functionality including time controls and reset button.
 */

import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import {
  TimeControlNode,
  ResetAllButton,
  Stopwatch,
  StopwatchNode,
  ProtractorNode,
  MeasuringTapeNode,
} from "scenerystack/scenery-phet";
import { KeyboardListener } from "scenerystack/scenery";
import {
  BooleanProperty,
  EnumerationProperty,
  DerivedProperty,
  Property,
} from "scenerystack/axon";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { Bounds2, Vector2 } from "scenerystack/dot";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";
import { StringManager } from "../../i18n/StringManager.js";
import SimulationAnnouncer from "../util/SimulationAnnouncer.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { SceneGridNode } from "./SceneGridNode.js";

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

  // Grid visualization (available to all screens)
  protected showGridProperty: BooleanProperty | null = null;
  protected sceneGridNode: SceneGridNode | null = null;

  // Measurement tools (available to all screens)
  protected showDistanceToolProperty: BooleanProperty = new BooleanProperty(
    false,
  );
  protected showProtractorProperty: BooleanProperty = new BooleanProperty(
    false,
  );
  protected showStopwatchProperty: BooleanProperty = new BooleanProperty(false);
  protected measuringTapeNode: MeasuringTapeNode | null = null;
  protected protractorNode: ProtractorNode | null = null;
  protected stopwatch: Stopwatch | null = null;
  protected stopwatchNode: StopwatchNode | null = null;

  protected constructor(model: T, options?: ScreenViewOptions) {
    super(options);
    this.model = model;

    // Set up Page Visibility API to handle tab switching
    this.setupPageVisibilityListener();

    // Set up accessibility listeners for state changes
    this.setupAccessibilityListeners();
  }

  /**
   * Setup measurement tools (distance, protractor, stopwatch).
   * Call this after modelViewTransform is created.
   * @param modelViewTransform - Transform between model and view coordinates
   * @param protractorPosition - Optional position for the protractor (defaults to upper right)
   */
  protected setupMeasurementTools(
    modelViewTransform: ModelViewTransform2,
    protractorPosition?: Vector2,
  ): void {
    // Measuring tape tool (SceneryStack component)
    const unitsProperty = new Property({
      name: "m",
      multiplier: 1,
    });

    const basePositionProperty = new Property(new Vector2(0, 0));
    const tipPositionProperty = new Property(new Vector2(2, 0));

    this.measuringTapeNode = new MeasuringTapeNode(unitsProperty, {
      basePositionProperty: basePositionProperty,
      tipPositionProperty: tipPositionProperty,
      modelViewTransform: modelViewTransform,
      dragBounds: this.layoutBounds,
      textColor: "black",
      textBackgroundColor: "rgba(255, 255, 255, 0.8)",
      significantFigures: 2,
    });
    this.addChild(this.measuringTapeNode);

    this.measuringTapeNode.left = 10;
    this.measuringTapeNode.top = 10;

    // Link visibility
    this.showDistanceToolProperty.link((visible) => {
      this.measuringTapeNode!.visible = visible;
    });

    // Protractor tool (SceneryStack component)
    this.protractorNode = new ProtractorNode({
      rotatable: true,
      angle: 0,
    });

    // Position the protractor
    if (protractorPosition) {
      this.protractorNode.center = protractorPosition;
    } else {
      // Default position in upper right
      this.protractorNode.left = this.layoutBounds.maxX - 200;
      this.protractorNode.top = this.layoutBounds.minY + 150;
    }

    this.addChild(this.protractorNode);

    // Link visibility
    this.showProtractorProperty.link((visible) => {
      this.protractorNode!.visible = visible;
    });

    // Stopwatch tool (SceneryStack component)
    this.stopwatch = new Stopwatch({
      position: new Vector2(
        this.layoutBounds.minX + 100,
        this.layoutBounds.minY + 50,
      ),
      isVisible: false,
    });

    this.stopwatchNode = new StopwatchNode(this.stopwatch, {
      dragBoundsProperty: new Property(this.layoutBounds),
    });
    this.addChild(this.stopwatchNode);

    // Bidirectional link between showStopwatchProperty and stopwatch visibility
    this.showStopwatchProperty.link((visible) => {
      this.stopwatch!.isVisibleProperty.value = visible;
    });

    this.stopwatch.isVisibleProperty.link((visible) => {
      this.stopwatchNode!.visible = visible;
    });
  }

  /**
   * Setup the scene grid with specified spacing.
   * Call this early in the subclass constructor (after modelViewTransform is created).
   * @param gridSpacing - Spacing between grid lines in model coordinates (meters)
   * @param modelViewTransform - Transform between model and view coordinates
   * @param viewBounds - Optional bounds for the grid area (defaults to layoutBounds)
   */
  protected setupGrid(
    gridSpacing: number,
    modelViewTransform: ModelViewTransform2,
    viewBounds?: Bounds2,
  ): void {
    const bounds = viewBounds ?? this.layoutBounds;
    const visualizationLabels =
      StringManager.getInstance().getVisualizationLabels();

    this.showGridProperty = new BooleanProperty(false);

    // Create scale label property for grid
    const gridScaleLabel = new Property(
      visualizationLabels.gridScaleLabelStringProperty.value.replace(
        "{{value}}",
        gridSpacing.toString(),
      ),
    );
    visualizationLabels.gridScaleLabelStringProperty.link(
      (template: string) => {
        gridScaleLabel.value = template.replace(
          "{{value}}",
          gridSpacing.toString(),
        );
      },
    );

    this.sceneGridNode = new SceneGridNode(modelViewTransform, bounds, {
      gridSpacing: gridSpacing,
      scaleLabelProperty: gridScaleLabel,
    });
    this.addChild(this.sceneGridNode);

    // Link grid visibility
    this.showGridProperty.link((visible) => {
      if (this.sceneGridNode) {
        this.sceneGridNode.visible = visible;
      }
    });
  }

  /**
   * Get accessibility strings from StringManager
   */
  protected getA11yStrings() {
    return StringManager.getInstance().getAccessibilityStrings();
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
        },
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
    // Using global keyboard listener so shortcuts work regardless of focus
    const a11yStrings = this.getA11yStrings();
    KeyboardListener.createGlobal(this, {
      keys: ["r", "space", "arrowLeft", "arrowRight"],
      fire: (event, keysPressed) => {
        if (keysPressed === "r") {
          // Reset simulation with R key
          this.model.reset();
          this.reset();
          SimulationAnnouncer.announceSimulationReset(
            a11yStrings.simulationResetStringProperty.value,
          );
        } else if (keysPressed === "space") {
          // Toggle play/pause with Space key
          this.model.isPlayingProperty.value =
            !this.model.isPlayingProperty.value;
          const announcement = this.model.isPlayingProperty.value
            ? a11yStrings.simulationPlayingStringProperty.value
            : a11yStrings.simulationPausedStringProperty.value;
          SimulationAnnouncer.announceSimulationState(announcement);
        } else if (
          keysPressed === "arrowLeft" &&
          !this.model.isPlayingProperty.value
        ) {
          // Step backward with Left Arrow (only when paused)
          this.model.step(-manualStepSize, true);
          this.step(-manualStepSize);
          SimulationAnnouncer.announceSimulationState(
            a11yStrings.steppedBackwardStringProperty.value,
          );
        } else if (
          keysPressed === "arrowRight" &&
          !this.model.isPlayingProperty.value
        ) {
          // Step forward with Right Arrow (only when paused)
          this.model.step(manualStepSize, true);
          this.step(manualStepSize);
          SimulationAnnouncer.announceSimulationState(
            a11yStrings.steppedForwardStringProperty.value,
          );
        }
      },
    });
  }

  /**
   * Set up Page Visibility API to automatically pause when tab is hidden.
   * This prevents large dt jumps when user switches tabs.
   */
  private setupPageVisibilityListener(): void {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden
        if (
          ClassicalMechanicsPreferences.autoPauseWhenTabHiddenProperty.value &&
          this.model.isPlayingProperty.value
        ) {
          // Store that we were playing before hiding
          this.wasPlayingBeforeHidden = true;
          // Pause the simulation
          this.model.isPlayingProperty.value = false;
        }
      } else {
        // Tab became visible
        if (
          ClassicalMechanicsPreferences.autoPauseWhenTabHiddenProperty.value &&
          this.wasPlayingBeforeHidden
        ) {
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
    // Reset the stopwatch if it exists
    if (this.stopwatch) {
      this.stopwatch.reset();
    }
    // Subclasses can override to add custom reset behavior
  }

  /**
   * Step method that subclasses should override to update view-specific elements.
   * @param dt - Time step in seconds (can be negative for backward stepping)
   */
  public step(dt: number): void {
    // Step the stopwatch if it exists and is running (only for forward time)
    if (this.stopwatch && dt > 0) {
      this.stopwatch.step(dt);
    }
    // Subclasses can override to add their own step behavior
  }

  /**
   * Announce a message using the voicing system.
   * This method is deprecated but kept for backwards compatibility with subclasses.
   * Subclasses should use SimulationAnnouncer directly instead.
   * @param message - The message to announce
   * @deprecated Use SimulationAnnouncer methods directly instead
   */
  protected announceToScreenReader(message: string): void {
    SimulationAnnouncer.announce(message);
  }

  /**
   * Set up listeners for accessibility-related state changes.
   */
  private setupAccessibilityListeners(): void {
    const a11yStrings = this.getA11yStrings();

    // Announce when play state changes
    this.model.isPlayingProperty.lazyLink((isPlaying) => {
      const announcement = isPlaying
        ? a11yStrings.simulationStartedStringProperty.value
        : a11yStrings.simulationPausedStringProperty.value;
      SimulationAnnouncer.announceSimulationState(announcement);
    });

    // Announce when speed changes
    this.model.timeSpeedProperty.lazyLink((speed) => {
      const template = a11yStrings.speedChangedStringProperty.value;
      const announcement = template.replace("{{speed}}", speed.name);
      SimulationAnnouncer.announceSimulationState(announcement);
    });
  }
}
