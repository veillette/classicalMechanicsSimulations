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
import { Node, Text, HBox, Line } from 'scenerystack/scenery';
import { Panel } from 'scenerystack/sun';
import { Shape } from 'scenerystack/kite';
import GraphDataSet from './GraphDataSet';

/**
 * MultiGraph displays two GraphDataSets with independent Y-scales but a common X-axis.
 * This is similar to myphysicslab's TimeGraph2 but uses bamboo for rendering.
 * Each graph has its own Y-axis (left and right) shown in the same color as the data line.
 */
export default class MultiGraph extends Panel {
  private readonly chartTransform1: ChartTransform;
  private readonly chartTransform2: ChartTransform;
  private readonly linePlot1: LinePlot;
  private readonly linePlot2: LinePlot;
  private readonly dataSet1: GraphDataSet;
  private readonly dataSet2: GraphDataSet;
  private readonly timeWindow: number;

  /**
   * @param dataSet1 - First data set (left Y-axis)
   * @param dataSet2 - Second data set (right Y-axis)
   * @param width - Chart width in pixels
   * @param height - Chart height in pixels
   * @param xLabel - Label for X axis (typically "Time (s)")
   * @param timeWindow - Time window to display (default 10s)
   */
  public constructor(
    dataSet1: GraphDataSet,
    dataSet2: GraphDataSet,
    width: number = 500,
    height: number = 300,
    xLabel: string = 'Time (s)',
    timeWindow: number = 10
  ) {
    // Create two chart transforms - they share the same X range but have independent Y ranges
    const chartTransform1 = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: new Range(0, timeWindow),
      modelYRange: new Range(-2, 2),
    });

    const chartTransform2 = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: new Range(0, timeWindow),
      modelYRange: new Range(-2, 2),
    });

    // Create background rectangle (shared)
    const chartRectangle = new ChartRectangle(chartTransform1, {
      fill: 'white',
      stroke: 'black',
    });

    // Create grid lines (use first transform)
    const gridLineSet = new GridLineSet(chartTransform1, Orientation.HORIZONTAL, 0.5, {
      stroke: 'lightgray',
      lineWidth: 0.5,
    });
    const verticalGridLineSet = new GridLineSet(
      chartTransform1,
      Orientation.VERTICAL,
      1,
      {
        stroke: 'lightgray',
        lineWidth: 0.5,
      }
    );

    // Create X-axis (shared)
    const xAxis = new AxisLine(chartTransform1, Orientation.HORIZONTAL, {
      stroke: 'black',
      lineWidth: 1,
    });

    // Create Y-axes (one for each dataset, in matching colors)
    const yAxis1 = new AxisLine(chartTransform1, Orientation.VERTICAL, {
      stroke: dataSet1.color,
      lineWidth: 1,
    });

    const yAxis2 = new AxisLine(chartTransform2, Orientation.VERTICAL, {
      stroke: dataSet2.color,
      lineWidth: 1,
    });

    // Create tick marks for X-axis
    const xTickMarks = new TickMarkSet(chartTransform1, Orientation.HORIZONTAL, 1, {
      stroke: 'black',
      lineWidth: 1,
    });

    // Create tick marks for Y-axes (in matching colors)
    const yTickMarks1 = new TickMarkSet(chartTransform1, Orientation.VERTICAL, 0.5, {
      stroke: dataSet1.color,
      lineWidth: 1,
      edge: 'min', // Left side
    });

    const yTickMarks2 = new TickMarkSet(chartTransform2, Orientation.VERTICAL, 0.5, {
      stroke: dataSet2.color,
      lineWidth: 1,
      edge: 'max', // Right side
    });

    // Create tick labels for X-axis with maxWidth to prevent overflow
    const xTickLabels = new TickLabelSet(chartTransform1, Orientation.HORIZONTAL, 1, {
      createLabel: (value: number) =>
        new Text(value.toFixed(1), {
          fontSize: 12,
          fill: 'black',
          maxWidth: 40,
        }),
    });

    // Create tick labels for Y-axes (in matching colors, positioned on left/right)
    const yTickLabels1 = new TickLabelSet(chartTransform1, Orientation.VERTICAL, 0.5, {
      edge: 'min',
      createLabel: (value: number) =>
        new Text(value.toFixed(2), {
          fontSize: 12,
          fill: dataSet1.color,
          maxWidth: 50,
        }),
    });

    const yTickLabels2 = new TickLabelSet(chartTransform2, Orientation.VERTICAL, 0.5, {
      edge: 'max',
      createLabel: (value: number) =>
        new Text(value.toFixed(2), {
          fontSize: 12,
          fill: dataSet2.color,
          maxWidth: 50,
        }),
    });

    // Create line plots
    const linePlot1 = new LinePlot(chartTransform1, dataSet1.getDataPoints(), {
      stroke: dataSet1.color,
      lineWidth: dataSet1.lineWidth,
    });

    const linePlot2 = new LinePlot(chartTransform2, dataSet2.getDataPoints(), {
      stroke: dataSet2.color,
      lineWidth: dataSet2.lineWidth,
    });

    // Wrap line plots in a clipped container to prevent overflow beyond chart
    const clippedPlots = new Node({
      children: [linePlot1, linePlot2],
      clipArea: Shape.rect(0, 0, width, height),
    });

    // Create labels
    const xLabelText = new Text(xLabel, { fontSize: 14, fill: 'black' });

    // Create legend with both lines
    const legendLine1 = new Line(0, 1.5, 20, 1.5, {
      stroke: dataSet1.color,
      lineWidth: dataSet1.lineWidth,
    });
    const legendLine2 = new Line(0, 1.5, 20, 1.5, {
      stroke: dataSet2.color,
      lineWidth: dataSet2.lineWidth,
    });

    const legend = new HBox({
      children: [
        new HBox({
          children: [legendLine1, new Text('Line 1', { fontSize: 12, fill: dataSet1.color })],
          spacing: 5,
        }),
        new HBox({
          children: [legendLine2, new Text('Line 2', { fontSize: 12, fill: dataSet2.color })],
          spacing: 5,
        }),
      ],
      spacing: 15,
      align: 'center',
    });

    // Assemble the chart
    const chartNode = new Node({
      children: [
        chartRectangle,
        verticalGridLineSet,
        gridLineSet,
        xAxis,
        yAxis1,
        yAxis2,
        clippedPlots,  // Use clipped container instead of individual plots
        xTickMarks,
        yTickMarks1,
        yTickMarks2,
        xTickLabels,
        yTickLabels1,
        yTickLabels2,
      ],
    });

    // Position labels relative to chart origin
    xLabelText.centerX = width / 2;
    xLabelText.top = height + 10;

    // Position legend
    legend.centerX = width / 2;
    legend.top = height + 35;

    // Content with labels and legend - use fixed bounds to prevent resizing
    const contentNode = new Node({
      children: [chartNode, xLabelText, legend],
      // Force fixed local bounds to prevent panel from resizing
      // MultiGraph has tick labels on both left and right
      localBounds: new Bounds2(
        -60,  // left margin for left Y labels
        -10,  // top margin
        width + 60,  // right margin for right Y labels
        height + 60  // bottom margin for X label and legend
      ),
    });

    // Create panel with fixed size
    super(contentNode, {
      fill: 'rgb(230, 230, 230)',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5,
      xMargin: 10,
      yMargin: 10,
      minWidth: width + 140,
      minHeight: height + 80,
    });

    this.chartTransform1 = chartTransform1;
    this.chartTransform2 = chartTransform2;
    this.linePlot1 = linePlot1;
    this.linePlot2 = linePlot2;
    this.dataSet1 = dataSet1;
    this.dataSet2 = dataSet2;
    this.timeWindow = timeWindow;
  }

  /**
   * Update the graph with new data and auto-scale if needed.
   * Each dataset has independent Y-scaling.
   * Call this regularly (e.g., in step function).
   */
  public update(currentTime: number): void {
    // Update line plots with new data
    this.linePlot1.setDataSet(this.dataSet1.getDataPoints());
    this.linePlot2.setDataSet(this.dataSet2.getDataPoints());

    // Update Y range for dataset 1
    const bounds1 = this.dataSet1.getDataBounds();
    if (bounds1) {
      const yRange = bounds1.yMax - bounds1.yMin;
      const extraMargin = 0.1; // 10% margin
      const minRange = 0.1;
      const yMargin = Math.max(yRange * extraMargin, minRange);

      this.chartTransform1.setModelYRange(
        new Range(bounds1.yMin - yMargin, bounds1.yMax + yMargin)
      );
    }

    // Update Y range for dataset 2 (independent)
    const bounds2 = this.dataSet2.getDataBounds();
    if (bounds2) {
      const yRange = bounds2.yMax - bounds2.yMin;
      const extraMargin = 0.1; // 10% margin
      const minRange = 0.1;
      const yMargin = Math.max(yRange * extraMargin, minRange);

      this.chartTransform2.setModelYRange(
        new Range(bounds2.yMin - yMargin, bounds2.yMax + yMargin)
      );
    }

    // Update shared X range with scrolling time window
    const xRange =
      currentTime > this.timeWindow
        ? new Range(currentTime - this.timeWindow, currentTime)
        : new Range(0, this.timeWindow);

    this.chartTransform1.setModelXRange(xRange);
    this.chartTransform2.setModelXRange(xRange);
  }

  /**
   * Clear all graph data.
   */
  public clear(): void {
    this.dataSet1.clear();
    this.dataSet2.clear();
    this.linePlot1.setDataSet([]);
    this.linePlot2.setDataSet([]);
  }
}
