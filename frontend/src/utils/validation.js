/**
 * Validation utility for task data
 */

/**
 * Validate task title
 * @param {string} title - Title to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateTitle(title) {
  if (!title || title.trim().length === 0) {
    return 'Title is required'
  }
  if (title.length > 100) {
    return 'Title must be 100 characters or less'
  }
  return null
}

/**
 * Validate task description
 * @param {string} description - Description to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateDescription(description) {
  if (description && description.length > 1000) {
    return 'Description must be 1000 characters or less'
  }
  return null
}

/**
 * Validate task data object
 * @param {Object} task - Task object to validate
 * @param {number} currentTaskCount - Current number of tasks for the user
 * @returns {Object} Object with field names as keys and error messages as values
 */
export function validateTask(task, currentTaskCount = 0) {
  const errors = {}
  
  const titleError = validateTitle(task.title)
  if (titleError) {
    errors.title = titleError
  }
  
  const descriptionError = validateDescription(task.description)
  if (descriptionError) {
    errors.description = descriptionError
  }
  
  if (currentTaskCount >= 100) {
    errors.limit = 'Maximum 100 tasks per user. Delete tasks to add more.'
  }
  
  return errors
}
