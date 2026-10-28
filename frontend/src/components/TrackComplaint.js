/**
 * CivicTrust AI — Track Complaint Component
 * Full lifecycle tracking with chronological timeline, evidence inspection,
 * SLA countdown, and citizen dispute/reopen capability.
 */

import { i18n } from '../services/localization.js';
import { STATUSES, PRIORITIES, CATEGORIES, DEPARTMENTS } from '../../../shared/types/index.js';
import { slaManager } from '../../../shared/services/slaManager.js';
import { auditLogger } from '../../../shared/services/auditLogger.js';

export function renderTrackComplaint(container, state, initialSearchId = null) {
  let searchId = initialSearchId || 'CT-2026-0101';
  let activeComplaint = state.dataStore.getComplaintById(searchId);

  function render() {
    activeComplaint = state.dataStore.getComplaintById(searchId);
    const slaStatus = activeComplaint ? slaManager.evaluateSLA(activeComplaint.slaDeadline, activeComplaint.status) : null;
    const allComplaints = state.dataStore.getAllComplaints();
    const auditEvents = activeComplaint ? auditLogger.getEventsForComplaint(activeComplaint.id) : [];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        
        <!-- Search Bar Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            ${i18n.t('trackTitle')}
          </h1>
          <form id="search-form" class="flex flex-col sm:flex-row gap-3 mt-4">
            <input type="text" id="input-search-id" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500 uppercase" placeholder="${i18n.t('searchPlaceholder')}" value="${searchId}" required />
            <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
              🔍 ${i18n.t('searchBtn')}
            </button>
          </form>

          <!-- Quick Select Sample Chips -->
          <div class="mt-4 pt-4 border-t border-slate-100">
            <span class="text-xs text-slate-500 block mb-2">${i18n.t('quickSelectLabel')}</span>
            <div class="flex flex-wrap gap-2">
              ${allComplaints.slice(0, 6).map(c => `
                <button type="button" data-chip-id="${c.id}" class="chip-btn text-xs font-mono px-2.5 py-1 rounded-lg border transition ${c.id === searchId ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}">
                  ${c.id} (${c.status})
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        ${!activeComplaint ? `
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <span class="text-3xl block mb-2">🔍</span>
            <h3 class="text-base font-bold text-amber-900">No complaint found for ID "${searchId}"</h3>
            <p class="text-xs text-amber-700 mt-1">Please check the ID or select one of the sample tickets above.</p>
          </div>
        ` : `
          <!-- Active Complaint Details -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            
            <!-- Header Row -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md">
                    ${activeComplaint.id}
                  </span>
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${STATUSES[activeComplaint.status]?.color || 'bg-slate-100'}">
                    ${STATUSES[activeComplaint.status]?.labelEn || activeComplaint.status}
                  </span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded border ${PRIORITIES[activeComplaint.priority]?.color || ''}">
                    ${activeComplaint.priority} Priority
                  </span>
                </div>
                <h2 class="text-xl font-extrabold text-slate-900">
                  ${activeComplaint.title}
                </h2>
                <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  📍 ${activeComplaint.location?.address} (${activeComplaint.location?.landmark || ''})
                </p>
              </div>

              <!-- SLA Countdown Pill -->
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:text-right min-w-[200px]">
                <span class="text-[11px] uppercase tracking-wider text-slate-500 block font-semibold">
                  SLA Accountability
                </span>
                <span class="text-sm font-bold font-mono ${slaStatus?.isOverdue ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}">
                  ${slaStatus?.formattedRemaining}
                </span>
                <span class="text-[10px] text-slate-400 block mt-0.5">
                  Deadline: ${new Date(activeComplaint.slaDeadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            <!-- Department & Officer Assignment Info -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span class="text-slate-500 block mb-0.5">Assigned Department</span>
                <strong class="text-slate-800 font-semibold">${DEPARTMENTS[activeComplaint.departmentId]?.nameEn || activeComplaint.departmentId}</strong>
              </div>
              <div>
                <span class="text-slate-500 block mb-0.5">Assigned Officer</span>
                <strong class="text-slate-800 font-semibold">${activeComplaint.assignedOfficer || 'Under Department Triage'}</strong>
              </div>
              <div>
                <span class="text-slate-500 block mb-0.5">Citizen Phone (Privacy Masked)</span>
                <strong class="text-slate-800 font-mono">${activeComplaint.citizenPhone || '+91 98*** *****'}</strong>
              </div>
            </div>

            <!-- Chronological Lifecycle Timeline -->
            <div>
              <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>⏱️</span>
                <span>${i18n.t('timelineTitle')}</span>
              </h3>

              <div class="relative border-l-2 border-indigo-200 ml-4 pl-6 space-y-6">
                
                <!-- Event: Citizen Submitted -->
                <div class="relative">
                  <div class="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-100"></div>
                  <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <strong class="text-slate-800 font-semibold">1. Citizen Registered Issue</strong>
                      <span>${new Date(activeComplaint.createdAt).toLocaleString()}</span>
                    </div>
                    <p class="text-xs text-slate-600 mb-3">${activeComplaint.description}</p>
                    
                    ${activeComplaint.evidence?.initialPhoto ? `
                      <div class="mt-2">
                        <span class="text-[11px] font-semibold text-slate-500 block mb-1">Citizen Evidence Photo:</span>
                        <img src="${activeComplaint.evidence.initialPhoto}" alt="Citizen Evidence" class="w-48 h-32 object-cover rounded-lg border border-slate-300 shadow-sm" />
                      </div>
                    ` : ''}
                  </div>
                </div>

                <!-- Event: Resolution Submitted (if any) -->
                ${activeComplaint.resolution ? `
                  <div class="relative">
                    <div class="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-4 ring-emerald-100"></div>
                    <div class="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                      <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <strong class="text-emerald-900 font-semibold">2. Resolution & Completion Evidence Submitted</strong>
                        <span>${new Date(activeComplaint.resolution.resolvedAt).toLocaleString()}</span>
                      </div>
                      <p class="text-xs text-slate-700 mb-3">${activeComplaint.resolution.notes}</p>

                      <!-- Side-by-Side Before/After Photo Review -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-emerald-200/60">
                        <div>
                          <span class="text-[11px] font-bold text-slate-600 block mb-1">Before (Citizen Report):</span>
                          <img src="${activeComplaint.evidence?.initialPhoto}" class="w-full h-32 object-cover rounded-lg border border-slate-300 shadow-sm" />
                        </div>
                        <div>
                          <span class="text-[11px] font-bold text-emerald-800 block mb-1">After (Officer Repair Proof):</span>
                          <img src="${activeComplaint.resolution.officerPhoto}" class="w-full h-32 object-cover rounded-lg border border-emerald-400 shadow-sm" />
                        </div>
                      </div>

                      <!-- AI Verification Status Box -->
                      <div class="mt-3 bg-white p-3 rounded-lg border border-emerald-200 text-xs">
                        <div class="flex items-center justify-between mb-1">
                          <span class="font-bold text-slate-800">AI Evidence Security Check:</span>
                          <span class="px-2 py-0.5 rounded font-bold text-[11px] ${activeComplaint.resolution.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                            ${activeComplaint.resolution.verificationStatus}
                          </span>
                        </div>
                        <p class="text-slate-600 text-[11px]">
                          ${activeComplaint.resolution.verificationResult?.explanation || 'Photo passed structural difference and prompt-injection defense check.'}
                        </p>
                      </div>

                    </div>
                  </div>
                ` : ''}

                <!-- Event: Dispute / Reopen (if any) -->
                ${activeComplaint.reopenedAt ? `
                  <div class="relative">
                    <div class="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-rose-600 border-2 border-white ring-4 ring-rose-100"></div>
                    <div class="bg-rose-50 p-4 rounded-xl border border-rose-200">
                      <div class="flex items-center justify-between text-xs text-rose-800 mb-1">
                        <strong class="font-semibold">⚠️ Citizen Disputed Closure & Reopened</strong>
                        <span>${new Date(activeComplaint.reopenedAt).toLocaleString()}</span>
                      </div>
                      <p class="text-xs text-rose-900 font-medium">${activeComplaint.reopenedReason}</p>
                    </div>
                  </div>
                ` : ''}

              </div>
            </div>

            <!-- Citizen Dispute / Reopen Section -->
            ${activeComplaint.status === 'RESOLVED' || activeComplaint.status === 'UNDER_VERIFICATION' ? `
              <div class="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6">
                <h4 class="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
                  <span>⚖️</span>
                  <span>${i18n.t('disputeTitle')}</span>
                </h4>
                <p class="text-xs text-slate-600 mb-3">
                  ${i18n.t('disputeDesc')}
                </p>
                <form id="dispute-form" class="space-y-3">
                  <textarea id="dispute-reason" required rows="2" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500" placeholder="${i18n.t('disputeReasonPlaceholder')}"></textarea>
                  <button type="submit" class="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow transition">
                    🚨 ${i18n.t('disputeSubmitBtn')}
                  </button>
                </form>
              </div>
            ` : ''}

          </div>
        `}

      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    // Search form
    container.querySelector('#search-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = container.querySelector('#input-search-id')?.value.trim();
      if (val) {
        searchId = val.toUpperCase();
        render();
      }
    });

    // Chips
    container.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        searchId = btn.getAttribute('data-chip-id');
        render();
      });
    });

    // Dispute submit
    container.querySelector('#dispute-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const reason = container.querySelector('#dispute-reason')?.value.trim();
      if (reason && activeComplaint) {
        try {
          await state.dataStore.reopenComplaint(activeComplaint.id, reason);
          alert('Complaint successfully reopened! Department head and officer notified.');
          render();
        } catch (err) {
          alert('Error reopening complaint: ' + err.message);
        }
      }
    });
  }

  render();
}
