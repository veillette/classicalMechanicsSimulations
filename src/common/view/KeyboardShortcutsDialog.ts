/**
 * Dialog that displays available keyboard shortcuts for the simulation.
 * Extends Dialog to provide automatic close button and ESC key dismissal.
 */

import { Dialog } from "scenerystack/sun";
import type { DialogOptions } from "scenerystack/sun";
import { VBox, HBox, Text, Node } from "scenerystack/scenery";
import ClassicalMechanicsColors from "../../ClassicalMechanicsColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import { PhetFont } from "scenerystack";


export class KeyboardShortcutsDialog extends Dialog {
  public constructor() {
    const content = KeyboardShortcutsDialog.createContent();

    const options: DialogOptions = {
      fill: ClassicalMechanicsColors.controlPanelBackgroundColorProperty,
      stroke: ClassicalMechanicsColors.controlPanelStrokeColorProperty,
      lineWidth: 2,
      cornerRadius: 5,
      xSpacing: 20,
      ySpacing: 15,
      closeButtonListener: () => {
        this.hide();
      },
    };

    super(content, options);
  }

  private static createContent(): Node {
    const stringManager = StringManager.getInstance();
    const keyboardShortcutsStrings = stringManager.getKeyboardShortcutsStrings();

    const title = new Text(keyboardShortcutsStrings.titleStringProperty, {
      font: new PhetFont({size: 18, weight: "bold"}),
      fill: ClassicalMechanicsColors.textColorProperty,
    });

    const shortcuts = [
      { key: "Space", descriptionProperty: keyboardShortcutsStrings.playPauseSimulationStringProperty },
      { key: "R", descriptionProperty: keyboardShortcutsStrings.resetSimulationStringProperty },
      { key: "←", descriptionProperty: keyboardShortcutsStrings.stepBackwardStringProperty },
      { key: "→", descriptionProperty: keyboardShortcutsStrings.stepForwardStringProperty },
      { key: "Double-click graph", descriptionProperty: keyboardShortcutsStrings.resetZoomStringProperty },
      { key: "Mouse wheel on graph", descriptionProperty: keyboardShortcutsStrings.zoomInOutStringProperty },
      { key: "Drag on graph", descriptionProperty: keyboardShortcutsStrings.panViewStringProperty },
    ];

    const rows = shortcuts.map((shortcut) => {
      const keyText = new Text(shortcut.key, {
        font: new PhetFont({size: 14, weight: "bold"}),
        fill: ClassicalMechanicsColors.textColorProperty,
      });

      const descText = new Text(shortcut.descriptionProperty, {
        font: new PhetFont({size: 14}),
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
