/**
 * View for the Single Spring screen.
 * Displays a mass attached to a spring that can be dragged and oscillates.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { SingleSpringModel } from "../model/SingleSpringModel.js";
import { Rectangle, Line, VBox, Node } from "scenerystack/scenery";
import { Panel } from "scenerystack/sun";
import { NumberControl } from "scenerystack/scenery-phet";
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

export class SingleSpringScreenView extends BaseScreenView<SingleSpringModel> {
  private readonly massNode: Rectangle;
  private readonly springNode: SpringNode;
  private readonly fixedPoint: Vector2;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly configurableGraph: ConfigurableGraph;

  public constructor(model: SingleSpringModel, options?: ScreenViewOptions) {
    super(model, options);

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
      },
    );

    const panel = new Panel(
      new VBox({
        spacing: 15,
        align: "left",
        children: [massControl, springControl, dampingControl],
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
  }
}
