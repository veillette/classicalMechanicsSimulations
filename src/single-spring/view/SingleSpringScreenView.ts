/**
 * View for the Single Spring screen.
 * Displays a mass attached to a spring that can be dragged and oscillates.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { SingleSpringModel } from "../model/SingleSpringModel.js";
import { Rectangle, Line, VBox, HBox, Node, Text } from "scenerystack/scenery";
import { Panel, ComboBox, Checkbox } from "scenerystack/sun";
import { NumberControl, ArrowNode } from "scenerystack/scenery-phet";
import { Range } from "scenerystack/dot";
import { SpringNode } from "../../common/view/SpringNode.js";
import { Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";
import {
  ConfigurableGraph,
  type PlottableProperty,
} from "../../common/view/graph/index.js";
import { SingleSpringPresets } from "../model/SingleSpringPresets.js";
import { Preset } from "../../common/model/Preset.js";
import { Property, BooleanProperty } from "scenerystack/axon";

// Custom preset type to include "Custom" option
type PresetOption = Preset | "Custom";

export class SingleSpringScreenView extends BaseScreenView<SingleSpringModel> {
  private readonly massNode: Rectangle;
  private readonly springNode: SpringNode;
  private readonly fixedPoint: Vector2;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly configurableGraph: ConfigurableGraph;
  private readonly presetProperty: Property<PresetOption>;
  private readonly presets: Preset[];
  private isApplyingPreset: boolean = false;

  // Vector visualization
  private readonly showVectorsProperty: BooleanProperty;
  private readonly velocityArrow: ArrowNode;
  private readonly accelerationArrow: ArrowNode;
  private readonly forceArrow: ArrowNode;
  private readonly vectorScale: number = 30; // Scale factor for vector visualization

  public constructor(model: SingleSpringModel, options?: ScreenViewOptions) {
    super(model, options);

    // Get available presets
    this.presets = SingleSpringPresets.getPresets();

    // Initialize with first preset as default
    this.presetProperty = new Property<PresetOption>(this.presets[0]);

    // Fixed point for spring attachment (left side of screen)
    this.fixedPoint = new Vector2(150, this.layoutBounds.centerY);

    // Create modelViewTransform: maps model coordinates (meters) to view coordinates (pixels)
    // Maps model origin (0, 0) to the fixed point, with 50 pixels per meter
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      this.fixedPoint,
      50, // pixels per meter
    );

    // Wall visualization
    const wall = new Line(
      this.fixedPoint.x - 20,
      this.layoutBounds.minY,
      this.fixedPoint.x - 20,
      this.layoutBounds.maxY,
      {
        stroke: ClassicalMechanicsColors.rodStrokeColorProperty,
        lineWidth: 4,
      },
    );
    this.addChild(wall);

    // Spring
    this.springNode = new SpringNode({
      loops: 12,
      radius: 15,
      lineWidth: 3,
    });
    this.addChild(this.springNode);

    // Mass block
    this.massNode = new Rectangle(-25, -25, 50, 50, {
      fill: ClassicalMechanicsColors.mass1FillColorProperty,
      stroke: ClassicalMechanicsColors.mass1StrokeColorProperty,
      lineWidth: 2,
      cornerRadius: 3,
      cursor: "pointer",
    });
    this.addChild(this.massNode);

    // Vector visualization
    this.showVectorsProperty = new BooleanProperty(false);

    // Create vector arrows (initially invisible)
    this.velocityArrow = new ArrowNode(0, 0, 0, 0, {
      fill: "blue",
      stroke: "blue",
      headWidth: 12,
      headHeight: 10,
      tailWidth: 3,
    });
    this.addChild(this.velocityArrow);

    this.accelerationArrow = new ArrowNode(0, 0, 0, 0, {
      fill: "red",
      stroke: "red",
      headWidth: 12,
      headHeight: 10,
      tailWidth: 3,
    });
    this.addChild(this.accelerationArrow);

    this.forceArrow = new ArrowNode(0, 0, 0, 0, {
      fill: "green",
      stroke: "green",
      headWidth: 12,
      headHeight: 10,
      tailWidth: 3,
    });
    this.addChild(this.forceArrow);

    // Link visibility to showVectorsProperty
    this.showVectorsProperty.link((showVectors) => {
      this.velocityArrow.visible = showVectors;
      this.accelerationArrow.visible = showVectors;
      this.forceArrow.visible = showVectors;
    });

    // Add drag listener to mass
    this.massNode.addInputListener(
      new DragListener({
        translateNode: false,
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const modelPosition =
            this.modelViewTransform.viewToModelPosition(parentPoint);
          this.model.positionProperty.value = modelPosition.x;
          // Reset velocity when dragging
          this.model.velocityProperty.value = 0;
        },
      }),
    );

    // Link model position to view
    this.model.positionProperty.link(this.updateVisualization.bind(this));

    // Control panel
    const controlPanel = this.createControlPanel();
    this.addChild(controlPanel);

    // Listen for preset changes to apply configuration
    this.presetProperty.link((preset) => {
      if (preset !== "Custom" && !this.isApplyingPreset) {
        this.applyPreset(preset);
      }
    });

    // Listen to model parameter changes to detect user modifications
    const detectCustomChange = () => {
      if (!this.isApplyingPreset && this.presetProperty.value !== "Custom") {
        this.presetProperty.value = "Custom";
      }
    };
    this.model.massProperty.lazyLink(detectCustomChange);
    this.model.springConstantProperty.lazyLink(detectCustomChange);
    this.model.dampingProperty.lazyLink(detectCustomChange);

    // Apply the first preset immediately
    this.applyPreset(this.presets[0]);

    // Create configurable graph with available properties
    const stringManager = StringManager.getInstance();
    const propertyNames = stringManager.getGraphPropertyNames();
    const availableProperties: PlottableProperty[] = [
      {
        name: propertyNames.positionStringProperty,
        property: this.model.positionProperty,
        unit: "m",
      },
      {
        name: propertyNames.velocityStringProperty,
        property: this.model.velocityProperty,
        unit: "m/s",
      },
      {
        name: propertyNames.kineticEnergyStringProperty,
        property: this.model.kineticEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.potentialEnergyStringProperty,
        property: this.model.potentialEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.totalEnergyStringProperty,
        property: this.model.totalEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.timeStringProperty,
        property: this.model.timeProperty,
        unit: "s",
      },
    ];

    // Create the configurable graph (position vs time by default)
    this.configurableGraph = new ConfigurableGraph(
      availableProperties,
      availableProperties[5], // Time for x-axis
      availableProperties[0], // Position for y-axis
      400, // width
      300, // height
      2000, // max data points
      this, // list parent for combo boxes
    );
    // Position graph underneath the control panel
    this.configurableGraph.right = this.layoutBounds.maxX - 10;
    this.configurableGraph.top = controlPanel.bottom + 10;
    this.addChild(this.configurableGraph);

    // Setup common controls (time controls, reset button, keyboard shortcuts)
    this.setupCommonControls();

    // Initial visualization
    this.updateVisualization(this.model.positionProperty.value);
  }

  /**
   * Create the control panel with parameter sliders.
   */
  private createControlPanel(): Node {
    const stringManager = StringManager.getInstance();
    const controlLabels = stringManager.getControlLabels();
    const presetLabels = stringManager.getPresetLabels();

    // Create preset selector
    const presetItems: Array<{ value: PresetOption; createNode: () => Node; tandemName: string }> = [
      // Add "Custom" option first
      {
        value: "Custom",
        createNode: () => new Text(presetLabels.customStringProperty, {
          fontSize: 12,
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        tandemName: "customPresetItem",
      },
      // Add all presets
      ...this.presets.map((preset, index) => ({
        value: preset,
        createNode: () => new Text(preset.nameProperty, {
          fontSize: 12,
          fill: ClassicalMechanicsColors.textColorProperty,
        }),
        tandemName: `preset${index}Item`,
      })),
    ];

    const presetSelector = new ComboBox(this.presetProperty, presetItems, this, {
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
      fontSize: 14,
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const presetRow = new HBox({
      spacing: 10,
      children: [presetLabel, presetSelector],
    });

    const massControl = new NumberControl(
      controlLabels.massStringProperty,
      this.model.massProperty,
      new Range(0.1, 5.0),
      {
        delta: 0.1,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} kg",
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      },
    );

    const springControl = new NumberControl(
      controlLabels.springConstantStringProperty,
      this.model.springConstantProperty,
      new Range(1.0, 50.0),
      {
        delta: 1.0,
        numberDisplayOptions: {
          decimalPlaces: 0,
          valuePattern: "{0} N/m",
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      },
    );

    const dampingControl = new NumberControl(
      controlLabels.dampingStringProperty,
      this.model.dampingProperty,
      new Range(0.0, 2.0),
      {
        delta: 0.05,
        numberDisplayOptions: {
          decimalPlaces: 2,
          valuePattern: "{0} N·s/m",
        },
        titleNodeOptions: {
          fill: ClassicalMechanicsColors.textColorProperty,
        },
      },
    );

    // Vector visualization checkbox
    const vizLabels = stringManager.getVisualizationLabels();
    const showVectorsCheckbox = new Checkbox(
      this.showVectorsProperty,
      new Text(vizLabels.showVectorsStringProperty, {
        fontSize: 14,
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      {
        boxWidth: 16,
      },
    );

    const panel = new Panel(
      new VBox({
        spacing: 15,
        align: "left",
        children: [presetRow, massControl, springControl, dampingControl, showVectorsCheckbox],
      }),
      {
        xMargin: 10,
        yMargin: 10,
        fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
        stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
        lineWidth: 1,
        cornerRadius: 5,
        right: this.layoutBounds.maxX - 10,
        top: this.layoutBounds.minY + 10,
      },
    );

    return panel;
  }

  /**
   * Update the visual representation based on current position.
   */
  private updateVisualization(position: number): void {
    // Convert model position to view coordinates
    const modelPosition = new Vector2(position, 0);
    const viewPosition =
      this.modelViewTransform.modelToViewPosition(modelPosition);

    // Update mass position
    this.massNode.center = viewPosition;

    // Update spring endpoints
    this.springNode.setEndpoints(
      this.fixedPoint,
      new Vector2(viewPosition.x - 25, viewPosition.y), // Connect to left edge of mass
    );
  }

  public reset(): void {
    // Clear graph data
    this.configurableGraph.clearData();

    // Update visualization to match reset model state
    this.updateVisualization(this.model.positionProperty.value);
  }

  public override step(dt: number): void {
    // Update model physics
    this.model.step(dt);

    // Add data point to configurable graph
    this.configurableGraph.addDataPoint();

    // Update vector visualization
    if (this.showVectorsProperty.value) {
      this.updateVectors();
    }
  }

  /**
   * Update vector arrows to show velocity, acceleration, and force
   */
  private updateVectors(): void {
    // Get current state
    const position = this.model.positionProperty.value;
    const velocity = this.model.velocityProperty.value;
    const mass = this.model.massProperty.value;
    const springConstant = this.model.springConstantProperty.value;
    const damping = this.model.dampingProperty.value;

    // Calculate forces
    const springForce = -springConstant * position; // F = -kx
    const dampingForce = -damping * velocity; // F = -bv
    const totalForce = springForce + dampingForce;

    // Calculate acceleration (F = ma)
    const acceleration = totalForce / mass;

    // Get arrow origin from mass center
    const arrowOrigin = this.massNode.center;

    // Update velocity arrow (blue) - pointing in direction of motion
    const velEndX = arrowOrigin.x + velocity * this.vectorScale;
    const velEndY = arrowOrigin.y;
    if (Math.abs(velocity) > 0.01) {
      this.velocityArrow.setTailAndTip(arrowOrigin.x, arrowOrigin.y, velEndX, velEndY);
      this.velocityArrow.visible = true;
    } else {
      this.velocityArrow.visible = false; // Hide if nearly zero
    }

    // Update acceleration arrow (red) - pointing in direction of acceleration
    const accEndX = arrowOrigin.x + acceleration * this.vectorScale * 2; // Scale up for visibility
    const accEndY = arrowOrigin.y - 30; // Offset vertically
    if (Math.abs(acceleration) > 0.01) {
      this.accelerationArrow.setTailAndTip(arrowOrigin.x, arrowOrigin.y - 30, accEndX, accEndY);
      this.accelerationArrow.visible = true;
    } else {
      this.accelerationArrow.visible = false; // Hide if nearly zero
    }

    // Update force arrow (green) - pointing in direction of total force
    const forceScale = this.vectorScale / 5; // Forces can be large, scale down
    const forceEndX = arrowOrigin.x + totalForce * forceScale;
    const forceEndY = arrowOrigin.y + 30; // Offset vertically in opposite direction
    if (Math.abs(totalForce) > 0.1) {
      this.forceArrow.setTailAndTip(arrowOrigin.x, arrowOrigin.y + 30, forceEndX, forceEndY);
      this.forceArrow.visible = true;
    } else {
      this.forceArrow.visible = false; // Hide if nearly zero
    }
  }

  /**
   * Apply a preset configuration to the model
   */
  private applyPreset(preset: Preset): void {
    this.isApplyingPreset = true;

    const config = preset.configuration;

    // Apply all configuration values to model properties
    if (config.mass !== undefined) {
      this.model.massProperty.value = config.mass;
    }
    if (config.springConstant !== undefined) {
      this.model.springConstantProperty.value = config.springConstant;
    }
    if (config.damping !== undefined) {
      this.model.dampingProperty.value = config.damping;
    }
    if (config.position !== undefined) {
      this.model.positionProperty.value = config.position;
    }

    // Reset velocity when applying preset
    this.model.velocityProperty.value = 0;

    // Reset simulation time
    this.model.reset();

    this.isApplyingPreset = false;
  }
}
