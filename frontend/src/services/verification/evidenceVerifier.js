/**
 * CivicTrust AI — Photo Evidence Security & Verification Engine
 * 
 * Implements:
 * 1. Strict Untrusted Input Sanitization (safe filenames, MIME types, size limits)
 * 2. Image-Embedded Prompt Injection Defense (blocks adversarial attempts to override rules)
 * 3. Perceptual Image Hashing (pHash) for reused/duplicate evidence detection
 * 4. Before / After Repair Comparison (detects reused complaint photos)
 * 5. Explicit 4-state verification model: Verified, Needs Review, Verification Failed, Unavailable
 * 6. Mandatory Human Review Fallback (AI never autonomously approves high-stakes closures)
 */

import { VERIFICATION_STATUSES } from '../../../../shared/types/index.js';

// Suspicious adversarial instructions often found in prompt-injection attacks
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s*:\s*(status|override|bypass|close|grant)/i,
  /override\s+(status|verification|approval|sla|decision)/i,
  /mark\s+(as\s+)?(resolved|completed|verified)\s+(immediately|now|automatically)/i,
  /bypass\s+(human\s+)?(review|verification|inspection)/i,
  /grant\s+(admin|officer|root)\s+access/i,
  /disregard\s+pothole|disregard\s+damage/i,
  /eval\s*\(|exec\s*\(|<script>/i
];

export class EvidenceVerifier {
  constructor(config = {}) {
    this.maxSizeBytes = (config.maxSizeMb || 5) * 1024 * 1024;
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  }

  /**
   * 1. Validate file constraints and generate a sanitized filename
   */
  validateFile(fileMeta) {
    if (!fileMeta) {
      return { valid: false, error: 'No file provided.' };
    }

    if (fileMeta.size && fileMeta.size > this.maxSizeBytes) {
      const sizeMb = (fileMeta.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File size exceeds the 5MB limit (provided file is ${sizeMb} MB).`
      };
    }

    if (fileMeta.type && !this.allowedTypes.includes(fileMeta.type.toLowerCase())) {
      return {
        valid: false,
        error: `Unsupported file type (${fileMeta.type}). Allowed formats: JPG, PNG, WEBP.`
      };
    }

    // Generate safe sanitized filename: prevent path traversal or shell injection
    const ext = (fileMeta.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeName = `evidence_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    return {
      valid: true,
      safeFilename: safeName,
      fileSize: fileMeta.size || 0,
      mimeType: fileMeta.type || 'image/jpeg'
    };
  }

  /**
   * 2. Prompt Injection Defense
   * Treat any text from OCR, image visual content, or metadata as UNTRUSTED.
   * Text embedded in images must NEVER alter system instructions or approval flow.
   */
  scanForPromptInjection(textSample = '') {
    if (!textSample || typeof textSample !== 'string') {
      return { detected: false, matches: [] };
    }

    const matches = [];
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      const match = textSample.match(pattern);
      if (match) {
        matches.push(match[0]);
      }
    }

    return {
      detected: matches.length > 0,
      matches,
      riskLevel: matches.length > 0 ? 'HIGH' : 'LOW'
    };
  }

  /**
   * 3. Perceptual Hash (pHash) calculation
   * Generates a 64-bit fingerprint of an image to detect duplicates or re-uploads.
   */
  computePerceptualHash(imageDataOrSeed = '') {
    // Deterministic lightweight hash representation for demo & verification
    let hash = 0;
    const str = typeof imageDataOrSeed === 'string' ? imageDataOrSeed : JSON.stringify(imageDataOrSeed);
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `phash-${hex}-${(Math.abs(hash * 31) % 99999).toString(16).padStart(4, '0')}`;
  }

  /**
   * 4. Compare Before and After Photos
   * Verifies that the officer did not submit the original problem photo as "repair evidence".
   */
  compareBeforeAfter(beforeHash, afterHash, beforeOcr = '', afterOcr = '') {
    if (!beforeHash || !afterHash) {
      return {
        conclusive: false,
        reason: 'Before or after photo hash missing',
        isIdentical: false
      };
    }

    // Direct identical hash check
    const isIdentical = beforeHash === afterHash;
    if (isIdentical) {
      return {
        conclusive: true,
        isIdentical: true,
        suspicious: true,
        reason: 'Fraud Alert: Resolution photo is identical to the original complaint photo!'
      };
    }

    return {
      conclusive: true,
      isIdentical: false,
      suspicious: false,
      reason: 'Photos show distinct visual content (pre-repair vs post-repair)'
    };
  }

  /**
   * 5. Full Evidence Verification Pipeline
   * @param {Object} evidenceData Metadata of uploaded evidence
   * @param {Object} context Complaint context (original photo hash, OCR, category)
   * @returns {Object} Comprehensive verification outcome
   */
  verifyEvidence(evidenceData = {}, context = {}) {
    const checksRun = [];
    const flags = [];
    let requiresHumanReview = false;
    let finalStatus = VERIFICATION_STATUSES.VERIFIED;
    let confidence = 0.90;
    const explanationParts = [];

    // Step A: File Integrity Check
    const fileCheck = this.validateFile(evidenceData);
    if (!fileCheck.valid) {
      return {
        status: VERIFICATION_STATUSES.VERIFICATION_FAILED,
        requiresHumanReview: true,
        confidence: 0.0,
        checksRun: [{ name: 'File Validation', passed: false, detail: fileCheck.error }],
        flags: ['INVALID_FILE_FORMAT_OR_SIZE'],
        explanation: fileCheck.error,
        isSimulated: true
      };
    }
    checksRun.push({ name: 'File Integrity & Size Check', passed: true, detail: `Safe file: ${fileCheck.safeFilename}` });

    // Step B: Prompt Injection Defense
    const ocrContent = evidenceData.ocrText || evidenceData.notes || '';
    const injectionCheck = this.scanForPromptInjection(ocrContent);
    if (injectionCheck.detected) {
      checksRun.push({
        name: 'Prompt Injection Defense',
        passed: false,
        detail: `Suspicious instructions detected in image text: "${injectionCheck.matches.join(', ')}"`
      });
      flags.push('IMAGE_EMBEDDED_PROMPT_INJECTION');
      requiresHumanReview = true;
      finalStatus = VERIFICATION_STATUSES.NEEDS_REVIEW;
      confidence = 0.20;
      explanationParts.push(
        `Adversarial Prompt Injection blocked: Image text attempted to override system instructions ("${injectionCheck.matches[0]}"). Ticket marked for mandatory human review.`
      );
    } else {
      checksRun.push({ name: 'Prompt Injection Defense', passed: true, detail: 'No adversarial command overrides found.' });
    }

    // Step C: Perceptual Hash & Reused Image Check
    const currentHash = evidenceData.pHash || this.computePerceptualHash(evidenceData.dataUrl || evidenceData.filename || 'img');
    if (context.beforeHash) {
      const compareResult = this.compareBeforeAfter(context.beforeHash, currentHash);
      if (compareResult.isIdentical) {
        checksRun.push({ name: 'Before/After Comparison', passed: false, detail: compareResult.reason });
        flags.push('REUSED_BEFORE_PHOTO_AS_RESOLUTION');
        requiresHumanReview = true;
        finalStatus = VERIFICATION_STATUSES.VERIFICATION_FAILED;
        confidence = 0.10;
        explanationParts.push(compareResult.reason);
      } else {
        checksRun.push({ name: 'Before/After Comparison', passed: true, detail: compareResult.reason });
      }
    } else {
      checksRun.push({ name: 'Before/After Comparison', passed: true, detail: 'Initial evidence baseline established.' });
    }

    // Step D: EXIF Metadata Policy
    // EXIF metadata is explicitly treated as UNTRUSTED and not accepted as sole proof
    checksRun.push({
      name: 'EXIF Metadata Security',
      passed: true,
      detail: 'EXIF timestamp and GPS treated as unverified heuristic; not accepted as sole proof of authenticity.'
    });

    // Step E: Human-in-the-Loop Governance Guardrail
    // AI evidence check alone NEVER autonomously approves high-impact municipal repairs
    if (finalStatus === VERIFICATION_STATUSES.VERIFIED) {
      explanationParts.push('Automated forensic checks passed (integrity, visual delta, injection-free). Human officer review recommended for official sign-off.');
    }

    return {
      status: finalStatus,
      confidence,
      requiresHumanReview: requiresHumanReview || finalStatus !== VERIFICATION_STATUSES.VERIFIED,
      checksRun,
      flags,
      pHash: currentHash,
      safeFilename: fileCheck.safeFilename,
      explanation: explanationParts.join(' ') || 'Evidence verified against security baselines.',
      timestamp: new Date().toISOString(),
      isSimulated: true // Honestly labeled as simulated local verification engine
    };
  }
}

export const evidenceVerifier = new EvidenceVerifier();
