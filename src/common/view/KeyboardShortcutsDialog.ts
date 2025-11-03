/**
 * Dialog that displays available keyboard shortcuts for the simulation.
 */

import { Dialog } from "scenerystack/sun";
import { VBox, HBox, Text, Node } from "scenerystack/scenery";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { StringManager } from "../../i18n/StringManager.js";

export class KeyboardShortcutsDialog extends Dialog {
  public constructor() {
    const content = KeyboardShortcutsDialog.createContent();

    super(content, {
      title: new Text("Keyboard Shortcuts", {
        fontSize: 18,
        fontWeight: "bold",
        fill: ClassicalMechanicsColors.textColorProperty,
      }),
      xSpacing: 20,
      topMargin: 20,
      bottomMargin: 20,
      leftMargin: 20,
      rightMargin: 20,
    });
  }

  private static createContent(): Node {
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
        children: [
          new Node({
            children: [keyText],
            minWidth: 180,
          }),
          descText,
        ],
      });
    });

    return new VBox({
      spacing: 12,
      align: "left",
      children: rows,
    });
  }
}
