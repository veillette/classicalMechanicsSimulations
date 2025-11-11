/**
 * Base class for all screen views in the classical mechanics simulations.
 * Provides common functionality including time controls and reset button.
 *
 * This abstract class follows the Template Method pattern and provides:
 * - Time control UI (play/pause, speed control, manual stepping)
 * - Common measurement tools (stopwatch, measuring tape, protractor)
 * - Grid visualization
 * - Vector visualization controls
 * - Configurable graph system
 * - Preset management infrastructure
 * - Accessibility features (keyboard shortcuts, screen reader support)
 *
 * Subclasses must implement:
 * - createInfoDialogContent() - simulation-specific information dialog
 * - createScreenSummaryContent() - accessibility description
 *
 * @author Martin Veillette (PhET Interactive Simulations)
 */

import { ScreenView, type ScreenViewOptions, ScreenSummaryContent } from "scenerystack/sim";
import {
  TimeControlNode,
  ResetAllButton,
  Stopwatch,
  StopwatchNode,
  ProtractorNode,
  MeasuringTapeNode,
  InfoButton,
  NumberControl,
  PhetFont,
} from "scenerystack/scenery-phet";
import { KeyboardListener, Node, HBox, VBox, Text } from "scenerystack/scenery";
import {
  BooleanProperty,
  EnumerationProperty,
  DerivedProperty,
  Property,
  TReadOnlyProperty,
} from "scenerystack/axon";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { Bounds2, Vector2, Range } from "scenerystack/dot";
import { Dialog } from "scenerystack/sim";
import type { DialogOptions } from "scenerystack/sim";
import { Panel, ComboBox } from "scenerystack/sun";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.ts";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";
import { StringManager } from "../../i18n/StringManager.js";
import SimulationAnnouncer from "../util/SimulationAnnouncer.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { SceneGridNode } from "./SceneGridNode.js";
import ConfigurableGraph from "./graph/ConfigurableGraph.ts";
import type { PlottableProperty } from "./graph/PlottableProperty.ts";
import { Preset } from "../model/Preset.js";
import { VectorControlPanel } from "./VectorControlPanel.js";
import { ToolsControlPanel, type ToolsControlPanelOptions } from "./ToolsControlPanel.js";
import {
  FONT_SIZE_BODY_TEXT,
  FONT_SIZE_SECONDARY_LABEL,
} from "./FontSizeConstants.js";
import {
  SPACING_SMALL,
  SPACING_MEDIUM,
  PANEL_MARGIN_X,
  PANEL_MARGIN_Y,
} from "./UILayoutConstants.js";
import classicalMechanics from "../../ClassicalMechanicsNamespace.js";
import {
  GRAPH_LEFT_MARGIN,
  GRAPH_TO_VECTOR_PANEL_SPACING,
} from "./DialogAndPanelConstants.js";

/**
 * Interface that all models must implement to work with BaseScreenView
 */
export type TimeControllableModel = {
  isPlayingProperty: BooleanProperty;
  timeSpeedProperty: EnumerationProperty<TimeSpeed>;
  reset(): void;
  step(dt: number, forceStep?: boolean): void;
}

/**
 * Self options for BaseScreenView - options specific to this class.
 * These control the initial visibility state of vector visualizations.
 */
type SelfOptions = {
  /** Initial visibility of velocity vectors */
  showVelocity?: boolean;
  /** Initial visibility of force vectors */
  showForce?: boolean;
  /** Initial visibility of acceleration vectors */
  showAcceleration?: boolean;
};

/**
 * Options for BaseScreenView constructor.
 * Combines self options with parent ScreenViewOptions.
 */
export type BaseScreenViewOptions = SelfOptions & ScreenViewOptions;

/**
 * Type definition for control panel parameters.
 * Used to configure NumberControl instances with standard styling.
 */
