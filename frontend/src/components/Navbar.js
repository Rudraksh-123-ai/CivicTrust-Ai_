/**
 * CivicTrust AI — Navigation Bar Component
 * Manages role switching, language toggle, and global navigation.
 */

import { i18n } from '../services/localization.js';
import { ROLES } from '../../../shared/types/index.js';

export function renderNavbar(container, state, onNavigate, onRoleChange, onLangChange, onResetData) {
  const currentLang = i18n.getLang();
  const currentRole = state.currentRole;
  const currentView = state.currentView;

  container.innerHTML = `
    <nav class="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Logo & Brand -->
          <div class="flex items-center space-x-3 cursor-pointer" id="nav-brand">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-md">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span class="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                ${i18n.t('appTitle')}
                <span class="text-xs bg-indigo-500/30 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-400/30">SDG 11</span>
              </span>
              <p class="text-xs text-slate-400 hidden sm:block">${i18n.t('appSubtitle')}</p>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button id="nav-submit" class="px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'submit' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
              📝 ${i18n.t('navSubmit')}
            </button>
            <button id="nav-track" class="px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'track' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
              🔍 ${i18n.t('navTrack')}
            </button>
            <button id="nav-officer" class="px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'officer' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
              👷 ${i18n.t('navOfficer')}
            </button>
            <button id="nav-admin" class="px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
              🛡️ ${i18n.t('navAdmin')}
            </button>
            <button id="nav-map" class="px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'map' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
              🗺️ ${i18n.t('navMap')}
            </button>
            <button id="nav-help" class="px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'help' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
              ℹ️ ${i18n.t('navHelp')}
            </button>
          </div>

          <!-- Controls: Role Selector, Lang Switcher, Demo Reset -->
          <div class="flex items-center space-x-2">
            
            <!-- Role Selector Pill -->
            <div class="relative inline-flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs font-medium">
              <span class="text-slate-400 px-1.5 hidden xl:inline">Role:</span>
              <select id="role-select" class="bg-transparent text-white border-0 focus:ring-0 cursor-pointer text-xs pr-6 py-0.5">
                <option value="${ROLES.CITIZEN}" ${currentRole === ROLES.CITIZEN ? 'selected' : ''} class="bg-slate-900 text-white">👤 Citizen</option>
                <option value="${ROLES.OFFICER}" ${currentRole === ROLES.OFFICER ? 'selected' : ''} class="bg-slate-900 text-white">👷 Officer</option>
                <option value="${ROLES.ADMIN}" ${currentRole === ROLES.ADMIN ? 'selected' : ''} class="bg-slate-900 text-white">🛡️ Admin</option>
              </select>
            </div>

            <!-- Language Switcher -->
            <button id="btn-toggle-lang" class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1" title="Toggle Language">
              🌐 <span class="uppercase">${currentLang}</span>
            </button>

            <!-- Reset Seed Data -->
            <button id="btn-reset-data" class="bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs transition" title="${i18n.t('resetSeed')}">
              🔄
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;

  // Attach event handlers
  container.querySelector('#nav-brand')?.addEventListener('click', () => onNavigate('submit'));
  container.querySelector('#nav-submit')?.addEventListener('click', () => onNavigate('submit'));
  container.querySelector('#nav-track')?.addEventListener('click', () => onNavigate('track'));
  container.querySelector('#nav-officer')?.addEventListener('click', () => onNavigate('officer'));
  container.querySelector('#nav-admin')?.addEventListener('click', () => onNavigate('admin'));
  container.querySelector('#nav-map')?.addEventListener('click', () => onNavigate('map'));
  container.querySelector('#nav-help')?.addEventListener('click', () => onNavigate('help'));

  container.querySelector('#role-select')?.addEventListener('change', (e) => onRoleChange(e.target.value));
  container.querySelector('#btn-toggle-lang')?.addEventListener('click', () => {
    onLangChange(currentLang === 'en' ? 'hi' : 'en');
  });
  container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
    if (confirm('Reset demo data to initial smart city seed records?')) {
      onResetData();
    }
  });
}
