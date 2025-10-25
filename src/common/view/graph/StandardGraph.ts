// Copyright 2025. All Rights Reserved.

import {
  ChartRectangle,
  ChartTransform,
  GridLineSet,
  LinePlot,
  TickLabelSet,
  TickMarkSet,
  AxisLine,
} from 'scenerystack/bamboo';
import { Range, Bounds2 } from 'scenerystack/dot';
import { Orientation } from 'scenerystack/phet-core';
import { Node, Text} from 'scenerystack/scenery';
import { Panel } from 'scenerystack/sun';
import { Shape } from 'scenerystack/kite';
import { ReadOnlyProperty } from 'scenerystack';
import GraphDataSet from './GraphDataSet';
import ClassicalMechanicsColors from '../../../ClassicalMechanicsColors.js';

/**
 * StandardGraph displays a single GraphDataSet as an X-Y plot using bamboo.
 * This is similar to myphysicslab's StandardGraph1 but uses bamboo for rendering.
 */
export default class StandardGraph extends Panel {
  private readonly chartTransform: ChartTransform;
  private readonly linePlot: LinePlot;
  private readonly dataSet: GraphDataSet;
  private readonly contentNode: Node;

  /**
   * @param dataSet - The data to display
   * @param width - Chart width in pixels
   * @param height - Chart height in pixels
   * @param xLabelStringProperty - Translatable string property for X axis label
   * @param yLabelStringProperty - Translatable string property for Y axis label
   */
  public constructor(
    dataSet: GraphDataSet,
    width: number,
    height: number,
    xLabelStringProperty: ReadOnlyProperty<string>,
    yLabelStringProperty: ReadOnlyProperty<string>
  ) {
    // Create chart transform with initial ranges
    const chartTransform = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: new Range(0, 10),
      modelYRange: new Range(-2, 2),
    });

    // Create background rectangle
    const chartRectangle = new ChartRectangle(chartTransform, {
      fill: ClassicalMechanicsColors.graphBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.graphBorderColorProperty,
    });

    // Create grid lines
    const gridLineSet = new GridLineSet(chartTransform, Orientation.HORIZONTAL, 1, {
      stroke: ClassicalMechanicsColors.graphGridColorProperty,
      lineWidth: 0.5,
    });
    const verticalGridLineSet = new GridLineSet(chartTransform, Orientation.VERTICAL, 1, {
      stroke: ClassicalMechanicsColors.graphGridColorProperty,
      lineWidth: 0.5,
    });

    // Create axes
    const xAxis = new AxisLine(chartTransform, Orientation.HORIZONTAL, {
      stroke: ClassicalMechanicsColors.graphAxisColorProperty,
      lineWidth: 1,
    });
    const yAxis = new AxisLine(chartTransform, Orientation.VERTICAL, {
      stroke: ClassicalMechanicsColors.graphAxisColorProperty,
      lineWidth: 1,
    });

    // Create tick marks
    const xTickMarks = new TickMarkSet(chartTransform, Orientation.HORIZONTAL, 1, {
      stroke: ClassicalMechanicsColors.graphAxisColorProperty,
      lineWidth: 1,
    });
    const yTickMarks = new TickMarkSet(chartTransform, Orientation.VERTICAL, 1, {
      stroke: ClassicalMechanicsColors.graphAxisColorProperty,
      lineWidth: 1,
    });

    // Create tick labels with maxWidth to prevent overflow
    const xTickLabels = new TickLabelSet(chartTransform, Orientation.HORIZONTAL, 1, {
      createLabel: (value: number) =>
        new Text(value.toFixed(1), {
          fontSize: 12,
          fill: ClassicalMechanicsColors.graphLabelColorProperty,
          maxWidth: 40,
        }),
    });
    const yTickLabels = new TickLabelSet(chartTransform, Orientation.VERTICAL, 1, {
      createLabel: (value: number) =>
        new Text(value.toFixed(1), {
          fontSize: 12,
          fill: ClassicalMechanicsColors.graphLabelColorProperty,
          maxWidth: 45,
        }),
    });

    // Create line plot wrapped in a clipped container to prevent overflow beyond chart
    const linePlot = new LinePlot(chartTransform, dataSet.getDataPoints(), {
      stroke: dataSet.colorProperty,
      lineWidth: dataSet.lineWidth,
    });

    const clippedPlot = new Node({
      children: [linePlot],
      clipArea: Shape.rect(0, 0, width, height),
    });

    // Create labels with translatable string properties
    const xLabelText = new Text(xLabelStringProperty, { fontSize: 14, fill: ClassicalMechanicsColors.graphLabelColorProperty });
    const yLabelText = new Text(yLabelStringProperty, {
      fontSize: 14,
      fill: ClassicalMechanicsColors.graphLabelColorProperty,
      rotation: -Math.PI / 2,
    });

    // Assemble the chart
    const chartNode = new Node({
      children: [
        chartRectangle,
        verticalGridLineSet,
        gridLineSet,
        xAxis,
        yAxis,
        clippedPlot,  // Use clipped container instead of raw linePlot
        xTickMarks,
        yTickMarks,
        xTickLabels,
        yTickLabels,
      ],
    });

    // Position labels relative to chart
    yLabelText.right = -15;
    yLabelText.centerY = height / 2;

    xLabelText.centerX = width / 2;
    xLabelText.top = height + 10;

    // Content with labels - use fixed bounds to prevent resizing
    const contentNode = new Node({
      children: [chartNode, xLabelText, yLabelText],
      // Force fixed local bounds to prevent panel from resizing
      localBounds: new Bounds2(
        -50,  // left margin for Y label
        -10,  // top margin
        width + 10,  // right margin
        height + 40  // bottom margin for X label
      ),
    });

    // Create panel with fixed size
    super(contentNode, {
      fill: ClassicalMechanicsColors.graphPanelBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.graphPanelStrokeColorProperty,
      lineWidth: 1,
      cornerRadius: 5,
      xMargin: 10,
      yMargin: 10,
      minWidth: width + 70,
      minHeight: height + 60,
    });

    this.chartTransform = chartTransform;
    this.linePlot = linePlot;
    this.dataSet = dataSet;
    this.contentNode = contentNode;
  }

  /**
   * Update the graph with new data and auto-scale if needed.
   * Call this regularly (e.g., in step function).
   */
  public update(): void {
    // Update the line plot with new data
    this.linePlot.setDataSet(this.dataSet.getDataPoints());

    // Auto-scale based on data bounds
    const bounds = this.dataSet.getDataBounds();
    if (bounds) {
      const extraMargin = 0.1; // 10% margin

      const xRange = bounds.xMax - bounds.xMin;
      const yRange = bounds.yMax - bounds.yMin;

      // Ensure minimum range
      const minRange = 0.1;
      const xMargin = Math.max(xRange * extraMargin, minRange);
      const yMargin = Math.max(yRange * extraMargin, minRange);

      this.chartTransform.setModelXRange(
        new Range(bounds.xMin - xMargin, bounds.xMax + xMargin)
      );
      this.chartTransform.setModelYRange(
        new Range(bounds.yMin - yMargin, bounds.yMax + yMargin)
      );
    }
  }

  /**
   * Clear the graph data.
   */
  public clear(): void {
    this.dataSet.clear();
    this.update();
  }
}
