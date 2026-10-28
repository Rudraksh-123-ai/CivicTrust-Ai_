/**
 * CivicTrust AI — Type Definitions, Constants & Localization Dictionaries
 */

export const CATEGORIES = {
  POTHOLE: {
    id: 'POTHOLE',
    labelEn: 'Pothole & Road Damage',
    labelHi: 'सड़क के गड्ढे और क्षति',
    departmentId: 'PWD_ROADS',
    defaultPriority: 'HIGH',
    slaHours: 24,
    icon: 'road',
    color: '#e11d48'
  },
  WASTE: {
    id: 'WASTE',
    labelEn: 'Solid Waste & Garbage',
    labelHi: 'कचरा और सफाई',
    departmentId: 'SWM',
    defaultPriority: 'MEDIUM',
    slaHours: 48,
    icon: 'trash',
    color: '#f59e0b'
  },
  STREETLIGHT: {
    id: 'STREETLIGHT',
    labelEn: 'Streetlight Failure',
    labelHi: 'स्ट्रीट लाइट खराबी',
    departmentId: 'ELECTRICITY',
    defaultPriority: 'LOW',
    slaHours: 72,
    icon: 'lightbulb',
    color: '#8b5cf6'
  },
  DRAINAGE: {
    id: 'DRAINAGE',
    labelEn: 'Clogged Drainage & Sewage',
    labelHi: 'नाली और सीवेज जाम',
    departmentId: 'WATER_SEWAGE',
    defaultPriority: 'HIGH',
    slaHours: 24,
    icon: 'droplets',
    color: '#0284c7'
  },
  WATER_LEAKAGE: {
    id: 'WATER_LEAKAGE',
    labelEn: 'Water Pipeline Leakage',
    labelHi: 'पानी की पाइपलाइन रिसाव',
    departmentId: 'WATER_SEWAGE',
    defaultPriority: 'CRITICAL',
    slaHours: 12,
    icon: 'faucet',
    color: '#06b6d4'
  }
};

export const DEPARTMENTS = {
  PWD_ROADS: {
    id: 'PWD_ROADS',
    nameEn: 'Public Works Department (Roads & Bridges)',
    nameHi: 'लोक निर्माण विभाग (सड़क एवं पुल)',
    headOfficer: 'Er. Rajesh Sharma',
    contactEmail: 'pwd-roads@smartcity.gov.in',
    defaultEscalationOfficer: 'Superintending Engineer PWD'
  },
  SWM: {
    id: 'SWM',
    nameEn: 'Solid Waste Management Corporation',
    nameHi: 'ठोस अपशिष्ट प्रबंधन निगम',
    headOfficer: 'Dr. Sunita Verma',
    contactEmail: 'swm-clean@smartcity.gov.in',
    defaultEscalationOfficer: 'Additional Commissioner Sanitation'
  },
  ELECTRICITY: {
    id: 'ELECTRICITY',
    nameEn: 'City Power & Streetlighting Board',
    nameHi: 'नगर विद्युत एवं पथ प्रकाश बोर्ड',
    headOfficer: 'Er. Amit Kulkarni',
    contactEmail: 'power@smartcity.gov.in',
    defaultEscalationOfficer: 'Executive Engineer Electrical'
  },
  WATER_SEWAGE: {
    id: 'WATER_SEWAGE',
    nameEn: 'Water Supply & Sewerage Board',
    nameHi: 'जल आपूर्ति एवं सीवरेज बोर्ड',
    headOfficer: 'Er. Priya Nair',
    contactEmail: 'water@smartcity.gov.in',
    defaultEscalationOfficer: 'Chief Engineer Water Resources'
  }
};

export const STATUSES = {
  SUBMITTED: { id: 'SUBMITTED', labelEn: 'Submitted', labelHi: 'दर्ज किया गया', color: 'bg-blue-100 text-blue-800' },
  TRIAGED: { id: 'TRIAGED', labelEn: 'Triaged', labelHi: 'वर्गीकृत', color: 'bg-indigo-100 text-indigo-800' },
  ASSIGNED: { id: 'ASSIGNED', labelEn: 'Assigned', labelHi: 'अधिकारी को सौंपा', color: 'bg-amber-100 text-amber-800' },
  IN_PROGRESS: { id: 'IN_PROGRESS', labelEn: 'In Progress', labelHi: 'प्रगति पर है', color: 'bg-purple-100 text-purple-800' },
  UNDER_VERIFICATION: { id: 'UNDER_VERIFICATION', labelEn: 'Under AI/Human Verification', labelHi: 'सत्यापन प्रक्रिया में', color: 'bg-orange-100 text-orange-800' },
  RESOLVED: { id: 'RESOLVED', labelEn: 'Resolved & Verified', labelHi: 'निस्तारित एवं सत्यापित', color: 'bg-emerald-100 text-emerald-800' },
  ESCALATED: { id: 'ESCALATED', labelEn: 'Escalated (SLA Breached)', labelHi: 'उच्चाधिकारी को प्रेषित', color: 'bg-rose-100 text-rose-800' },
  REOPENED: { id: 'REOPENED', labelEn: 'Disputed & Reopened', labelHi: 'पुनः खोला गया', color: 'bg-red-100 text-red-800' }
};

export const PRIORITIES = {
  CRITICAL: { id: 'CRITICAL', labelEn: 'Critical', labelHi: 'अति आवश्यक', slaHours: 12, color: 'text-red-700 bg-red-50 border-red-300' },
  HIGH: { id: 'HIGH', labelEn: 'High', labelHi: 'उच्च', slaHours: 24, color: 'text-orange-700 bg-orange-50 border-orange-300' },
  MEDIUM: { id: 'MEDIUM', labelEn: 'Medium', labelHi: 'मध्यम', slaHours: 48, color: 'text-yellow-700 bg-yellow-50 border-yellow-300' },
  LOW: { id: 'LOW', labelEn: 'Low', labelHi: 'सामान्य', slaHours: 72, color: 'text-slate-700 bg-slate-50 border-slate-300' }
};

export const VERIFICATION_STATUSES = {
  VERIFIED: 'Verified',
  NEEDS_REVIEW: 'Needs Review',
  VERIFICATION_FAILED: 'Verification Failed',
  UNAVAILABLE: 'Unavailable'
};

export const ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  ADMIN: 'admin'
};