export type ControlPanelParameter = {
  labelProperty: TReadOnlyProperty<string>;
  property: Property<number>;
  range: Range;
  delta: number;
  decimalPlaces: number;
  units: string;
  thumbFill?: TReadOnlyProperty<import("scenerystack/scenery").Color>;
};

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
  protected protractorNode: Node | null = null;
  protected stopwatch: Stopwatch | null = null;
  protected stopwatchNode: StopwatchNode | null = null;

  // Vector visualization properties (available to all screens)
  protected showVelocityProperty: BooleanProperty;
  protected showForceProperty: BooleanProperty;
  protected showAccelerationProperty: BooleanProperty;

  // Graph component (available to all screens)
  protected configurableGraph: ConfigurableGraph | null = null;

  // Model-view transform (available to all screens)
  protected modelViewTransform: ModelViewTransform2 | null = null;

  // Info dialog
  private infoDialog: Dialog | null = null;

  // Preset management (available to all screens)
  protected presetProperty: Property<Preset | "Custom"> | null = null;
  protected presets: Preset[] = [];
  protected isApplyingPreset: boolean = false;

  // Control panels (available to all screens)
  protected controlPanel: Node | null = null;
  protected vectorPanel: Node | null = null;
  protected toolsPanel: Node | null = null;

  protected constructor(model: T, options?: BaseScreenViewOptions) {
    super(options);
    this.model = model;

    // Initialize vector visualization properties with provided initial values
    this.showVelocityProperty = new BooleanProperty(options?.showVelocity ?? false);
    this.showForceProperty = new BooleanProperty(options?.showForce ?? false);
    this.showAccelerationProperty = new BooleanProperty(options?.showAcceleration ?? false);

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
   * @param includeProtractor - Whether to include the protractor tool (defaults to true)
   */
  protected setupMeasurementTools(
    modelViewTransform: ModelViewTransform2,
    protractorPosition?: Vector2,
    includeProtractor = true,
  ): void {
    // Measuring tape tool (SceneryStack component)
    const unitsProperty = new Property({
      name: "m",
      multiplier: 1,
    });

    // tool checkbox visibility properties
    this.showDistanceToolProperty = new BooleanProperty(false);
    this.showProtractorProperty = new BooleanProperty(false);
    this.showStopwatchProperty = new BooleanProperty(false);



    // Position measuring tape near the toolbox at bottom left
    const baseLocation = new Vector2(this.layoutBounds.minX + 300, this.layoutBounds.maxY -20);
    const basePositionProperty = new Property( modelViewTransform.viewToModelPosition( baseLocation));
    const tipPositionProperty = new Property( basePositionProperty.value.plus(new Vector2(1,0)));

    // Convert drag bounds from view to model coordinates
    const modelDragBounds = new Bounds2(
      modelViewTransform.viewToModelX(this.layoutBounds.minX),
      modelViewTransform.viewToModelY(this.layoutBounds.minY),
      modelViewTransform.viewToModelX(this.layoutBounds.maxX),
      modelViewTransform.viewToModelY(this.layoutBounds.maxY)
    );

    this.measuringTapeNode = new MeasuringTapeNode(unitsProperty, {
      basePositionProperty: basePositionProperty,
      tipPositionProperty: tipPositionProperty,
      modelViewTransform: modelViewTransform,
      dragBounds: modelDragBounds,
      textColor: ClassicalMechanicsColors.measuringTapeTextColorProperty,
      textBackgroundColor: ClassicalMechanicsColors.measuringTapeTextBackgroundColorProperty,
      significantFigures: 2,
      visibleProperty: this.showDistanceToolProperty,
    });
    this.addChild(this.measuringTapeNode);

    // Protractor tool (SceneryStack component) - only for pendulum screens
    if (includeProtractor) {
      this.protractorNode = new ProtractorNode({
        rotatable: true,
        angle: 0,
        visibleProperty: this.showProtractorProperty
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

    }

    // Stopwatch tool (SceneryStack component)
    // Position near the toolbox at bottom left
    this.stopwatch = new Stopwatch({
      position: new Vector2(
        this.layoutBounds.minX + 160,
        this.layoutBounds.maxY - 80,
      ),
      isVisible: this.showStopwatchProperty.value,
    });

    this.stopwatchNode = new StopwatchNode(this.stopwatch, {
      dragBoundsProperty: new Property(this.layoutBounds),
      visibleProperty: this.showStopwatchProperty,
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
      visibleProperty: this.showGridProperty,
    });
    this.addChild(this.sceneGridNode);
  }

  /**
   * Setup the configurable graph with standard configuration.
   * Call this after creating the available properties array in the subclass constructor.
   * @param availableProperties - Array of plottable properties for the graph
   * @param defaultYAxisIndex - Index of the default property for the y-axis
   * @returns The created ConfigurableGraph instance
   */
  protected setupConfigurableGraph(
    availableProperties: PlottableProperty[],
    defaultYAxisIndex: number,
  ): ConfigurableGraph {
    // Constants for graph layout
    const GRAPH_LEFT_MARGIN = 10;
    const GRAPH_RIGHT_MARGIN = 100;
    const GRAPH_HEIGHT = 300;
    const MAX_DATA_POINTS = 2000;

    // Calculate graph width to not extend beyond the center line
    const graphWidth =
      this.layoutBounds.centerX -
      this.layoutBounds.minX -
      GRAPH_LEFT_MARGIN -
      GRAPH_RIGHT_MARGIN;

    // Time property is always the last item in availableProperties
    const timePropertyIndex = availableProperties.length - 1;

    // Create the configurable graph
    this.configurableGraph = new ConfigurableGraph(
      availableProperties,
      availableProperties[timePropertyIndex], // Time for x-axis
      availableProperties[defaultYAxisIndex], // Default property for y-axis
      graphWidth,
      GRAPH_HEIGHT,
      MAX_DATA_POINTS,
      this, // list parent for combo boxes
    );

    return this.configurableGraph;
  }

  /**
   * Position the configurable graph beneath the vector panel.
   * Call this after both the graph and vector panel have been created and added as children.
   * @param vectorPanel - The vector control panel node to position beneath
   */
  protected positionConfigurableGraph(vectorPanel: Node): void {
    if (this.configurableGraph) {
      this.configurableGraph.left = this.layoutBounds.minX + GRAPH_LEFT_MARGIN;
      this.configurableGraph.top =
        vectorPanel.bottom + GRAPH_TO_VECTOR_PANEL_SPACING;
    }
  }

  /**
   * Get the graph visibility property for use in ToolsControlPanel.
   * @returns The graph visibility property, or null if no graph exists
   */
  protected getGraphVisibilityProperty(): BooleanProperty | null {
    return this.configurableGraph ? this.configurableGraph.getGraphVisibleProperty() : null;
  }

  /**
   * Get accessibility strings from StringManager
   */
  protected getA11yStrings(): ReturnType<typeof StringManager.prototype.getAccessibilityStrings> {
    return StringManager.getInstance().getAccessibilityStrings();
  }

  /**
   * Create the content for the info dialog.
   * Subclasses must implement this to provide simulation-specific information.
   * @returns A Node containing the dialog content (typically a VBox with Text/RichText nodes)
   */
  protected abstract createInfoDialogContent(): Node;

  /**
   * Create the screen summary content for the PDOM.
   * Subclasses must implement this to provide screen-specific descriptions.
   * This content appears in the Screen Summary section for screen readers.
   * @returns A Node containing the summary description (typically a VBox with Text nodes)
   */
  protected abstract createScreenSummaryContent(): Node;

  /**
   * Sets up the screen summary content for accessibility.
   * Call this early in the subclass constructor after the screen-specific setup.
   */
  protected setupScreenSummary(): void {
    const contentNode = this.createScreenSummaryContent();
    // Wrap the Node in a ScreenSummaryContent instance
    const screenSummaryContent = new ScreenSummaryContent({});
    screenSummaryContent.addChild(contentNode);
    this.setScreenSummaryContent(screenSummaryContent);
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

    // Info button and dialog
    const infoContent = this.createInfoDialogContent();

    const dialogOptions: DialogOptions = {
      fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 2,
      xSpacing: 20,
      ySpacing: 15,
      cornerRadius: 10,
      closeButtonListener: () => {
        this.infoDialog!.hide();
      },
    };

    this.infoDialog = new Dialog(infoContent, dialogOptions);
    // Note: Dialog should NOT be added as a child - it manages its own display layer
    // this.addChild(this.infoDialog);

    const infoButton = new InfoButton({
      iconFill: ClassicalMechanicsColors.infoButtonIconColorProperty,
      scale: 0.5,
      listener: () => {
        if (this.infoDialog!.isShowingProperty.value) {
          this.infoDialog!.hide();
        } else {
          this.infoDialog!.show();
        }
      },
      right: this.layoutBounds.maxX - 60,
      bottom: this.layoutBounds.maxY - 10,
    });
    this.addChild(infoButton);

    // Add comprehensive keyboard shortcuts for accessibility
    // Using global keyboard listener so shortcuts work regardless of focus
    const a11yStrings = this.getA11yStrings();
    KeyboardListener.createGlobal(this, {
      keys: ["r", "space", "arrowLeft", "arrowRight"],
      fire: (_event, keysPressed) => {
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

    // Reset all visualization properties to their initial values
    this.showDistanceToolProperty.reset();
    this.showProtractorProperty.reset();
    this.showStopwatchProperty.reset();

    if (this.showGridProperty) {
      this.showGridProperty.reset();
    }

    // Reset vector visualization properties
    this.showVelocityProperty.reset();
    this.showForceProperty.reset();
    this.showAccelerationProperty.reset();

    // Reset graph to initial state (visibility, size, and data) if graph exists
    if (this.configurableGraph) {
      this.configurableGraph.reset();
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

    // Add data point to graph if it exists (only for forward time)
    if (this.configurableGraph && dt > 0) {
      this.configurableGraph.addDataPoint();
    }

    // Subclasses can override to add their own step behavior
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

  /**
   * Create a preset selector ComboBox with standard styling.
   * @param presetProperty - Property to bind the preset selection to
   * @param presets - Array of available presets
   * @returns HBox containing the preset selector
   */
  protected createPresetSelector(
    presetProperty: Property<Preset | "Custom">,
    presets: Preset[],
  ): Node {
    const stringManager = StringManager.getInstance();
    const presetLabels = stringManager.getPresetLabels();

    // Create preset selector items
    const presetItems: Array<{
      value: Preset | "Custom";
      createNode: () => Node;
      tandemName: string;
    }> = [
      // Add "Custom" option first
      {
        value: "Custom",
        createNode: () =>
          new Text(presetLabels.customStringProperty, {
            font: new PhetFont({ size: FONT_SIZE_BODY_TEXT }),
            fill: ClassicalMechanicsColors.textColorProperty,
          }),
        tandemName: "customPresetItem",
      },
      // Add all presets
      ...presets.map((preset, index) => ({
        value: preset,
        createNode: () =>
          new Text(preset.nameProperty, {
            font: new PhetFont({ size: FONT_SIZE_BODY_TEXT }),
            fill: ClassicalMechanicsColors.textColorProperty,
          }),
        tandemName: `preset${index}Item`,
      })),
    ];

    const presetSelector = new ComboBox(presetProperty, presetItems, this, {
      cornerRadius: 5,
      xMargin: 8,
      yMargin: 4,
      buttonFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      buttonStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      listFill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      listStroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      highlightFill: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
    });

    const presetLabel = new Text(presetLabels.labelStringProperty, {
      font: new PhetFont({ size: FONT_SIZE_SECONDARY_LABEL }),
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    return new HBox({
      spacing: SPACING_SMALL,
      children: [presetLabel, presetSelector],
    });
  }

  /**
   * Create a NumberControl with standard styling.
   * @param parameter - Parameter configuration object
   * @returns NumberControl instance
   */
  protected createNumberControl(parameter: ControlPanelParameter): NumberControl {
    return new NumberControl(
      parameter.labelProperty,
      parameter.property,
      parameter.range,
      {
        delta: parameter.delta,
        numberDisplayOptions: {
          decimalPlaces: parameter.decimalPlaces,
          valuePattern: `{{value}} ${parameter.units}`,
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
        sliderOptions: parameter.thumbFill
          ? {
              thumbFill: parameter.thumbFill,
            }
          : undefined,
      },
    );
  }

  /**
   * Wrap controls in a Panel with standard styling.
   * @param children - Array of control nodes
   * @returns Panel containing the controls
   */
  protected wrapInPanel(children: Node[]): Panel {
    return new Panel(
      new VBox({
        spacing: SPACING_MEDIUM,
        align: "left",
        children: children,
      }),
      {
        xMargin: PANEL_MARGIN_X,
        yMargin: PANEL_MARGIN_Y,
        fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
        stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
        cornerRadius: 5,
      },
    );
  }

  /**
   * Setup preset management infrastructure.
   * Subclasses should call this and provide their preset configuration.
   * @param presets - Array of available presets
   * @param applyPresetCallback - Function to apply a preset to the model
   * @param detectCustomChangeProperties - Array of properties to monitor for custom changes
   */
  protected setupPresetManagement(
    presets: Preset[],
    applyPresetCallback: (preset: Preset) => void,
    detectCustomChangeProperties: Property<number>[],
  ): void {
    this.presets = presets;
    this.presetProperty = new Property<Preset | "Custom">(presets[0]);

    // Listen for preset changes to apply configuration
    this.presetProperty.link((preset) => {
      if (preset !== "Custom" && !this.isApplyingPreset) {
        applyPresetCallback(preset);
      }
    });

    // Listen to model parameter changes to detect user modifications
    const detectCustomChange = () => {
      if (!this.isApplyingPreset && this.presetProperty!.value !== "Custom") {
        this.presetProperty!.value = "Custom";
      }
    };

    detectCustomChangeProperties.forEach((property) => {
      property.lazyLink(detectCustomChange);
    });
  }

  /**
   * Setup vector and tools control panels with standard configuration.
   * Call this after the graph has been created.
   * @param includeProtractor - Whether to include protractor in tools panel
   */
  protected setupVectorAndToolsPanels(includeProtractor: boolean = true): void {
    const stringManager = StringManager.getInstance();
    const visualizationLabels = stringManager.getVisualizationLabels();
    const graphLabels = stringManager.getGraphLabels();
    const a11yStrings = this.getA11yStrings();

    // Create vector control panel
    this.vectorPanel = new VectorControlPanel({
      velocity: {
        showProperty: this.showVelocityProperty,
        labelProperty: visualizationLabels.velocityStringProperty,
        a11yStrings: {
          shown: a11yStrings.velocityVectorsShownStringProperty,
          hidden: a11yStrings.velocityVectorsHiddenStringProperty,
        },
      },
      force: {
        showProperty: this.showForceProperty,
        labelProperty: visualizationLabels.forceStringProperty,
        a11yStrings: {
          shown: a11yStrings.forceVectorsShownStringProperty,
          hidden: a11yStrings.forceVectorsHiddenStringProperty,
        },
      },
      acceleration: {
        showProperty: this.showAccelerationProperty,
        labelProperty: visualizationLabels.accelerationStringProperty,
        a11yStrings: {
          shown: a11yStrings.accelerationVectorsShownStringProperty,
          hidden: a11yStrings.accelerationVectorsHiddenStringProperty,
        },
      },
    });
    this.vectorPanel.left = this.layoutBounds.minX + 10;
    this.vectorPanel.top = this.layoutBounds.minY + 10;
    this.addChild(this.vectorPanel);

    // Create tools control panel configuration
    const toolsConfig: ToolsControlPanelOptions = {
      grid: {
        showProperty: this.showGridProperty!,
        labelProperty: visualizationLabels.showGridStringProperty,
        a11yStrings: {
          shown: a11yStrings.gridShownStringProperty,
          hidden: a11yStrings.gridHiddenStringProperty,
        },
      },
      distance: {
        showProperty: this.showDistanceToolProperty,
        labelProperty: visualizationLabels.showDistanceToolStringProperty,
        a11yStrings: {
          shown: a11yStrings.distanceToolShownStringProperty,
          hidden: a11yStrings.distanceToolHiddenStringProperty,
        },
      },
      stopwatch: {
        showProperty: this.showStopwatchProperty,
        labelProperty: visualizationLabels.showStopwatchStringProperty,
        a11yStrings: {
          shown: a11yStrings.stopwatchShownStringProperty,
          hidden: a11yStrings.stopwatchHiddenStringProperty,
        },
      },
      graph: {
        showProperty: this.getGraphVisibilityProperty()!,
        labelProperty: graphLabels.showGraphStringProperty,
        a11yStrings: {
          shown: a11yStrings.graphShownStringProperty,
          hidden: a11yStrings.graphHiddenStringProperty,
        },
      },
    };

    // Add protractor if requested
    if (includeProtractor) {
      toolsConfig.protractor = {
        showProperty: this.showProtractorProperty,
        labelProperty: visualizationLabels.showProtractorStringProperty,
        a11yStrings: {
          shown: a11yStrings.protractorShownStringProperty,
          hidden: a11yStrings.protractorHiddenStringProperty,
        },
      };
    }

    this.toolsPanel = new ToolsControlPanel(toolsConfig);
    this.toolsPanel.left = this.layoutBounds.minX + 10;
    this.toolsPanel.bottom = this.layoutBounds.maxY - 10;
    this.addChild(this.toolsPanel);
  }

  /**
   * Manage z-order of common elements to ensure correct layering.
   * Call this after all children have been added.
   * @param simulationElements - Array of simulation-specific elements (pendulum, spring, etc.)
   * @param vectorElements - Array of vector visualization nodes
   */
  protected manageZOrder(
    simulationElements: Node[],
    vectorElements: Node[],
  ): void {
    // Move grid to back if it exists
    if (this.sceneGridNode) {
      this.sceneGridNode.moveToBack();
    }

    // Move simulation elements to front (above panels)
    simulationElements.forEach((element) => element.moveToFront());

    // Move vector nodes to front (above simulation elements)
    vectorElements.forEach((element) => element.moveToFront());

    // Move configurable graph to front (below measurement tools)
    if (this.configurableGraph) {
      this.configurableGraph.moveToFront();
    }

    // Move measurement tools to the very top (highest z-order)
    if (this.measuringTapeNode) {
      this.measuringTapeNode.moveToFront();
    }
    if (this.stopwatchNode) {
      this.stopwatchNode.moveToFront();
    }
    if (this.protractorNode) {
      this.protractorNode.moveToFront();
    }
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('BaseScreenView', BaseScreenView);
