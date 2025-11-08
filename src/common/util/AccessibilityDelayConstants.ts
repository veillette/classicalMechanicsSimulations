/**
 * Constants for voicing announcement delays (in milliseconds).
 * These delays help prevent announcement spam during rapid parameter changes.
 */

/**
 * Delay for parameter change announcements (ms)
 * Wait for rapid changes (e.g., slider drag events) to stabilize
 */
export const PARAMETER_CHANGE_ANNOUNCEMENT_DELAY = 300;

/**
 * Delay for graph change announcements (ms)
 * Shorter delay for graph updates since they're less frequent
 */
export const GRAPH_CHANGE_ANNOUNCEMENT_DELAY = 200;
