/**
 * CivicTrust AI — SLA Management & Escalation Engine
 * Tracks deadlines, triggers reminders, and handles multi-tier escalation.
 */

import { PRIORITIES, CATEGORIES } from '../types/index.js';

export class SLAManager {
  /**
   * Calculate SLA deadline timestamp
   * @param {Date|string} createdAt 
   * @param {string} categoryId 
   * @param {string} priority 
   * @returns {string} ISO Date string
   */
  calculateDeadline(createdAt, categoryId, priority = 'MEDIUM') {
    const createdDate = new Date(createdAt);
    const categoryConfig = CATEGORIES[categoryId];
    const priorityConfig = PRIORITIES[priority] || PRIORITIES.MEDIUM;

    // Use priority SLA hours if specified, otherwise category default
    const hours = priorityConfig.slaHours || categoryConfig?.slaHours || 48;
    const deadline = new Date(createdDate.getTime() + hours * 60 * 60 * 1000);
    return deadline.toISOString();
  }

  /**
   * Get real-time status of an SLA
   * @param {string} deadlineISO 
   * @param {string} status Complaint status
   * @returns {Object} { status: 'ON_TRACK'|'APPROACHING_DEADLINE'|'OVERDUE', timeRemainingMs, formattedRemaining, isOverdue }
   */
  evaluateSLA(deadlineISO, status) {
    // If complaint is resolved, SLA is met
    if (status === 'RESOLVED') {
      return {
        status: 'MET',
        isOverdue: false,
        timeRemainingMs: 0,
        formattedRemaining: 'Resolved on time',
        badgeColor: 'bg-emerald-100 text-emerald-800'
      };
    }

    const now = Date.now();
    const deadline = new Date(deadlineISO).getTime();
    const diffMs = deadline - now;

    if (diffMs <= 0) {
      const overdueHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
      const overdueMins = Math.abs(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
      return {
        status: 'OVERDUE',
        isOverdue: true,
        timeRemainingMs: diffMs,
        formattedRemaining: `Overdue by ${overdueHours}h ${overdueMins}m`,
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Approaching deadline if less than 6 hours remaining
    if (hours < 6) {
      return {
        status: 'APPROACHING_DEADLINE',
        isOverdue: false,
        timeRemainingMs: diffMs,
        formattedRemaining: `${hours}h ${mins}m remaining (Urgent)`,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    }

    return {
      status: 'ON_TRACK',
      isOverdue: false,
      timeRemainingMs: diffMs,
      formattedRemaining: `${hours}h ${mins}m remaining`,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  }

  /**
   * Determine if complaint should automatically escalate
   * @param {Object} complaint 
   * @returns {boolean}
   */
  shouldEscalate(complaint) {
    if (complaint.status === 'RESOLVED' || complaint.status === 'ESCALATED') {
      return false;
    }
    const sla = this.evaluateSLA(complaint.slaDeadline, complaint.status);
    return sla.isOverdue;
  }
}

export const slaManager = new SLAManager();
