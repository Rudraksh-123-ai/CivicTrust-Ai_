/**
 * CivicTrust AI — City Incident Map Component
 * Interactive geospatial visualization of complaints, status clusters, and SLA risks.
 */

import { i18n } from '../services/localization.js';
import { CATEGORIES, STATUSES } from '../../../shared/types/index.js';
import { slaManager } from '../../../shared/services/slaManager.js';

export function renderCityMap(container, state, onNavigateToComplaint) {
  let selectedCategoryFilter = 'ALL';
  let activePin = null;

  function render() {
    let complaints = state.dataStore.getAllComplaints();
    if (selectedCategoryFilter !== 'ALL') {
      complaints = complaints.filter(c => c.categoryId === selectedCategoryFilter);
    }

    container.innerHTML = `
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ${i18n.t('mapTitle')}
            </h1>
            <p class="text-sm text-slate-500 mt-1">
              ${i18n.t('mapDesc')}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-xl font-bold font-mono">
              📍 Pins: ${complaints.length}
            </span>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="flex flex-wrap gap-2">
          <button data-cat="ALL" class="map-cat-filter px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${selectedCategoryFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}">
            All Categories
          </button>
          ${Object.values(CATEGORIES).map(cat => `
            <button data-cat="${cat.id}" class="map-cat-filter px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${selectedCategoryFilter === cat.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}">
              ${cat.labelEn}
            </button>
          `).join('')}
        </div>

        <!-- Interactive Map Canvas Container -->
        <div class="relative bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 min-h-[500px]">
          
          <!-- Simulated / Embedded OSM Map Background Grid -->
          <div class="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
          
          <!-- City Map Overlay Roads & Sectors -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700/60" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="20%" x2="90%" y2="80%" stroke-width="3" stroke-dasharray="6 6" />
            <line x1="20%" y1="80%" x2="80%" y2="15%" stroke-width="4" />
            <line x1="15%" y1="50%" x2="85%" y2="50%" stroke-width="2" />
            <circle cx="50%" cy="50%" r="180" fill="none" stroke-width="1.5" stroke="#334155" />
            <circle cx="35%" cy="40%" r="70" fill="none" stroke-width="1" stroke="#334155" />
            <circle cx="70%" cy="65%" r="100" fill="none" stroke-width="1" stroke="#334155" />
          </svg>

          <!-- City Landmark Labels -->
          <div class="absolute top-6 left-8 text-[11px] font-mono text-slate-400/80 pointer-events-none">
            🏙️ Sector 4 / Tech Corridor (Outer Ring Rd)
          </div>
          <div class="absolute bottom-6 left-8 text-[11px] font-mono text-slate-400/80 pointer-events-none">
            🏛️ Municipal Central Ward
          </div>
          <div class="absolute top-6 right-8 text-[11px] font-mono text-slate-400/80 pointer-events-none">
            🌳 Metro Zone & Residential Hub
          </div>

          <!-- Incident Markers -->
          <div class="absolute inset-0 p-8 flex items-center justify-center">
            ${complaints.map((c, idx) => {
              // Deterministic spatial offset based on lat/lng or index
              const leftPercent = 20 + ((idx * 27 + (c.location?.lng || 77) * 100) % 65);
              const topPercent = 20 + ((idx * 33 + (c.location?.lat || 12) * 100) % 60);
              const categoryColor = CATEGORIES[c.categoryId]?.color || '#6366f1';
              const sla = slaManager.evaluateSLA(c.slaDeadline, c.status);
              const isOverdue = sla.isOverdue;

              return `
                <div class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition hover:scale-125 z-20 group"
                     style="left: ${leftPercent}%; top: ${topPercent}%;"
                     data-marker-id="${c.id}">
                  
                  <!-- Pulsing ring if overdue -->
                  ${isOverdue ? `
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  ` : ''}

                  <!-- Pin icon -->
                  <div class="relative w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white"
                       style="background-color: ${categoryColor};">
                    ${getCategoryIconText(c.categoryId)}
                  </div>

                  <!-- Hover Tooltip -->
                  <div class="hidden group-hover:block absolute bottom-10 left-1/2 -translate-x-1/2 w-48 bg-slate-900/95 text-white p-2.5 rounded-xl text-[11px] shadow-2xl border border-slate-700 pointer-events-none z-30">
                    <div class="font-bold font-mono text-indigo-400">${c.id}</div>
                    <div class="font-semibold text-slate-200 line-clamp-1">${c.title}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${sla.formattedRemaining}</div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

          <!-- Active Pin Popup Drawer -->
          ${activePin ? `
            <div class="absolute bottom-6 right-6 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-40 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <span class="font-mono text-xs font-bold text-indigo-600">${activePin.id}</span>
                <button id="btn-close-pin" class="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div>
                <h4 class="font-bold text-slate-900 text-sm">${activePin.title}</h4>
                <p class="text-xs text-slate-500 mt-0.5">📍 ${activePin.location?.address}</p>
              </div>

              ${activePin.evidence?.initialPhoto ? `
                <img src="${activePin.evidence.initialPhoto}" class="w-full h-28 object-cover rounded-xl border border-slate-200" />
              ` : ''}

              <div class="flex items-center justify-between text-xs pt-1">
                <span class="font-semibold text-slate-700">Status: ${activePin.status}</span>
                <button id="btn-track-pin" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm">
                  View Full Timeline →
                </button>
              </div>
            </div>
          ` : ''}

        </div>

      </div>
    `;

    attachEvents();
  }

  function getCategoryIconText(catId) {
    switch (catId) {
      case 'POTHOLE': return '🚧';
      case 'WASTE': return '🗑️';
      case 'STREETLIGHT': return '💡';
      case 'DRAINAGE': return '🌊';
      case 'WATER_LEAKAGE': return '🚰';
      default: return '📍';
    }
  }

  function attachEvents() {
    container.querySelectorAll('.map-cat-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategoryFilter = btn.getAttribute('data-cat');
        render();
      });
    });

    container.querySelectorAll('[data-marker-id]').forEach(marker => {
      marker.addEventListener('click', () => {
        const id = marker.getAttribute('data-marker-id');
        activePin = state.dataStore.getComplaintById(id);
        render();
      });
    });

    container.querySelector('#btn-close-pin')?.addEventListener('click', () => {
      activePin = null;
      render();
    });

    container.querySelector('#btn-track-pin')?.addEventListener('click', () => {
      if (activePin) {
        onNavigateToComplaint(activePin.id);
      }
    });
  }

  render();
}
