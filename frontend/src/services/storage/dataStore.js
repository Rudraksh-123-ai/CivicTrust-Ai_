/**
 * Frontend API adapter. Keeps a synchronous read cache for the existing UI,
 * while all writes and durable storage are handled by the backend.
 */

import { auditLogger } from '../../../../shared/services/auditLogger.js';

const API_BASE_URL = window.CIVICTRUST_API_URL || 'http://127.0.0.1:3001/api';

class DataStore {
  constructor() {
    this.complaints = [];
    this.listeners = new Set();
    this.initialized = false;
  }

  async request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      }
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `Backend request failed (${response.status})`);
    }
    return payload;
  }

  updateState(state) {
    this.complaints = state.complaints;
    auditLogger.loadEvents(state.auditEvents);
    this.notify();
  }

  async init() {
    if (this.initialized) return;
    const { state } = await this.request('/state');
    this.updateState(state);
    this.initialized = true;
  }

  async mutate(path, body) {
    const { result, state } = await this.request(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    this.updateState(state);
    return result;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.complaints);
      } catch (error) {
        console.error('Error in subscriber listener', error);
      }
    }
  }

  getAllComplaints() {
    return [...this.complaints];
  }

  getComplaintById(id) {
    return this.complaints.find(complaint => complaint.id.toUpperCase() === id.toUpperCase()) || null;
  }

  getComplaintsByDepartment(departmentId) {
    return this.complaints.filter(complaint => complaint.departmentId === departmentId);
  }

  createComplaint(complaint) {
    return this.mutate('/complaints', complaint);
  }

  assignOfficer(complaintId, departmentId, officerName, actor = 'Admin') {
    return this.mutate(`/complaints/${encodeURIComponent(complaintId)}/assign`, {
      departmentId,
      officerName,
      actor
    });
  }

  updateStatus(complaintId, status, actor = 'Officer', notes = '') {
    return this.mutate(`/complaints/${encodeURIComponent(complaintId)}/status`, {
      status,
      actor,
      notes
    });
  }

  submitResolution(complaintId, resolution) {
    return this.mutate(`/complaints/${encodeURIComponent(complaintId)}/resolution`, resolution);
  }

  reopenComplaint(complaintId, reason, citizenPhone = '') {
    return this.mutate(`/complaints/${encodeURIComponent(complaintId)}/reopen`, {
      reason,
      citizenPhone
    });
  }

  escalateComplaint(complaintId, reason = 'SLA Deadline Breached', actor = 'System SLA Monitor') {
    return this.mutate(`/complaints/${encodeURIComponent(complaintId)}/escalate`, { reason, actor });
  }

  resolveDuplicate(candidateId, originalId, action = 'LINK_DUPLICATE', reviewer = 'Admin') {
    return this.mutate('/duplicates/resolve', { candidateId, originalId, action, reviewer });
  }

  resetToSeed() {
    return this.mutate('/reset', {});
  }
}

export const dataStore = new DataStore();
