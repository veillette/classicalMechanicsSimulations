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
import { Range } from 'scenerystack/dot';
import { Orientation } from 'scenerystack/phet-core';
import { Node, Text, VBox } from 'scenerystack/scenery';
import { Panel } from 'scenerystack/sun';
import GraphDataSet from './GraphDataSet';

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
   * @param xLabel - Label for X axis
   * @param yLabel - Label for Y axis
   */
  public constructor(
    dataSet: GraphDataSet,
    width: number = 400,
    height: number = 300,
    xLabel: string = 'X',
    yLabel: string = 'Y'
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
      fill: 'white',
      stroke: 'black',
    });

    // Create grid lines
    const gridLineSet = new GridLineSet(chartTransform, Orientation.HORIZONTAL, 1, {
      stroke: 'lightgray',
      lineWidth: 0.5,
    });
    const verticalGridLineSet = new GridLineSet(chartTransform, Orientation.VERTICAL, 1, {
      stroke: 'lightgray',
      lineWidth: 0.5,
    });

    // Create axes
    const xAxis = new AxisLine(chartTransform, Orientation.HORIZONTAL, {
      stroke: 'black',
      lineWidth: 1,
    });
    const yAxis = new AxisLine(chartTransform, Orientation.VERTICAL, {
      stroke: 'black',
      lineWidth: 1,
    });

    // Create tick marks
    const xTickMarks = new TickMarkSet(chartTransform, Orientation.HORIZONTAL, 1, {
      stroke: 'black',
      lineWidth: 1,
    });
    const yTickMarks = new TickMarkSet(chartTransform, Orientation.VERTICAL, 1, {
      stroke: 'black',
      lineWidth: 1,
    });

    // Create tick labels
    const xTickLabels = new TickLabelSet(chartTransform, Orientation.HORIZONTAL, 1, {
      createLabel: (value: number) =>
        new Text(value.toFixed(1), {
          fontSize: 12,
          fill: 'black',
        }),
    });
    const yTickLabels = new TickLabelSet(chartTransform, Orientation.VERTICAL, 1, {
      createLabel: (value: number) =>
        new Text(value.toFixed(1), {
          fontSize: 12,
          fill: 'black',
        }),
    });

    // Create line plot
    const linePlot = new LinePlot(chartTransform, dataSet.getDataPoints(), {
      stroke: dataSet.color,
      lineWidth: dataSet.lineWidth,
    });

    // Create labels
    const xLabelText = new Text(xLabel, { fontSize: 14, fill: 'black' });
    const yLabelText = new Text(yLabel, {
      fontSize: 14,
      fill: 'black',
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
        linePlot,
        xTickMarks,
        yTickMarks,
        xTickLabels,
        yTickLabels,
      ],
    });

    // Position labels
    yLabelText.right = chartNode.left - 15;
    yLabelText.centerY = chartNode.centerY;

    xLabelText.centerX = chartNode.centerX;
    xLabelText.top = chartNode.bottom + 15;

    // Content with labels
    const contentNode = new Node({
      children: [chartNode, xLabelText, yLabelText],
    });

    // Create panel
    super(contentNode, {
      fill: 'rgb(230, 230, 230)',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5,
      xMargin: 10,
      yMargin: 10,
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
