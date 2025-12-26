/**
 * Truncate text with ellipsis if it exceeds the maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation (default: 100)
 * @returns {string} Truncated text with ellipsis if necessary
 */
export function truncate(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
