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
import { Node, Text, HBox, Line } from 'scenerystack/scenery';
import { Panel } from 'scenerystack/sun';
import GraphDataSet from './GraphDataSet';

/**
 * TimeGraph displays multiple GraphDataSets (typically 3) with a common X-axis (typically time)
 * and shared Y-scale. This is similar to myphysicslab's TimeGraph1 but uses bamboo for rendering.
 */
export default class TimeGraph extends Panel {
  private readonly chartTransform: ChartTransform;
  private readonly linePlots: LinePlot[];
  private readonly dataSets: GraphDataSet[];
  private readonly timeWindow: number;

  /**
   * @param dataSets - Array of data sets to display (typically 3)
   * @param width - Chart width in pixels
   * @param height - Chart height in pixels
   * @param xLabel - Label for X axis (typically "Time (s)")
   * @param yLabel - Label for Y axis
   * @param timeWindow - Time window to display (default 10s)
   */
  public constructor(
    dataSets: GraphDataSet[],
    width: number = 500,
    height: number = 300,
    xLabel: string = 'Time (s)',
    yLabel: string = 'Value',
    timeWindow: number = 10
  ) {
    // Create chart transform with initial ranges
    const chartTransform = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: new Range(0, timeWindow),
      modelYRange: new Range(-2, 2),
    });

    // Create background rectangle
    const chartRectangle = new ChartRectangle(chartTransform, {
      fill: 'white',
      stroke: 'black',
    });

    // Create grid lines
    const gridLineSet = new GridLineSet(chartTransform, Orientation.HORIZONTAL, 0.5, {
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
    const yTickMarks = new TickMarkSet(chartTransform, Orientation.VERTICAL, 0.5, {
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
    const yTickLabels = new TickLabelSet(chartTransform, Orientation.VERTICAL, 0.5, {
      createLabel: (value: number) =>
        new Text(value.toFixed(2), {
          fontSize: 12,
          fill: 'black',
        }),
    });

    // Create line plots for each data set
    const linePlots: LinePlot[] = [];
    for (const dataSet of dataSets) {
      const linePlot = new LinePlot(chartTransform, dataSet.getDataPoints(), {
        stroke: dataSet.color,
        lineWidth: dataSet.lineWidth,
      });
      linePlots.push(linePlot);
    }

    // Create labels
    const xLabelText = new Text(xLabel, { fontSize: 14, fill: 'black' });
    const yLabelText = new Text(yLabel, {
      fontSize: 14,
      fill: 'black',
      rotation: -Math.PI / 2,
    });

    // Create legend
    const legendItems = dataSets.map((dataSet, index) => {
      const legendLine = new Line(0, 1.5, 20, 1.5, {
        stroke: dataSet.color,
        lineWidth: dataSet.lineWidth,
      });

      return new HBox({
        children: [legendLine, new Text(`Line ${index + 1}`, { fontSize: 12 })],
        spacing: 5,
      });
    });

    const legend = new HBox({
      children: legendItems,
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
        yAxis,
        ...linePlots,
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

    // Position legend
    legend.centerX = chartNode.centerX;
    legend.top = xLabelText.bottom + 5;

    // Content with labels and legend
    const contentNode = new Node({
      children: [chartNode, xLabelText, yLabelText, legend],
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
    this.linePlots = linePlots;
    this.dataSets = dataSets;
    this.timeWindow = timeWindow;
  }

  /**
   * Update the graph with new data and auto-scale if needed.
   * Implements scrolling time window.
   * Call this regularly (e.g., in step function).
   */
  public update(currentTime: number): void {
    // Update each line plot with new data
    for (let i = 0; i < this.dataSets.length; i++) {
      this.linePlots[i].setDataSet(this.dataSets[i].getDataPoints());
    }

    // Calculate combined Y bounds from all datasets
    let yMin = 0;
    let yMax = 0;
    let hasData = false;

    for (const dataSet of this.dataSets) {
      const bounds = dataSet.getDataBounds();
      if (bounds) {
        if (!hasData) {
          yMin = bounds.yMin;
          yMax = bounds.yMax;
          hasData = true;
        } else {
          yMin = Math.min(yMin, bounds.yMin);
          yMax = Math.max(yMax, bounds.yMax);
        }
      }
    }

    // Update Y range with margin
    if (hasData) {
      const yRange = yMax - yMin;
      const extraMargin = 0.1; // 10% margin
      const minRange = 0.1;
      const yMargin = Math.max(yRange * extraMargin, minRange);

      this.chartTransform.setModelYRange(new Range(yMin - yMargin, yMax + yMargin));
    }

    // Update X range with scrolling time window
    if (currentTime > this.timeWindow) {
      // Scrolling mode: show last timeWindow seconds
      this.chartTransform.setModelXRange(
        new Range(currentTime - this.timeWindow, currentTime)
      );
    } else {
      // Initial mode: show from 0 to timeWindow
      this.chartTransform.setModelXRange(new Range(0, this.timeWindow));
    }
  }

  /**
   * Clear all graph data.
   */
  public clear(): void {
    for (const dataSet of this.dataSets) {
      dataSet.clear();
    }
    for (const linePlot of this.linePlots) {
      linePlot.setDataSet([]);
    }
  }
}
