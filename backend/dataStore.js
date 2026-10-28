/**
 * CivicTrust AI — Data Access Layer & Store
 * Backend complaint repository and workflow logic.
 */

import { CATEGORIES, DEPARTMENTS, VERIFICATION_STATUSES } from '../shared/types/index.js';
import { auditLogger } from '../shared/services/auditLogger.js';
import { slaManager } from '../shared/services/slaManager.js';
import { duplicateDetector } from '../shared/services/duplicateDetector.js';

// High-fidelity fictional seed complaints across key smart city categories
const INITIAL_SEED_COMPLAINTS = [
  {
    id: 'CT-2026-0101',
    categoryId: 'POTHOLE',
    priority: 'HIGH',
    title: 'Severe pothole near Bellandur junction',
    description: 'Deep pothole roughly 2.5 feet wide in the left lane causing heavy two-wheeler skidding hazards.',
    location: {
      address: 'Outer Ring Road, near EcoSpace, Bellandur, Bengaluru',
      lat: 12.9279,
      lng: 77.6833,
      landmark: 'Opposite EcoSpace Gate 2'
    },
    citizenConsent: true,
    citizenPhone: '+91 98*** **421',
    status: 'IN_PROGRESS',
    departmentId: 'PWD_ROADS',
    assignedOfficer: 'Er. Rajesh Sharma',
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
    slaDeadline: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), // 10h remaining (24h total)
    evidence: {
      initialPhoto: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      pHash: 'phash-8f431a01-49b2',
      safeFilename: 'evidence_pothole_bellandur.jpg',
      verificationStatus: VERIFICATION_STATUSES.VERIFIED,
      isSimulated: true
    },
    resolution: null,
    duplicateOf: null,
    linkedDuplicates: []
  },
  {
    id: 'CT-2026-0102',
    categoryId: 'POTHOLE',
    priority: 'HIGH',
    title: 'Damaged road surface and crater near Bellandur flyover',
    description: 'Road cave-in and dangerous crater after recent rains, located right next to EcoSpace tech park.',
    location: {
      address: 'Outer Ring Road, Bellandur, Bengaluru',
      lat: 12.9281, // 30m away from CT-2026-0101!
      lng: 77.6835,
      landmark: 'Near EcoSpace Flyover Ramp'
    },
    citizenConsent: true,
    citizenPhone: '+91 91*** **809',
    status: 'SUBMITTED',
    departmentId: 'PWD_ROADS',
    assignedOfficer: null,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    slaDeadline: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
    evidence: {
      initialPhoto: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      pHash: 'phash-8f431a01-49b2',
      safeFilename: 'evidence_crater_bellandur.jpg',
      verificationStatus: VERIFICATION_STATUSES.NEEDS_REVIEW,
      isSimulated: true
    },
    resolution: null,
    duplicateOf: null,
    linkedDuplicates: []
  },
  {
    id: 'CT-2026-0103',
    categoryId: 'WASTE',
    priority: 'MEDIUM',
    title: 'Overflowing commercial waste bin near Metro Pillar 140',
    description: 'Uncollected garbage spilling onto pedestrian walkway for over 3 days, foul odor attracting stray animals.',
    location: {
      address: 'Mahatma Gandhi Road, Metro Pillar 140, Bengaluru',
      lat: 12.9754,
      lng: 77.6066,
      landmark: 'Near MG Road Metro Exit B'
    },
    citizenConsent: true,
    citizenPhone: '+91 94*** **220',
    status: 'ESCALATED', // Breached SLA!
    departmentId: 'SWM',
    assignedOfficer: 'Dr. Sunita Verma',
    escalatedTo: 'Additional Commissioner Sanitation (Level 2)',
    createdAt: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(), // 56 hours ago (SLA was 48h)
    slaDeadline: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours overdue!
    evidence: {
      initialPhoto: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
      pHash: 'phash-3c990b71-12a8',
      safeFilename: 'evidence_waste_mg_road.jpg',
      verificationStatus: VERIFICATION_STATUSES.VERIFIED,
      isSimulated: true
    },
    resolution: null,
    duplicateOf: null,
    linkedDuplicates: []
  },
  {
    id: 'CT-2026-0104',
    categoryId: 'STREETLIGHT',
    priority: 'LOW',
    title: 'Series of 4 unlit streetlights on 100ft road',
    description: 'Completely dark stretch of road between 12th Main and 14th Main, posing safety concerns for pedestrians at night.',
    location: {
      address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
      lat: 12.9698,
      lng: 77.6415,
      landmark: 'Between 12th and 14th Main junction'
    },
    citizenConsent: true,
    citizenPhone: '+91 97*** **331',
    status: 'ASSIGNED',
    departmentId: 'ELECTRICITY',
    assignedOfficer: 'Er. Amit Kulkarni',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 54 * 60 * 60 * 1000).toISOString(),
    evidence: {
      initialPhoto: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      pHash: 'phash-22f88d12-99ca',
      safeFilename: 'evidence_dark_streetlight.jpg',
      verificationStatus: VERIFICATION_STATUSES.VERIFIED,
      isSimulated: true
    },
    resolution: null,
    duplicateOf: null,
    linkedDuplicates: []
  },
  {
    id: 'CT-2026-0105',
    categoryId: 'WATER_LEAKAGE',
    priority: 'CRITICAL',
    title: 'High-pressure water main rupture flooding road',
    description: 'Clean municipal water gushing onto roadway at high pressure. Water entering basement of adjacent commercial building.',
    location: {
      address: 'Fergusson College Road, Shivajinagar, Pune',
      lat: 18.5204,
      lng: 73.8401,
      landmark: 'Near Goodluck Cafe'
    },
    citizenConsent: true,
    citizenPhone: '+91 99*** **112',
    status: 'UNDER_VERIFICATION',
    departmentId: 'WATER_SEWAGE',
    assignedOfficer: 'Er. Priya Nair',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    evidence: {
      initialPhoto: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
      pHash: 'phash-99c72e41-00aa',
      safeFilename: 'evidence_water_burst_fc_road.jpg',
      verificationStatus: VERIFICATION_STATUSES.VERIFIED,
      isSimulated: true
    },
    resolution: {
      notes: 'Emergency valve repair crew deployed. Pipe clamped and pressure restored to normal.',
      resolvedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      officerPhoto: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
      resolutionPHash: 'phash-77e810a9-bb21',
      verificationStatus: VERIFICATION_STATUSES.NEEDS_REVIEW,
      verificationResult: {
        status: VERIFICATION_STATUSES.NEEDS_REVIEW,
        requiresHumanReview: true,
        confidence: 0.82,
        explanation: 'Before/after structural delta detected. Critical pipeline repair requires officer sign-off before closing.',
        checksRun: [
          { name: 'File Integrity', passed: true, detail: 'Valid PNG, 1.8 MB' },
          { name: 'Prompt Injection Defense', passed: true, detail: 'No adversarial tokens' },
          { name: 'Before/After Comparison', passed: true, detail: 'Visual difference confirmed (water stream stopped)' }
        ]
      }
    },
    duplicateOf: null,
    linkedDuplicates: []
  },
  {
    id: 'CT-2026-0106',
    categoryId: 'DRAINAGE',
    priority: 'HIGH',
    title: 'Severe storm drain blockage causing foul water backflow',
    description: 'Storm drain completely choked with silt and plastic debris. Rainwater backing up into residential street.',
    location: {
      address: 'Koregaon Park, Lane 5, Pune',
      lat: 18.5362,
      lng: 73.8940,
      landmark: 'Near North Main Road Junction'
    },
    citizenConsent: true,
    citizenPhone: '+91 96*** **554',
    status: 'RESOLVED',
    departmentId: 'WATER_SEWAGE',
    assignedOfficer: 'Er. Priya Nair',
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    evidence: {
      initialPhoto: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=80',
      pHash: 'phash-44a10e88-66bd',
      safeFilename: 'evidence_drainage_pune.jpg',
      verificationStatus: VERIFICATION_STATUSES.VERIFIED,
      isSimulated: true
    },
    resolution: {
      notes: 'Super-sucker desilting machine cleared 40 meters of pipeline. Flow restored.',
      resolvedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      officerPhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      resolutionPHash: 'phash-11b22c33-44ee',
      verificationStatus: VERIFICATION_STATUSES.VERIFIED,
      closedByReviewer: 'Er. Priya Nair (Supervised by Admin)'
    },
    duplicateOf: null,
    linkedDuplicates: []
  }
];

