/**
 * ClassicalMechanicsAudioPreferencesNode
 *
 * Custom audio preferences for the Classical Mechanics simulations.
 * Provides sim-specific voicing options that appear in the Audio preferences tab.
 *
 * This follows the pattern from membrane-transport, where custom audio preferences
 * are added to the right column of the Audio tab alongside the standard voicing controls.
 */

import { VBox, Text } from "scenerystack/scenery";
import { Checkbox } from "scenerystack/sun";
import { PhetFont } from "scenerystack/scenery-phet";
import { Tandem } from "scenerystack/tandem";
import type { TReadOnlyProperty } from "scenerystack/axon";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";
import { StringManager } from "../../i18n/StringManager.js";
import classicalMechanics from '../../ClassicalMechanicsNamespace.js';

export default class ClassicalMechanicsAudioPreferencesNode extends VBox {
  public constructor(tandem: Tandem) {
    super({
      align: "left",
      spacing: 12,
      tandem: tandem,
    });

    const stringManager = StringManager.getInstance();
    const allStrings = stringManager.getAllStringProperties();
    const audioStrings = allStrings.preferences.audio;

    // Header for sim-specific voicing options
    const header = new Text(audioStrings.simVoicingOptionsStringProperty as unknown as TReadOnlyProperty<string>, {
      font: new PhetFont({ size: 16, weight: "bold" }),
      maxWidth: 350,
    });

    // Parameter change announcements checkbox
    const parameterAnnouncementsCheckbox = new Checkbox(
      ClassicalMechanicsPreferences.announceParameterChangesProperty,
      new Text(audioStrings.announceParameterChangesStringProperty as unknown as TReadOnlyProperty<string>, {
        font: new PhetFont(16),
        maxWidth: 350,
      }),
      {
        boxWidth: 16,
        tandem: tandem.createTandem("parameterAnnouncementsCheckbox"),
      }
    );

    // Description for parameter announcements
    const parameterDescription = new Text(
      audioStrings.parameterAnnouncementsDescriptionStringProperty as unknown as TReadOnlyProperty<string>,
      {
        font: new PhetFont(12),
        fill: "rgb(80,80,80)",
        maxWidth: 350,
      }
    );

    // State change announcements checkbox
    const stateAnnouncementsCheckbox = new Checkbox(
      ClassicalMechanicsPreferences.announceStateChangesProperty,
      new Text(audioStrings.announceStateChangesStringProperty as unknown as TReadOnlyProperty<string>, {
        font: new PhetFont(16),
        maxWidth: 350,
      }),
      {
        boxWidth: 16,
        tandem: tandem.createTandem("stateAnnouncementsCheckbox"),
      }
    );

    // Description for state announcements
    const stateDescription = new Text(
      audioStrings.stateAnnouncementsDescriptionStringProperty as unknown as TReadOnlyProperty<string>,
      {
        font: new PhetFont(12),
        fill: "rgb(80,80,80)",
        maxWidth: 350,
      }
    );

    // Drag interaction announcements checkbox
    const dragAnnouncementsCheckbox = new Checkbox(
      ClassicalMechanicsPreferences.announceDragInteractionsProperty,
      new Text(audioStrings.announceDragInteractionsStringProperty as unknown as TReadOnlyProperty<string>, {
        font: new PhetFont(16),
        maxWidth: 350,
      }),
      {
        boxWidth: 16,
        tandem: tandem.createTandem("dragAnnouncementsCheckbox"),
      }
    );

    // Description for drag announcements
    const dragDescription = new Text(
      audioStrings.dragAnnouncementsDescriptionStringProperty as unknown as TReadOnlyProperty<string>,
      {
        font: new PhetFont(12),
        fill: "rgb(80,80,80)",
        maxWidth: 350,
      }
    );

    // Add all children to the VBox
    this.children = [
      header,
      parameterAnnouncementsCheckbox,
      parameterDescription,
      stateAnnouncementsCheckbox,
      stateDescription,
      dragAnnouncementsCheckbox,
      dragDescription,
    ];
  }
}

// Register with namespace for debugging accessibility
classicalMechanics.register('ClassicalMechanicsAudioPreferencesNode', ClassicalMechanicsAudioPreferencesNode);
