/**
 * DataValidator - Validates and sanitizes data structures
 * Provides schema validation for localStorage and API data
 */
export class DataValidator {
  /**
   * Validate profile data structure
   */
  static validateProfile(profile) {
    if (!profile || typeof profile !== 'object') {
      return { valid: false, error: 'Profile must be an object' };
    }

    // Required fields
    const requiredFields = ['version', 'profileId', 'progress', 'skills', 'gameHistory'];
    for (const field of requiredFields) {
      if (!(field in profile)) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }

    // Validate version
    if (typeof profile.version !== 'string' || !profile.version.match(/^\d+\.\d+\.\d+$/)) {
      return { valid: false, error: 'Invalid version format' };
    }

    // Validate profileId
    if (typeof profile.profileId !== 'string' || profile.profileId.length === 0) {
      return { valid: false, error: 'Invalid profileId' };
    }

    // Validate progress object
    const progressValidation = this.validateProgress(profile.progress);
    if (!progressValidation.valid) {
      return progressValidation;
    }

    // Validate skills object
    const skillsValidation = this.validateSkills(profile.skills);
    if (!skillsValidation.valid) {
      return skillsValidation;
    }

    // Validate gameHistory
    if (typeof profile.gameHistory !== 'object') {
      return { valid: false, error: 'gameHistory must be an object' };
    }

    // Validate achievements if present
    if (profile.achievements && !Array.isArray(profile.achievements)) {
      return { valid: false, error: 'achievements must be an array' };
    }

    // Validate srsData if present
    if (profile.srsData && typeof profile.srsData !== 'object') {
      return { valid: false, error: 'srsData must be an object' };
    }

    return { valid: true };
  }

  /**
   * Validate progress object
   */
  static validateProgress(progress) {
    if (!progress || typeof progress !== 'object') {
      return { valid: false, error: 'progress must be an object' };
    }

    const requiredFields = ['level', 'totalScore', 'gamesPlayed'];
    for (const field of requiredFields) {
      if (!(field in progress)) {
        return { valid: false, error: `progress missing field: ${field}` };
      }

      if (typeof progress[field] !== 'number' || progress[field] < 0) {
        return { valid: false, error: `progress.${field} must be a non-negative number` };
      }
    }

    return { valid: true };
  }

  /**
   * Validate skills object
   */
  static validateSkills(skills) {
    if (!skills || typeof skills !== 'object') {
      return { valid: false, error: 'skills must be an object' };
    }

    const requiredSkills = ['alphabet', 'vocabulary', 'words', 'sentences', 'reading', 'listening'];
    for (const skillName of requiredSkills) {
      if (!(skillName in skills)) {
        return { valid: false, error: `skills missing: ${skillName}` };
      }

      const skill = skills[skillName];
      if (typeof skill !== 'object') {
        return { valid: false, error: `skills.${skillName} must be an object` };
      }

      // Validate skill fields
      if (typeof skill.level !== 'number' || skill.level < 0) {
        return { valid: false, error: `skills.${skillName}.level must be a non-negative number` };
      }

      if (typeof skill.accuracy !== 'number' || skill.accuracy < 0 || skill.accuracy > 1) {
        return { valid: false, error: `skills.${skillName}.accuracy must be between 0 and 1` };
      }

      if (typeof skill.totalAttempts !== 'number' || skill.totalAttempts < 0) {
        return { valid: false, error: `skills.${skillName}.totalAttempts must be a non-negative number` };
      }

      if (typeof skill.correctAttempts !== 'number' || skill.correctAttempts < 0) {
        return { valid: false, error: `skills.${skillName}.correctAttempts must be a non-negative number` };
      }

      // Validate that correctAttempts <= totalAttempts
      if (skill.correctAttempts > skill.totalAttempts) {
        return { valid: false, error: `skills.${skillName}.correctAttempts cannot exceed totalAttempts` };
      }
    }

    return { valid: true };
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(str, maxLength = 100) {
    if (typeof str !== 'string') {
      return '';
    }

    // Remove any HTML tags
    str = str.replace(/<[^>]*>/g, '');

    // Trim whitespace
    str = str.trim();

    // Limit length
    if (str.length > maxLength) {
      str = str.substring(0, maxLength);
    }

    return str;
  }

  /**
   * Sanitize number input
   */
  static sanitizeNumber(num, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const parsed = Number(num);

    if (isNaN(parsed)) {
      return min;
    }

    return Math.max(min, Math.min(max, parsed));
  }

  /**
   * Validate JSON structure
   */
  static isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Validate ISO date string
   */
  static isValidISODate(dateStr) {
    if (typeof dateStr !== 'string') {
      return false;
    }

    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date) && date.toISOString() === dateStr;
  }

  /**
   * Deep clone and sanitize object (remove functions, undefined, etc.)
   */
  static sanitizeObject(obj) {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item)).filter(item => item !== undefined);
    }

    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // Skip functions
        if (typeof value === 'function') {
          continue;
        }

        // Skip undefined
        if (value === undefined) {
          continue;
        }

        // Recursively sanitize objects and arrays
        if (typeof value === 'object') {
          sanitized[key] = this.sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Validate localStorage quota
   */
  static checkStorageQuota(key, value) {
    try {
      const testKey = `__test_${key}`;
      localStorage.setItem(testKey, value);
      localStorage.removeItem(testKey);
      return { valid: true };
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        return { valid: false, error: 'Storage quota exceeded' };
      }
      return { valid: false, error: e.message };
    }
  }
}

export default DataValidator;
