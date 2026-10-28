/**
 * CivicTrust AI — Audit Logger Service
 * Maintains an immutable chronological audit trail for all governance events.
 */

export class AuditLogger {
  constructor() {
    this.events = [];
  }

  /**
   * Log an audit event
   * @param {Object} params
   * @param {string} params.complaintId Reference complaint ID
   * @param {string} params.actor User / Officer / System identifier
   * @param {string} params.role Role (citizen, officer, admin, system)
   * @param {string} params.action Action performed
   * @param {string} [params.previousState] Previous state
   * @param {string} [params.newState] New state
   * @param {string} [params.notes] Action details or justification
   * @param {Object} [params.metadata] Additional metadata (evidence hashes, IP fuzz, SLA stats)
   */
  createEvent({
    complaintId,
    actor = 'System',
    role = 'system',
    action,
    previousState = null,
    newState = null,
    notes = '',
    metadata = {}
  }) {
    const event = {
      id: 'AUD-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      complaintId,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      previousState,
      newState,
      notes,
      metadata: {
        ...metadata,
        clientTimestamp: Date.now()
      }
    };

    this.events.unshift(event);
    return event;
  }

  getEventsForComplaint(complaintId) {
    return this.events.filter(e => e.complaintId === complaintId);
  }

  getAllEvents() {
    return [...this.events];
  }

  loadEvents(storedEvents) {
    if (Array.isArray(storedEvents)) {
      this.events = storedEvents;
    }
  }
}

export const auditLogger = new AuditLogger();