export class DataStore {
  constructor() {
    this.complaints = [];
    this.listeners = new Set();
    this.initialized = false;
  }

  /**
   * Initialize the backend repository with seed complaints.
   */
  async init() {
    if (this.initialized) return;

    this.complaints = INITIAL_SEED_COMPLAINTS.map(complaint => structuredClone(complaint));
    auditLogger.events = [];
    this.complaints.forEach(complaint => {
      auditLogger.createEvent({
        complaintId: complaint.id,
        actor: 'Citizen',
        role: 'citizen',
        action: 'COMPLAINT_CREATED',
        newState: complaint.status,
        notes: `Citizen registered issue in category ${complaint.categoryId}.`
      });
      if (complaint.assignedOfficer) {
        auditLogger.createEvent({
          complaintId: complaint.id,
          actor: 'System Triage',
          role: 'system',
          action: 'ASSIGNED_TO_OFFICER',
          newState: complaint.status,
          notes: `Assigned to department ${complaint.departmentId} (Officer: ${complaint.assignedOfficer}).`
        });
      }
    });
    this.initialized = true;
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.complaints);
      } catch (e) {
        console.error('Error in subscriber listener', e);
      }
    }
  }

  // --- Read Operations ---
  getAllComplaints() {
    return [...this.complaints];
  }

  getComplaintById(id) {
    return this.complaints.find(c => c.id.toUpperCase() === id.toUpperCase()) || null;
  }

  getComplaintsByDepartment(deptId) {
    return this.complaints.filter(c => c.departmentId === deptId);
  }

  // --- Write Operations ---

  /**
   * Create a new complaint with unique ID generation and SLA setup
   */
  async createComplaint({
    categoryId,
    title,
    description,
    location,
    citizenPhone = '+91 98*** *****',
    citizenConsent = true,
    evidenceFile = null,
    priority = null
  }) {
    const categoryConfig = CATEGORIES[categoryId] || CATEGORIES.POTHOLE;
    const assignedPriority = priority || categoryConfig.defaultPriority;
    const departmentId = categoryConfig.departmentId;
    const createdAt = new Date().toISOString();
    const slaDeadline = slaManager.calculateDeadline(createdAt, categoryId, assignedPriority);

    // Generate unique complaint reference ID: e.g. CT-2026-8341
    let newId;
    do {
      newId = `CT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    } while (this.getComplaintById(newId));

    const newComplaint = {
      id: newId,
      categoryId,
      priority: assignedPriority,
      title: title || `${categoryConfig.labelEn} reported near ${location?.landmark || location?.address || 'City Center'}`,
      description,
      location: {
        address: location?.address || 'Approximate Location, Smart City Ward 14',
        lat: location?.lat || 12.9716,
        lng: location?.lng || 77.5946,
        landmark: location?.landmark || ''
      },
      citizenConsent: Boolean(citizenConsent),
      citizenPhone: citizenPhone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2'), // Mask phone for public privacy
      status: 'SUBMITTED',
      departmentId,
      assignedOfficer: null,
      createdAt,
      slaDeadline,
      evidence: evidenceFile || {
        initialPhoto: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
        pHash: 'phash-' + Math.random().toString(36).substring(2, 10),
        safeFilename: `evidence_${newId}.jpg`,
        verificationStatus: VERIFICATION_STATUSES.VERIFIED,
        isSimulated: true
      },
      resolution: null,
      duplicateOf: null,
      linkedDuplicates: []
    };

    // Check for potential duplicate reports
    const duplicates = duplicateDetector.findDuplicates(newComplaint, this.complaints);
    if (duplicates.length > 0) {
      newComplaint.flaggedDuplicates = duplicates;
    }

    this.complaints.unshift(newComplaint);

    // Create Audit Event
    auditLogger.createEvent({
      complaintId: newId,
      actor: 'Citizen',
      role: 'citizen',
      action: 'COMPLAINT_CREATED',
      newState: 'SUBMITTED',
      notes: `Citizen submitted complaint for ${categoryConfig.labelEn}.`,
      metadata: { duplicatesFlagged: duplicates.length }
    });

    this.notify();
    return { complaint: newComplaint, duplicates };
  }

  /**
   * Assign an officer and department to a complaint
   */
  async assignOfficer(complaintId, departmentId, officerName, actor = 'Admin') {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const prevState = complaint.status;
    complaint.departmentId = departmentId;
    complaint.assignedOfficer = officerName;
    complaint.status = 'ASSIGNED';


    auditLogger.createEvent({
      complaintId,
      actor,
      role: 'admin',
      action: 'ASSIGNED_TO_OFFICER',
      previousState: prevState,
      newState: 'ASSIGNED',
      notes: `Assigned to ${officerName} (${departmentId})`
    });

    this.notify();
    return complaint;
  }

  /**
   * Update complaint status
   */
  async updateStatus(complaintId, newStatus, actor = 'Officer', notes = '') {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const prevState = complaint.status;
    complaint.status = newStatus;


    auditLogger.createEvent({
      complaintId,
      actor,
      role: actor.toLowerCase().includes('admin') ? 'admin' : 'officer',
      action: 'STATUS_CHANGED',
      previousState: prevState,
      newState: newStatus,
      notes: notes || `Status updated from ${prevState} to ${newStatus}`
    });

    this.notify();
    return complaint;
  }

  /**
   * Submit resolution with evidence photo & verification check
   */
  async submitResolution(complaintId, { notes, officerPhoto, verificationResult, officerName = 'Officer' }) {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const prevState = complaint.status;
    const requiresReview = verificationResult?.requiresHumanReview;

    complaint.resolution = {
      notes,
      resolvedAt: new Date().toISOString(),
      officerPhoto,
      officerName,
      verificationResult,
      verificationStatus: verificationResult?.status || VERIFICATION_STATUSES.NEEDS_REVIEW
    };

    // If verification requires human review or failed, route to UNDER_VERIFICATION
    if (requiresReview) {
      complaint.status = 'UNDER_VERIFICATION';
    } else {
      complaint.status = 'RESOLVED';
    }


    auditLogger.createEvent({
      complaintId,
      actor: officerName,
      role: 'officer',
      action: 'RESOLUTION_SUBMITTED',
      previousState: prevState,
      newState: complaint.status,
      notes: `Resolution submitted. Status: ${complaint.status}. Verification: ${verificationResult?.status}. ${notes}`,
      metadata: {
        verificationStatus: verificationResult?.status,
        checksRun: verificationResult?.checksRun
      }
    });

    this.notify();
    return complaint;
  }

  /**
   * Reopen / Dispute Complaint (e.g., if citizen disputes closure or evidence contradicts reality)
   */
  async reopenComplaint(complaintId, reason, citizenPhone = '') {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const prevState = complaint.status;
    complaint.status = 'REOPENED';
    complaint.reopenedReason = reason;
    complaint.reopenedAt = new Date().toISOString();


    auditLogger.createEvent({
      complaintId,
      actor: 'Citizen',
      role: 'citizen',
      action: 'CITIZEN_DISPUTED_REOPENED',
      previousState: prevState,
      newState: 'REOPENED',
      notes: `Citizen disputed closure: "${reason}"`
    });

    this.notify();
    return complaint;
  }

  /**
   * Escalate complaint due to SLA breach or unresolved dispute
   */
  async escalateComplaint(complaintId, reason = 'SLA Deadline Breached', actor = 'System SLA Monitor') {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const prevState = complaint.status;
    complaint.status = 'ESCALATED';
    complaint.escalatedAt = new Date().toISOString();
    const dept = DEPARTMENTS[complaint.departmentId];
    complaint.escalatedTo = dept?.defaultEscalationOfficer || 'Department Head (Level 2)';


    auditLogger.createEvent({
      complaintId,
      actor,
      role: 'system',
      action: 'SLA_BREACH_ESCALATED',
      previousState: prevState,
      newState: 'ESCALATED',
      notes: `Escalated to ${complaint.escalatedTo}: ${reason}`
    });

    this.notify();
    return complaint;
  }

  /**
   * Link or resolve duplicate complaint
   */
  async resolveDuplicate(candidateId, originalId, action = 'LINK_DUPLICATE', reviewer = 'Admin') {
    const candidate = this.getComplaintById(candidateId);
    const original = this.getComplaintById(originalId);
    if (!candidate || !original) throw new Error('Complaints not found');

    if (action === 'LINK_DUPLICATE') {
      candidate.duplicateOf = originalId;
      candidate.status = 'TRIAGED';
      if (!original.linkedDuplicates.includes(candidateId)) {
        original.linkedDuplicates.push(candidateId);
      }
    } else if (action === 'MARK_INDEPENDENT') {
      candidate.flaggedDuplicates = [];
    }


    auditLogger.createEvent({
      complaintId: candidateId,
      actor: reviewer,
      role: 'admin',
      action: action === 'LINK_DUPLICATE' ? 'DUPLICATE_LINKED' : 'DUPLICATE_DISMISSED',
      notes: `Duplicate action ${action} with primary ticket ${originalId}`
    });

    this.notify();
  }

  /**
   * Reset data to default seed for testing/demos
   */
  async resetToSeed() {
    this.complaints = [...INITIAL_SEED_COMPLAINTS];
    auditLogger.events = [];
    this.notify();
  }
}

export const dataStore = new DataStore();
