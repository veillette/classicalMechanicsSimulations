/**
 * SimulationAnnouncer provides a centralized voicing system for accessibility announcements
 * in the classical mechanics simulations. It uses the PhET voicing pattern with utteranceQueue
 * and Utterance objects for speech synthesis announcements.
 *
 * This class follows the pattern used in PhET's membrane-transport simulation, where voicing
 * is preferred over manual ARIA live regions for better user control and richer output options.
 */

import { Utterance } from "scenerystack/utterance-queue";
import { voicingUtteranceQueue } from "scenerystack/scenery";
import ClassicalMechanicsPreferences from "../../ClassicalMechanicsPreferences.js";

/**
 * SimulationAnnouncer - Singleton class for managing voicing announcements
 */
class SimulationAnnouncer {
  private static instance: SimulationAnnouncer | null = null;

  // Reusable utterances for common announcements to reduce object creation
  private readonly simulationResetUtterance: Utterance;
  private readonly simulationStateUtterance: Utterance;
  private readonly parameterChangeUtterance: Utterance;
  private readonly graphChangeUtterance: Utterance;
  private readonly dragInteractionUtterance: Utterance;

  private constructor() {
    // Create reusable utterances with appropriate priorities
    // Priority values: 0 (low) to 10 (top), higher values interrupt lower priority
    this.simulationResetUtterance = new Utterance({
      priority: 5, // High priority - Resets are important
    });

    this.simulationStateUtterance = new Utterance({
      priority: 2, // Medium priority
    });

    this.parameterChangeUtterance = new Utterance({
      priority: 1, // Default priority
      alertStableDelay: 300, // Wait 300ms for rapid changes to stabilize
    });

    this.graphChangeUtterance = new Utterance({
      priority: 1, // Default priority
      alertStableDelay: 200,
    });

    this.dragInteractionUtterance = new Utterance({
      priority: 2, // Medium priority
    });
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SimulationAnnouncer {
    if (!SimulationAnnouncer.instance) {
      SimulationAnnouncer.instance = new SimulationAnnouncer();
    }
    return SimulationAnnouncer.instance;
  }

  /**
   * Announce a simulation reset
   */
  public announceSimulationReset(message: string): void {
    this.simulationResetUtterance.alert = message;
    voicingUtteranceQueue.addToBack(this.simulationResetUtterance);
  }

  /**
   * Announce simulation state changes (play/pause/step)
   */
  public announceSimulationState(message: string): void {
    if (!ClassicalMechanicsPreferences.announceStateChangesProperty.value) {
      return;
    }
    this.simulationStateUtterance.alert = message;
    voicingUtteranceQueue.addToBack(this.simulationStateUtterance);
  }

  /**
   * Announce parameter changes (mass, spring constant, damping, etc.)
   */
  public announceParameterChange(message: string): void {
    if (!ClassicalMechanicsPreferences.announceParameterChangesProperty.value) {
      return;
    }
    this.parameterChangeUtterance.alert = message;
    voicingUtteranceQueue.addToBack(this.parameterChangeUtterance);
  }

  /**
   * Announce graph changes (axis selection, visibility)
   */
  public announceGraphChange(message: string): void {
    this.graphChangeUtterance.alert = message;
    voicingUtteranceQueue.addToBack(this.graphChangeUtterance);
  }

  /**
   * Announce drag interactions (start, end, position changes)
   */
  public announceDragInteraction(message: string): void {
    if (!ClassicalMechanicsPreferences.announceDragInteractionsProperty.value) {
      return;
    }
    this.dragInteractionUtterance.alert = message;
    voicingUtteranceQueue.addToBack(this.dragInteractionUtterance);
  }

  /**
   * Announce a custom message with specified priority
   * Use this for one-off announcements that don't fit the predefined categories
   * @param message - The message to announce
   * @param priority - Priority level (0=low to 10=top, default=1)
   */
  public announce(message: string, priority: number = 1): void {
    const utterance = new Utterance({
      alert: message,
      priority: priority,
    });
    voicingUtteranceQueue.addToBack(utterance);
  }

  /**
   * Announce a custom message with high priority (interrupts current announcements)
   */
  public announceImportant(message: string): void {
    this.announce(message, 5); // High priority
  }
}

// Export singleton instance for convenience
export default SimulationAnnouncer.getInstance();
