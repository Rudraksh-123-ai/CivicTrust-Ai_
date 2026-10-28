/**
 * CivicTrust AI — Duplicate & Related Incident Detection Service
 * Uses transparent multi-factor scoring (Category + Geo Proximity + Time Window + Text Overlap).
 * Never silently deletes or merges records; flags candidates for review with explainable scores.
 */

export class DuplicateDetector {
  /**
   * Calculate Haversine distance in meters between two lat/lng pairs
   */
  calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
    const R = 6371e3; // Earth radius in meters
    const toRad = deg => (deg * Math.PI) / 180;
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaPhi = toRad(lat2 - lat1);
    const deltaLambda = toRad(lon2 - lon1);

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  /**
   * Token overlap score between two description texts (Jaccard similarity)
   */
  calculateTextSimilarity(text1 = '', text2 = '') {
    const cleanTokens = str =>
      new Set(
        str
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 2)
      );

    const setA = cleanTokens(text1);
    const setB = cleanTokens(text2);

    if (setA.size === 0 || setB.size === 0) return 0;

    let intersection = 0;
    for (const word of setA) {
      if (setB.has(word)) intersection++;
    }

    const union = new Set([...setA, ...setB]).size;
    return intersection / union;
  }

  /**
   * Compare candidate complaint against an existing complaint
   * @param {Object} candidate 
   * @param {Object} existing 
   * @returns {Object|null} Match object with score, reasons, distance, hoursApart
   */
  compareComplaints(candidate, existing) {
    if (candidate.id === existing.id) return null;

    let score = 0;
    const reasons = [];

    // 1. Category match (Weight: 35%)
    const sameCategory = candidate.categoryId === existing.categoryId;
    if (sameCategory) {
      score += 35;
      reasons.push('Identical issue category');
    }

    // 2. Spatial proximity (Weight: 35%)
    const distanceMeters = this.calculateDistanceMeters(
      candidate.location?.lat,
      candidate.location?.lng,
      existing.location?.lat,
      existing.location?.lng
    );

    if (distanceMeters <= 80) {
      score += 35;
      reasons.push(`Within immediate proximity (${distanceMeters}m away)`);
    } else if (distanceMeters <= 250) {
      score += 25;
      reasons.push(`Close vicinity (${distanceMeters}m away)`);
    } else if (distanceMeters <= 500) {
      score += 15;
      reasons.push(`Same neighborhood (${distanceMeters}m away)`);
    }

    // 3. Temporal proximity (Weight: 20%)
    const candidateTime = new Date(candidate.createdAt || Date.now()).getTime();
    const existingTime = new Date(existing.createdAt).getTime();
    const hoursApart = Math.abs(Math.round((candidateTime - existingTime) / (1000 * 60 * 60)));

    if (hoursApart <= 12) {
      score += 20;
      reasons.push(`Reported within 12 hours (${hoursApart}h apart)`);
    } else if (hoursApart <= 48) {
      score += 15;
      reasons.push(`Reported within 48 hours (${hoursApart}h apart)`);
    } else if (hoursApart <= 168) {
      score += 5;
      reasons.push(`Reported within past 7 days (${hoursApart}h apart)`);
    }

    // 4. Description text similarity (Weight: 10%)
    const textSim = this.calculateTextSimilarity(candidate.description, existing.description);
    if (textSim >= 0.25) {
      const textPoints = Math.round(textSim * 10);
      score += textPoints;
      reasons.push(`High description phrasing similarity (${Math.round(textSim * 100)}%)`);
    }

    // Threshold for flagging potential duplicate: 60%
    if (score >= 60) {
      return {
        existingComplaintId: existing.id,
        existingComplaint: existing,
        score,
        confidence: score >= 80 ? 'HIGH' : 'MEDIUM',
        reasons,
        distanceMeters,
        hoursApart
      };
    }

    return null;
  }

  /**
   * Search an array of complaints for possible duplicates
   * @param {Object} candidate 
   * @param {Array<Object>} existingComplaints 
   * @returns {Array<Object>} Flagged duplicates sorted by score descending
   */
  findDuplicates(candidate, existingComplaints = []) {
    const matches = [];
    for (const existing of existingComplaints) {
      const match = this.compareComplaints(candidate, existing);
      if (match) {
        matches.push(match);
      }
    }
    return matches.sort((a, b) => b.score - a.score);
  }
}

export const duplicateDetector = new DuplicateDetector();
