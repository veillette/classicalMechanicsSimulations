// Copyright 2025. All Rights Reserved.

import {
  ChartRectangle,
  ChartTransform,
  GridLineSet,
  LinePlot,
  TickLabelSet,
  TickMarkSet,
  AxisLine,
} from "scenerystack/bamboo";
import { Range, Bounds2 } from "scenerystack/dot";
import { Orientation } from "scenerystack/phet-core";
import { Node, Text, HBox, Line } from "scenerystack/scenery";
import { Panel } from "scenerystack/sun";
import { Shape } from "scenerystack/kite";
import { ReadOnlyProperty } from "scenerystack";
import GraphDataSet from "./GraphDataSet";
import ClassicalMechanicsColors from "../../../ClassicalMechanicsColors.js";

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
   * @param xLabelStringProperty - Translatable string property for X axis label
   * @param yLabelStringProperty - Translatable string property for Y axis label
   * @param legendLabelsStringProperties - Array of translatable string properties for legend labels
   * @param timeWindow - Time window to display (default 10s)
   */
  public constructor(
    dataSets: GraphDataSet[],
    width: number,
    height: number,
    xLabelStringProperty: ReadOnlyProperty<string>,
    yLabelStringProperty: ReadOnlyProperty<string>,
    legendLabelsStringProperties: ReadOnlyProperty<string>[],
    timeWindow: number = 10,
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
      fill: ClassicalMechanicsColors.graphBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.graphBorderColorProperty,
    });

    // Create grid lines
    const gridLineSet = new GridLineSet(
      chartTransform,
      Orientation.HORIZONTAL,
      0.5,
      {
        stroke: ClassicalMechanicsColors.graphGridColorProperty,
        lineWidth: 0.5,
      },
    );
    const verticalGridLineSet = new GridLineSet(
      chartTransform,
      Orientation.VERTICAL,
      1,
      {
        stroke: ClassicalMechanicsColors.graphGridColorProperty,
        lineWidth: 0.5,
      },
    );

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
    const xTickMarks = new TickMarkSet(
      chartTransform,
      Orientation.HORIZONTAL,
      1,
      {
        stroke: ClassicalMechanicsColors.graphAxisColorProperty,
        lineWidth: 1,
      },
    );
    const yTickMarks = new TickMarkSet(
      chartTransform,
      Orientation.VERTICAL,
      0.5,
      {
        stroke: ClassicalMechanicsColors.graphAxisColorProperty,
        lineWidth: 1,
      },
    );

    // Create tick labels with maxWidth to prevent overflow
    const xTickLabels = new TickLabelSet(
      chartTransform,
      Orientation.HORIZONTAL,
      1,
      {
        createLabel: (value: number) =>
          new Text(value.toFixed(1), {
            fontSize: 12,
            fill: ClassicalMechanicsColors.graphLabelColorProperty,
            maxWidth: 40,
          }),
      },
    );
    const yTickLabels = new TickLabelSet(
      chartTransform,
      Orientation.VERTICAL,
      0.5,
      {
        createLabel: (value: number) =>
          new Text(value.toFixed(2), {
            fontSize: 12,
            fill: ClassicalMechanicsColors.graphLabelColorProperty,
            maxWidth: 45,
          }),
      },
    );

    // Create line plots for each data set - wrapped in a clipped node
    const linePlots: LinePlot[] = [];
    for (const dataSet of dataSets) {
      const linePlot = new LinePlot(chartTransform, dataSet.getDataPoints(), {
        stroke: dataSet.colorProperty,
        lineWidth: dataSet.lineWidth,
      });
      linePlots.push(linePlot);
    }

    // Wrap line plots in a clipped container to prevent overflow beyond chart
    const clippedPlots = new Node({
      children: linePlots,
      clipArea: Shape.rect(0, 0, width, height),
    });

    // Create labels with translatable string properties
    const xLabelText = new Text(xLabelStringProperty, {
      fontSize: 14,
      fill: ClassicalMechanicsColors.graphLabelColorProperty,
    });
    const yLabelText = new Text(yLabelStringProperty, {
      fontSize: 14,
      fill: ClassicalMechanicsColors.graphLabelColorProperty,
      rotation: -Math.PI / 2,
    });

    // Create legend with translatable string properties
    const legendItems = dataSets.map((dataSet, index) => {
      const legendLine = new Line(0, 1.5, 20, 1.5, {
        stroke: dataSet.colorProperty,
        lineWidth: dataSet.lineWidth,
      });

      return new HBox({
        children: [
          legendLine,
          new Text(legendLabelsStringProperties[index], { fontSize: 12 }),
        ],
        spacing: 5,
      });
    });

    const legend = new HBox({
      children: legendItems,
      spacing: 15,
      align: "center",
    });

    // Assemble the chart
    const chartNode = new Node({
      children: [
        chartRectangle,
        verticalGridLineSet,
        gridLineSet,
        xAxis,
        yAxis,
        clippedPlots, // Use clipped container instead of individual plots
        xTickMarks,
        yTickMarks,
        xTickLabels,
        yTickLabels,
      ],
    });

    // Position labels relative to chart origin
    yLabelText.right = -15;
    yLabelText.centerY = height / 2;

    xLabelText.centerX = width / 2;
    xLabelText.top = height + 10;

    // Position legend
    legend.centerX = width / 2;
    legend.top = height + 35;

    // Content with labels and legend - use fixed bounds to prevent resizing
    const contentNode = new Node({
      children: [chartNode, xLabelText, yLabelText, legend],
      // Force fixed local bounds to prevent panel from resizing
      localBounds: new Bounds2(
        -50, // left margin for Y label
        -10, // top margin
        width + 10, // right margin
        height + 60, // bottom margin for X label and legend
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
      minHeight: height + 80,
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

      this.chartTransform.setModelYRange(
        new Range(yMin - yMargin, yMax + yMargin),
      );
    }

    // Update X range with scrolling time window
    if (currentTime > this.timeWindow) {
      // Scrolling mode: show last timeWindow seconds
      this.chartTransform.setModelXRange(
        new Range(currentTime - this.timeWindow, currentTime),
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
