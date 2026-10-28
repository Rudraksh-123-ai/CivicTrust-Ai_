/**
 * CivicTrust AI — Main Application Orchestrator
 * Mounts components, manages client-side routing, role switching, and reactive state.
 */

import { dataStore } from './services/storage/dataStore.js';
import { evidenceVerifier } from './services/verification/evidenceVerifier.js';
import { i18n } from './services/localization.js';
import { ROLES } from '../../shared/types/index.js';

import { renderNavbar } from './components/Navbar.js';
import { renderCitizenForm } from './components/CitizenForm.js';
import { renderConfirmation } from './components/ConfirmationView.js';
import { renderTrackComplaint } from './components/TrackComplaint.js';
import { renderOfficerDashboard } from './components/OfficerDashboard.js';
import { renderAdminDashboard } from './components/AdminDashboard.js';
import { renderCityMap } from './components/CityMap.js';
import { renderHelpPrivacy } from './components/HelpPrivacy.js';

class CivicTrustApp {
  constructor() {
    this.state = {
      currentView: 'submit', // submit | confirmation | track | officer | admin | map | help
      currentRole: ROLES.CITIZEN,
      selectedComplaintId: null,
      dataStore,
      evidenceVerifier
    };

    this.navContainer = null;
    this.mainContainer = null;
  }

  async init(navElementId = 'app-nav', mainElementId = 'app-main') {
    this.navContainer = document.getElementById(navElementId);
    this.mainContainer = document.getElementById(mainElementId);

    // Initialize data store from local persistence / seeds
    await dataStore.init();

    // Subscribe to store updates
    dataStore.subscribe(() => {
      this.render();
    });

    // Subscribe to language updates
    i18n.subscribe(() => {
      this.render();
    });

    // Handle hash-based deep linking
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();

    this.render();
  }

  handleRoute() {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (!hash) {
      this.state.currentView = 'submit';
      return;
    }

    const [route, param] = hash.split('/');
    if (['submit', 'confirmation', 'track', 'officer', 'admin', 'map', 'help'].includes(route)) {
      this.state.currentView = route;
      if (param) {
        this.state.selectedComplaintId = param;
      }
    }
  }

  navigate(view, param = null) {
    this.state.currentView = view;
    this.state.selectedComplaintId = param;
    window.location.hash = param ? `#/${view}/${param}` : `#/${view}`;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setRole(role) {
    this.state.currentRole = role;
    if (role === ROLES.OFFICER && this.state.currentView === 'submit') {
      this.navigate('officer');
    } else if (role === ROLES.ADMIN && this.state.currentView === 'submit') {
      this.navigate('admin');
    } else if (role === ROLES.CITIZEN && (this.state.currentView === 'officer' || this.state.currentView === 'admin')) {
      this.navigate('submit');
    } else {
      this.render();
    }
  }

  setLanguage(lang) {
    i18n.setLang(lang);
  }

  async resetData() {
    await dataStore.resetToSeed();
    alert('Demo database reset to initial smart city records!');
    this.navigate('submit');
  }

  render() {
    if (!this.navContainer || !this.mainContainer) return;

    // Render Navigation
    renderNavbar(
      this.navContainer,
      this.state,
      (view) => this.navigate(view),
      (role) => this.setRole(role),
      (lang) => this.setLanguage(lang),
      () => this.resetData()
    );

    // Clear Main View
    this.mainContainer.innerHTML = '';

    // Render Current View
    switch (this.state.currentView) {
      case 'submit':
        renderCitizenForm(
          this.mainContainer,
          this.state,
          (newId) => this.navigate('confirmation', newId),
          (existingId) => this.navigate('track', existingId)
        );
        break;

      case 'confirmation':
        renderConfirmation(
          this.mainContainer,
          this.state,
          this.state.selectedComplaintId || 'CT-2026-0101',
          (id) => this.navigate('track', id),
          () => this.navigate('submit')
        );
        break;

      case 'track':
        renderTrackComplaint(
          this.mainContainer,
          this.state,
          this.state.selectedComplaintId
        );
        break;

      case 'officer':
        renderOfficerDashboard(
          this.mainContainer,
          this.state,
          (id) => this.navigate('track', id)
        );
        break;

      case 'admin':
        renderAdminDashboard(
          this.mainContainer,
          this.state,
          (id) => this.navigate('track', id)
        );
        break;

      case 'map':
        renderCityMap(
          this.mainContainer,
          this.state,
          (id) => this.navigate('track', id)
        );
        break;

      case 'help':
        renderHelpPrivacy(this.mainContainer);
        break;

      default:
        this.navigate('submit');
        break;
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new CivicTrustApp();
  app.init('app-nav', 'app-main').catch(error => {
    console.error('CivicTrust could not connect to its backend:', error);
    const main = document.getElementById('app-main');
    const message = document.createElement('p');
    message.className = 'mx-auto mt-12 max-w-2xl rounded-xl bg-rose-50 p-6 text-rose-800';
    message.textContent = `Unable to load CivicTrust data. Confirm the backend is running at ${window.CIVICTRUST_API_URL || 'http://127.0.0.1:3001/api'} and reload. Details: ${error.message}`;
    main?.replaceChildren(message);
  });
  window.CivicTrustApp = app;
});
