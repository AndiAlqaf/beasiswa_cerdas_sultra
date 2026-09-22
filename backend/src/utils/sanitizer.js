/**
 * Deep Input Sanitizer
 * 
 * Recursively sanitizes all string values in objects/arrays.
 * Protects against XSS, prototype pollution, and injection attacks.
 */

const { DANGEROUS_PATTERNS } = require('../config/security');

/**
 * Strip HTML tags from a string
 * @param {string} str
 * @returns {string}
 */
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML entities
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
  };
  return str.replace(/[&<>"'/`]/g, (char) => map[char]);
}

/**
 * Check if a string contains dangerous patterns
 * @param {string} str
 * @returns {boolean}
 */
function containsDangerousContent(str) {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(str));
}

/**
 * Sanitize a single string value
 * @param {string} str
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  // Trim whitespace
  let sanitized = str.trim();
  
  // Strip null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Strip HTML tags
  sanitized = stripHtml(sanitized);
  
  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
}

/**
 * Deep sanitize an object/array recursively
 * Prevents prototype pollution by rejecting dangerous keys
 * @param {*} input
 * @param {number} depth - Max recursion depth (prevent DoS)
 * @returns {*}
 */
function deepSanitize(input, depth = 0) {
  // Prevent deep recursion DoS
  if (depth > 10) return undefined;
  
  if (typeof input === 'string') {
    return sanitizeString(input);
  }
  
  if (Array.isArray(input)) {
    return input.slice(0, 100).map(item => deepSanitize(item, depth + 1)); // Max 100 items
  }
  
  if (input !== null && typeof input === 'object') {
    const sanitized = {};
    const keys = Object.keys(input).slice(0, 50); // Max 50 keys
    
    for (const key of keys) {
      // Reject prototype pollution keys
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      // Reject keys with dangerous characters
      if (/[.$]/.test(key)) {
        continue;
      }
      
      sanitized[key] = deepSanitize(input[key], depth + 1);
    }
    
    return sanitized;
  }
  
  return input;
}

/**
 * Sanitize filename — remove path traversal and special chars
 * @param {string} filename
 * @returns {string}
 */
function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return 'unnamed';
  
  return filename
    .replace(/[/\\:*?"<>|]/g, '') // Remove path & special chars
    .replace(/\.\./g, '')          // Remove path traversal
    .replace(/^\.+/, '')           // Remove leading dots
    .substring(0, 255);            // Max length
}

module.exports = {
  stripHtml,
  escapeHtml,
  containsDangerousContent,
  sanitizeString,
  deepSanitize,
  sanitizeFilename,
};
