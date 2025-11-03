/**
 * Keyboard shortcuts help content for Classical Mechanics simulations.
 * Displays available keyboard shortcuts in a two-column layout.
 */

import { TwoColumnKeyboardHelpContent, KeyboardHelpSection, KeyboardHelpSectionRow } from "scenerystack/scenery-phet";
import { StringProperty } from "scenerystack/axon";
import { TextKeyNode } from "scenerystack/scenery-phet";

export class KeyboardShortcutsNode extends TwoColumnKeyboardHelpContent {
  public constructor() {
    // Create sections for simulation controls
    const simulationControlsSection = new KeyboardHelpSection(
      new StringProperty("Simulation Controls"),
      [
        KeyboardHelpSectionRow.labelWithIcon(
          new StringProperty("Play / Pause simulation"),
          TextKeyNode.space()
        ),
        KeyboardHelpSectionRow.labelWithIcon(
          new StringProperty("Reset simulation"),
          new TextKeyNode("R")
        ),
        KeyboardHelpSectionRow.labelWithIcon(
          new StringProperty("Step backward (when paused)"),
          new TextKeyNode("\u2190") // Left arrow
        ),
        KeyboardHelpSectionRow.labelWithIcon(
          new StringProperty("Step forward (when paused)"),
          new TextKeyNode("\u2192") // Right arrow
        ),
      ]
    );

    // Create sections for graph interactions
    const graphInteractionsSection = new KeyboardHelpSection(
      new StringProperty("Graph Interactions"),
      [
        KeyboardHelpSectionRow.labelWithIcon(
          new StringProperty("Reset zoom to auto-scale"),
          new TextKeyNode("Double-click")
        ),
        KeyboardHelpSectionRow.labelWithIcon(
          new StringProperty("Zoom in/out"),
          new TextKeyNode("Mouse wheel")
        ),
        KeyboardHelpSectionRow.labelWithIcon(
          new StringProperty("Pan view"),
          new TextKeyNode("Drag")
        ),
      ]
    );

    // Left column has simulation controls, right column has graph interactions
    super([simulationControlsSection], [graphInteractionsSection], {
      columnSpacing: 20,
      sectionSpacing: 15,
    });
  }
}
