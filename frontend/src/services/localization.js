/**
 * CivicTrust AI — Localization Service (English / Hindi)
 */

export const TRANSLATIONS = {
  en: {
    appTitle: 'CivicTrust AI',
    appSubtitle: 'Smart City Complaint & Accountability System',
    tagline: 'Transparent municipal reporting, AI evidence verification & strict SLA governance',
    navSubmit: 'Report Issue',
    navTrack: 'Track Complaint',
    navOfficer: 'Officer Portal',
    navAdmin: 'Admin & Governance',
    navMap: 'City Map',
    navHelp: 'Trust & Privacy',
    currentRole: 'Role',
    roleCitizen: 'Citizen',
    roleOfficer: 'Department Officer',
    roleAdmin: 'Administrator',
    resetSeed: 'Reset Demo Data',
    
    // Citizen Form
    submitTitle: 'Submit a Civic Complaint',
    submitDesc: 'Report civic infrastructure issues with location and photo evidence. Track real-time progress and hold departments accountable.',
    categoryLabel: 'Issue Category',
    titleLabel: 'Summary / Title',
    titlePlaceholder: 'e.g. Dangerous pothole near metro station',
    descLabel: 'Detailed Description',
    descPlaceholder: 'Provide specific details (size, exact spot, hazard level)...',
    locationLabel: 'Incident Location',
    locationAddressPlaceholder: 'Street address or neighborhood (e.g. Outer Ring Road, Bellandur)',
    landmarkPlaceholder: 'Nearby landmark (optional)',
    phoneLabel: 'Citizen Mobile Number (Masked for privacy)',
    phonePlaceholder: '+91 98765 43210',
    uploadPhotoLabel: 'Attach Photo Evidence',
    uploadHint: 'Supported: JPG, PNG, WEBP (Max 5MB). Photo will be verified for authenticity.',
    promptInjectionDemoLabel: 'Security Simulation Test: Inject adversarial instruction into image text',
    consentLabel: 'I consent to municipal staff processing this report and approximate location for repair verification.',
    submitBtn: 'Submit Complaint with SLA Guarantee',
    duplicateWarningTitle: 'Potential Duplicate Incident Detected',
    duplicateWarningDesc: 'A similar issue was recently reported nearby. You can subscribe to the existing ticket to avoid clutter.',
    viewExistingBtn: 'View Existing Complaint',
    submitAnywayBtn: 'Submit as New Complaint',

    // Confirmation
    confirmedTitle: 'Complaint Submitted Successfully!',
    referenceIdLabel: 'Complaint Reference ID',
    slaCommitmentLabel: 'Guaranteed SLA Deadline',
    trackNowBtn: 'Track Status Now',
    submitAnotherBtn: 'Report Another Issue',

    // Tracking
    trackTitle: 'Track Civic Complaint',
    searchPlaceholder: 'Enter Complaint ID (e.g. CT-2026-0101)',
    searchBtn: 'Search',
    quickSelectLabel: 'Or select a sample complaint to test:',
    timelineTitle: 'Resolution Lifecycle & Audit History',
    slaBannerTitle: 'Service Level Agreement (SLA)',
    disputeTitle: 'Dispute Closure / Reopen Complaint',
    disputeDesc: 'If the repair is incomplete, low-quality, or the evidence contradicts actual ground conditions, you can formally dispute this closure.',
    disputeReasonPlaceholder: 'Explain why the repair is unsatisfactory or incomplete...',
    disputeSubmitBtn: 'Submit Formal Dispute & Reopen Ticket',

    // Officer
    officerTitle: 'Department Officer Operations',
    officerDesc: 'Manage assigned civic complaints, update work stages, and submit verified completion evidence.',
    filterDept: 'Filter Department',
    filterStatus: 'Filter Status',
    actionResolve: 'Submit Resolution & Evidence',
    actionStart: 'Mark In Progress',

    // Admin
    adminTitle: 'City Governance & SLA Oversight',
    adminDesc: 'Triage duplicate reports, inspect AI photo security, resolve SLA breaches, and audit municipal decisions.',
    tabDuplicates: 'Duplicate Triaging',
    tabEvidence: 'AI Evidence Verification',
    tabOverdue: 'SLA Escalations',
    tabAudit: 'Audit Trail',

    // Map
    mapTitle: 'Smart City Incident Map',
    mapDesc: 'Real-time geographic distribution of citizen complaints, work progress, and resolution clusters.'
  },
  hi: {
    appTitle: 'सिविकट्रस्ट एआई (CivicTrust AI)',
    appSubtitle: 'स्मार्ट सिटी शिकायत एवं जवाबदेही प्रणाली',
    tagline: 'पारदर्शी नागरिक रिपोर्टिंग, एआई साक्ष्य सत्यापन एवं सख्त एसएलए निगरानी',
    navSubmit: 'शिकायत दर्ज करें',
    navTrack: 'स्थिति देखें',
    navOfficer: 'अधिकारी पोर्टल',
    navAdmin: 'प्रशासन एवं निगरानी',
    navMap: 'शहर का नक्शा',
    navHelp: 'सुरक्षा एवं गोपनीयता',
    currentRole: 'भूमिका',
    roleCitizen: 'नागरिक',
    roleOfficer: 'विभागीय अधिकारी',
    roleAdmin: 'प्रशासक',
    resetSeed: 'डेमो डेटा रीसेट करें',

    // Citizen Form
    submitTitle: 'नागरिक शिकायत दर्ज करें',
    submitDesc: 'सड़क के गड्ढे, कचरा, स्ट्रीटलाइट या पानी की समस्या की रिपोर्ट करें। फोटो और स्थान जोड़ें।',
    categoryLabel: 'समस्या का प्रकार',
    titleLabel: 'शिकायत का शीर्षक',
    titlePlaceholder: 'जैसे: मेट्रो स्टेशन के पास खतरनाक गड्ढा',
    descLabel: 'विस्तृत विवरण',
    descPlaceholder: 'समस्या का सटीक विवरण और स्थिति बताएं...',
    locationLabel: 'घटना स्थल',
    locationAddressPlaceholder: 'पता या इलाका (उदा. आउटर रिंग रोड, बेलंदूर)',
    landmarkPlaceholder: 'निकटतम लैंडमार्क',
    phoneLabel: 'मोबाइल नंबर (गोपनीयता हेतु सुरक्षित)',
    phonePlaceholder: '+91 98765 43210',
    uploadPhotoLabel: 'फोटो साक्ष्य संलग्न करें',
    uploadHint: 'मान्य फॉर्मेट: JPG, PNG, WEBP (अधिकतम 5MB)। फोटो की सत्यता जांची जाएगी।',
    promptInjectionDemoLabel: 'सुरक्षा परीक्षण: फोटो में दुर्भावनापूर्ण टेक्स्ट सिम्युलेट करें',
    consentLabel: 'मैं शिकायत निवारण हेतु इस रिपोर्ट और अनुमानित स्थान के उपयोग की सहमति देता/देती हूँ।',
    submitBtn: 'शिकायत दर्ज करें (समयबद्ध निवारण गारंटी)',
    duplicateWarningTitle: 'संभावित मिलती-जुलती शिकायत मिली',
    duplicateWarningDesc: 'इस स्थान के पास ऐसी ही शिकायत पहले से दर्ज है। आप उसका अपडेट देख सकते हैं।',
    viewExistingBtn: 'मौजूदा शिकायत देखें',
    submitAnywayBtn: 'फिर भी नई शिकायत दर्ज करें',

    // Confirmation
    confirmedTitle: 'शिकायत सफलतापूर्वक दर्ज हुई!',
    referenceIdLabel: 'शिकायत संदर्भ संख्या (Reference ID)',
    slaCommitmentLabel: 'निवारण की अंतिम समय-सीमा (SLA)',
    trackNowBtn: 'स्थिति ट्रैक करें',
    submitAnotherBtn: 'एक और शिकायत दर्ज करें',

    // Tracking
    trackTitle: 'शिकायत की स्थिति ट्रैक करें',
    searchPlaceholder: 'शिकायत आईडी दर्ज करें (उदा. CT-2026-0101)',
    searchBtn: 'खोजें',
    quickSelectLabel: 'या परीक्षण हेतु नमूना शिकायत चुनें:',
    timelineTitle: 'निवारण प्रक्रिया एवं ऑडिट इतिहास',
    slaBannerTitle: 'सेवा स्तर समझौता (SLA स्टेटस)',
    disputeTitle: 'निवारण पर आपत्ति / शिकायत पुनः खोलें',
    disputeDesc: 'यदि कार्य अधूरा है या फोटो जमीनी हकीकत से मेल नहीं खाती, तो आप पुनः जांच की मांग कर सकते हैं।',
    disputeReasonPlaceholder: 'आपत्ति का कारण बताएं...',
    disputeSubmitBtn: 'आपत्ति दर्ज करें और टिकट पुनः खोलें',

    // Officer
    officerTitle: 'विभागीय अधिकारी कार्यक्षेत्र',
    officerDesc: 'आवंटित शिकायतों का समाधान करें, प्रगति दर्ज करें एवं कार्य पूर्ण होने की फोटो अपलोड करें।',
    filterDept: 'विभाग चुनें',
    filterStatus: 'स्थिति चुनें',
    actionResolve: 'समाधान एवं साक्ष्य जमा करें',
    actionStart: 'कार्य शुरू करें',

    // Admin
    adminTitle: 'नगर निगम प्रशासन एवं एसएलए निगरानी',
    adminDesc: 'डुप्लीकेट शिकायतों की समीक्षा करें, एआई साक्ष्य सत्यापन देखें एवं लंबित मामलों को आगे बढ़ाएं।',
    tabDuplicates: 'डुप्लीकेट समीक्षा',
    tabEvidence: 'एआई साक्ष्य सत्यापन',
    tabOverdue: 'एसएलए उल्लंघन एवं एस्केलेशन',
    tabAudit: 'ऑडिट लॉग (इतिहास)',

    // Map
    mapTitle: 'स्मार्ट सिटी शिकायत मानचित्र',
    mapDesc: 'शहरभर में दर्ज शिकायतों और समाधान की वास्तविक भौगोलिक स्थिति।'
  }
};

class LocalizationService {
  constructor() {
    this.currentLang = 'en';
    this.listeners = new Set();
  }

  getLang() {
    return this.currentLang;
  }

  setLang(lang) {
    if (TRANSLATIONS[lang]) {
      this.currentLang = lang;
      this.notify();
    }
  }

  t(key) {
    return TRANSLATIONS[this.currentLang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentLang);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export const i18n = new LocalizationService();
