/**
 * Dialog that displays available keyboard shortcuts for the simulation.
 */

import { Panel } from "scenerystack/sun";
import { VBox, HBox, Text, Node } from "scenerystack/scenery";
import { BooleanProperty } from "scenerystack/axon";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";


export class KeyboardShortcutsDialog extends Node {
  private readonly panel: Panel;
  private readonly isShownProperty: BooleanProperty;

  public constructor() {
    super();

    this.isShownProperty = new BooleanProperty(false);

    this.panel = new Panel(KeyboardShortcutsDialog.createContent(), {
      fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 2,
      cornerRadius: 5,
      xMargin: 20,
      yMargin: 15,
    });

    this.addChild(this.panel);

    // Position in center of screen
    this.panel.centerX = 512;
    this.panel.centerY = 384;

    // Link visibility
    this.isShownProperty.link((visible) => {
      this.visible = visible;
    });
  }

  /**
   * Show the dialog
   */
  public show(): void {
    this.isShownProperty.value = true;
  }

  /**
   * Hide the dialog
   */
  public hide(): void {
    this.isShownProperty.value = false;
  }

  private static createContent(): Node {
    const title = new Text("Keyboard Shortcuts", {
      fontSize: 18,
      fontWeight: "bold",
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const shortcuts = [
      { key: "Space", description: "Play / Pause simulation" },
      { key: "R", description: "Reset simulation" },
      { key: "←", description: "Step backward (when paused)" },
      { key: "→", description: "Step forward (when paused)" },
      { key: "Double-click graph", description: "Reset zoom to auto-scale" },
      { key: "Mouse wheel on graph", description: "Zoom in/out" },
      { key: "Drag on graph", description: "Pan view" },
    ];

    const rows = shortcuts.map((shortcut) => {
      const keyText = new Text(shortcut.key, {
        fontSize: 14,
        fontWeight: "bold",
        fill: ClassicalMechanicsColors.textColorProperty,
      });

      const descText = new Text(shortcut.description, {
        fontSize: 14,
        fill: ClassicalMechanicsColors.textColorProperty,
      });

      return new HBox({
        spacing: 20,
        children: [keyText, descText],
      });
    });

    return new VBox({
      spacing: 12,
      align: "left",
      children: [title, ...rows],
    });
  }
}
