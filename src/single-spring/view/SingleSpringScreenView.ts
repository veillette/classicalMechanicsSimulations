/**
 * View for the Single Spring screen.
 * Displays a mass attached to a spring that can be dragged and oscillates.
 */

import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { SingleSpringModel } from "../model/SingleSpringModel.js";
import { Circle, Rectangle, Line, VBox, Node } from "scenerystack/scenery";
import { Panel } from "scenerystack/sun";
import { NumberControl, ResetAllButton } from "scenerystack/scenery-phet";
import { Range } from "scenerystack/dot";
import { SpringNode } from "../../common/view/SpringNode.js";
import { Vector2 } from "scenerystack/dot";
import { DragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import { ModelViewTransform2 } from "scenerystack/phetcommon";

export class SingleSpringScreenView extends ScreenView {
  private readonly model: SingleSpringModel;
  private readonly massNode: Rectangle;
  private readonly springNode: SpringNode;
  private readonly fixedPoint: Vector2;
  private readonly modelViewTransform: ModelViewTransform2;

  public constructor(model: SingleSpringModel, options?: ScreenViewOptions) {
    super(options);

    this.model = model;

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
        stroke: "#666",
        lineWidth: 4,
      },
    );
    this.addChild(wall);

    // Spring
    this.springNode = new SpringNode({
      loops: 12,
      radius: 15,
      frontColor: "#888",
      backColor: "#444",
      lineWidth: 3,
    });
    this.addChild(this.springNode);

    // Mass block
    this.massNode = new Rectangle(-25, -25, 50, 50, {
      fill: "#4A90E2",
      stroke: "#2E5C8A",
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
        fill: "rgba(255, 255, 255, 0.8)",
        stroke: "#ccc",
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
    // Reset any view-specific state if needed
  }

  public override step(dt: number): void {
    // Update model physics
    this.model.step(dt);
  }
}
