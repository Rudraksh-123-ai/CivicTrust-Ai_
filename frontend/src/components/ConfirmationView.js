/**
 * CivicTrust AI — Submission Confirmation Component
 * Displays unique Complaint Reference ID, SLA Commitment, and quick navigation.
 */

import { i18n } from '../services/localization.js';
import { slaManager } from '../../../shared/services/slaManager.js';

export function renderConfirmation(container, state, complaintId, onTrack, onSubmitAnother) {
  const complaint = state.dataStore.getComplaintById(complaintId);
  const slaStatus = complaint ? slaManager.evaluateSLA(complaint.slaDeadline, complaint.status) : null;

  container.innerHTML = `
    <div class="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      
      <!-- Confirmation Card -->
      <div class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 sm:p-12">
        
        <!-- Big Green Check Circle -->
        <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          ${i18n.t('confirmedTitle')}
        </h1>
        <p class="text-sm text-slate-600 max-w-md mx-auto mb-8">
          Your complaint has been registered in the municipal accountability ledger and assigned an auditable service-level agreement.
        </p>

        <!-- Reference ID Highlight Box -->
        <div class="bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl p-5 mb-8 max-w-md mx-auto">
          <div class="text-xs uppercase font-bold text-indigo-700 tracking-wider mb-1">
            ${i18n.t('referenceIdLabel')}
          </div>
          <div class="flex items-center justify-center gap-3">
            <span class="text-3xl font-black font-mono text-indigo-950 tracking-wider">
              ${complaintId}
            </span>
            <button id="btn-copy-id" class="text-xs bg-white hover:bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-300 transition shadow-sm" title="Copy to clipboard">
              📋 Copy
            </button>
          </div>
          <p class="text-[11px] text-indigo-600 mt-2">
            Save this ID to track live updates or dispute closure if repairs are unsatisfactory.
          </p>
        </div>

        <!-- SLA Commitment Banner -->
        ${complaint ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span class="text-xs text-slate-500 block">Department Assigned</span>
              <strong class="text-xs sm:text-sm text-slate-800">${complaint.departmentId}</strong>
            </div>
            <div>
              <span class="text-xs text-slate-500 block">${i18n.t('slaCommitmentLabel')}</span>
              <strong class="text-xs sm:text-sm text-indigo-600 font-mono">${slaStatus?.formattedRemaining}</strong>
            </div>
          </div>
        ` : ''}

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button id="btn-track-now" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
            🔍 ${i18n.t('trackNowBtn')}
          </button>
          <button id="btn-submit-another" class="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition">
            ➕ ${i18n.t('submitAnotherBtn')}
          </button>
        </div>

      </div>

    </div>
  `;

  // Attach actions
  container.querySelector('#btn-copy-id')?.addEventListener('click', () => {
    navigator.clipboard.writeText(complaintId);
    alert(`Copied ${complaintId} to clipboard!`);
  });

  container.querySelector('#btn-track-now')?.addEventListener('click', () => onTrack(complaintId));
  container.querySelector('#btn-submit-another')?.addEventListener('click', onSubmitAnother);
}
