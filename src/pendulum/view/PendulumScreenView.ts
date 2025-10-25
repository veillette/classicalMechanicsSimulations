/**
 * View for the Pendulum screen.
 * Displays a pendulum that can be dragged and swings.
 */

import { type ScreenViewOptions } from "scenerystack/sim";
import { PendulumModel } from "../model/PendulumModel.js";
import { Circle, Line, VBox, Node } from "scenerystack/scenery";
import { Panel } from "scenerystack/sun";
import { NumberControl } from "scenerystack/scenery-phet";
import { Range, Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import {
  GraphDataSet,
  TimeGraph,
  MultiGraph,
} from "../../common/view/graph/index.js";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { BaseScreenView } from "../../common/view/BaseScreenView.js";

export class PendulumScreenView extends BaseScreenView<PendulumModel> {
  private readonly bobNode: Circle;
  private readonly rodNode: Line;
  private readonly pivotNode: Circle;
  private readonly pivotPoint: Vector2;
  private readonly modelViewTransform: ModelViewTransform2;

  // Graph components
  private readonly angleDataSet: GraphDataSet;
  private readonly angularVelocityDataSet: GraphDataSet;
  private readonly kineticEnergyDataSet: GraphDataSet;
  private readonly potentialEnergyDataSet: GraphDataSet;
  private readonly timeGraph: TimeGraph;
  private readonly energyGraph: MultiGraph;

  public constructor(model: PendulumModel, options?: ScreenViewOptions) {
    super(model, options);

    // Pivot point (top center of screen)
    this.pivotPoint = new Vector2(
      this.layoutBounds.centerX,
      this.layoutBounds.minY + 100,
    );

    // Create modelViewTransform: maps model coordinates (meters) to view coordinates (pixels)
    // Maps model origin (0, 0) to the pivot point, with 100 pixels per meter
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      this.pivotPoint,
      100, // pixels per meter
    );

    // Pivot
    this.pivotNode = new Circle(8, {
      fill: ClassicalMechanicsColors.pivotFillColorProperty,
      stroke: ClassicalMechanicsColors.pivotStrokeColorProperty,
      lineWidth: 2,
    });
    this.pivotNode.center = this.pivotPoint;
    this.addChild(this.pivotNode);

    // Rod
    this.rodNode = new Line(0, 0, 0, 0, {
      stroke: ClassicalMechanicsColors.rodStrokeColorProperty,
      lineWidth: 4,
      lineCap: "round",
    });
    this.addChild(this.rodNode);

    // Bob
    this.bobNode = new Circle(20, {
      fill: ClassicalMechanicsColors.mass2FillColorProperty,
      stroke: ClassicalMechanicsColors.mass2StrokeColorProperty,
      lineWidth: 2,
      cursor: "pointer",
    });
    this.addChild(this.bobNode);

    // Drag listener for bob
    this.bobNode.addInputListener(
      new DragListener({
        translateNode: false,
        drag: (event) => {
          const parentPoint = this.globalToLocalPoint(event.pointer.point);
          const delta = parentPoint.minus(this.pivotPoint);
          const angle = Math.atan2(delta.x, delta.y); // angle from vertical
          this.model.angleProperty.value = angle;
          this.model.angularVelocityProperty.value = 0;
        },
      }),
    );

    // Link model to view
    this.model.angleProperty.link(this.updateVisualization.bind(this));
    this.model.lengthProperty.link(this.updateVisualization.bind(this));

    // Control panel
    const controlPanel = this.createControlPanel();
    this.addChild(controlPanel);

    // Create graph datasets
    this.angleDataSet = new GraphDataSet(
      this.model.timeProperty,
      this.model.angleProperty,
      ClassicalMechanicsColors.graphLine1ColorProperty,
      2000,
    );

    this.angularVelocityDataSet = new GraphDataSet(
      this.model.timeProperty,
      this.model.angularVelocityProperty,
      ClassicalMechanicsColors.graphLine2ColorProperty,
      2000,
    );

    this.kineticEnergyDataSet = new GraphDataSet(
      this.model.timeProperty,
      this.model.kineticEnergyProperty,
      ClassicalMechanicsColors.graphLine3ColorProperty,
      2000,
    );

    this.potentialEnergyDataSet = new GraphDataSet(
      this.model.timeProperty,
      this.model.potentialEnergyProperty,
      ClassicalMechanicsColors.graphLine4ColorProperty,
      2000,
    );

    // Get string manager and graph labels
    const stringManager = StringManager.getInstance();
    const graphLabels = stringManager.getGraphLabels();

    // Create time graph showing angle and angular velocity
    this.timeGraph = new TimeGraph(
      [this.angleDataSet, this.angularVelocityDataSet],
      450, // width
      200, // height
      graphLabels.timeStringProperty,
      graphLabels.angleAndVelocityStringProperty,
      [graphLabels.line1StringProperty, graphLabels.line2StringProperty],
      10, // time window
    );
    this.timeGraph.left = this.layoutBounds.minX + 10;
    this.timeGraph.top = this.layoutBounds.minY + 10;
    this.addChild(this.timeGraph);

    // Create multi-graph showing kinetic and potential energy with independent scales
    this.energyGraph = new MultiGraph(
      this.kineticEnergyDataSet,
      this.potentialEnergyDataSet,
      450, // width
      200, // height
      graphLabels.timeStringProperty,
      graphLabels.line1StringProperty,
      graphLabels.line2StringProperty,
      10, // time window
    );
    this.energyGraph.left = this.layoutBounds.minX + 10;
    this.energyGraph.top = this.timeGraph.bottom + 10;
    this.addChild(this.energyGraph);

    // Setup common controls (time controls, reset button, keyboard shortcuts)
    this.setupCommonControls();

    // Initial visualization
    this.updateVisualization();
  }

  private createControlPanel(): Node {
    const stringManager = StringManager.getInstance();
    const controlLabels = stringManager.getControlLabels();

    const lengthControl = new NumberControl(
      controlLabels.lengthStringProperty,
      this.model.lengthProperty,
      new Range(0.5, 3.0),
      {
        delta: 0.1,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} m",
        },
      },
    );

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

    const gravityControl = new NumberControl(
      controlLabels.gravityStringProperty,
      this.model.gravityProperty,
      new Range(0.0, 20.0),
      {
        delta: 0.5,
        numberDisplayOptions: {
          decimalPlaces: 1,
          valuePattern: "{0} m/s²",
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
          valuePattern: "{0} N·m·s",
        },
      },
    );

    const panel = new Panel(
      new VBox({
        spacing: 15,
        align: "left",
        children: [lengthControl, massControl, gravityControl, dampingControl],
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

  private updateVisualization(): void {
    const angle = this.model.angleProperty.value;
    const length = this.model.lengthProperty.value;

    // Calculate bob position in model coordinates (angle is from vertical)
    const modelBobX = length * Math.sin(angle);
    const modelBobY = length * Math.cos(angle);
    const modelBobPosition = new Vector2(modelBobX, modelBobY);

    // Convert to view coordinates
    const viewBobPosition =
      this.modelViewTransform.modelToViewPosition(modelBobPosition);

    // Update bob position
    this.bobNode.center = viewBobPosition;

    // Update rod
    this.rodNode.setLine(
      this.pivotPoint.x,
      this.pivotPoint.y,
      viewBobPosition.x,
      viewBobPosition.y,
    );
  }

  public reset(): void {
    // Clear graph data
    this.angleDataSet.clear();
    this.angularVelocityDataSet.clear();
    this.kineticEnergyDataSet.clear();
    this.potentialEnergyDataSet.clear();
    this.timeGraph.clear();
    this.energyGraph.clear();

    // Update visualization to match reset model state
    this.updateVisualization();
  }

  public override step(dt: number): void {
    this.model.step(dt);

    // Update graph data
    this.angleDataSet.addDataPoint();
    this.angularVelocityDataSet.addDataPoint();
    this.kineticEnergyDataSet.addDataPoint();
    this.potentialEnergyDataSet.addDataPoint();

    // Update graph visualizations
    this.timeGraph.update(this.model.timeProperty.value);
    this.energyGraph.update(this.model.timeProperty.value);
  }
}
