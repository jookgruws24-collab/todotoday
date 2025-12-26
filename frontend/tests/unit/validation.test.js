import { describe, it, expect } from 'vitest'
import { validateTitle, validateDescription, validateTask } from '../../src/utils/validation'

describe('Validation Utility', () => {
  describe('validateTitle', () => {
    it('returns error for empty title', () => {
      expect(validateTitle('')).toBe('Title is required')
      expect(validateTitle('   ')).toBe('Title is required')
    })

    it('returns error for title exceeding 100 characters', () => {
      const longTitle = 'a'.repeat(101)
      expect(validateTitle(longTitle)).toBe('Title must be 100 characters or less')
    })

    it('returns null for valid title', () => {
      expect(validateTitle('Valid task title')).toBeNull()
      expect(validateTitle('a'.repeat(100))).toBeNull()
    })

    it('returns error for null or undefined', () => {
      expect(validateTitle(null)).toBe('Title is required')
      expect(validateTitle(undefined)).toBe('Title is required')
    })
  })

  describe('validateDescription', () => {
    it('returns error for description exceeding 1000 characters', () => {
      const longDesc = 'a'.repeat(1001)
      expect(validateDescription(longDesc)).toBe('Description must be 1000 characters or less')
    })

    it('returns null for valid description', () => {
      expect(validateDescription('Valid description')).toBeNull()
      expect(validateDescription('a'.repeat(1000))).toBeNull()
    })

    it('returns null for empty description', () => {
      expect(validateDescription('')).toBeNull()
      expect(validateDescription(null)).toBeNull()
      expect(validateDescription(undefined)).toBeNull()
    })
  })

  describe('validateTask', () => {
    it('returns errors object with title error for invalid title', () => {
      const errors = validateTask({ title: '', description: 'test' })
      expect(errors.title).toBe('Title is required')
    })

    it('returns errors object with description error for invalid description', () => {
      const errors = validateTask({ title: 'test', description: 'a'.repeat(1001) })
      expect(errors.description).toBe('Description must be 1000 characters or less')
    })

    it('returns limit error when task count is 100 or more', () => {
      const errors = validateTask({ title: 'test', description: 'test' }, 100)
      expect(errors.limit).toBe('Maximum 100 tasks per user. Delete tasks to add more.')
    })

    it('returns empty object for valid task', () => {
      const errors = validateTask({ title: 'Valid title', description: 'Valid description' }, 50)
      expect(Object.keys(errors).length).toBe(0)
    })

    it('returns multiple errors when multiple fields are invalid', () => {
      const errors = validateTask({ title: '', description: 'a'.repeat(1001) }, 100)
      expect(errors.title).toBeDefined()
      expect(errors.description).toBeDefined()
      expect(errors.limit).toBeDefined()
    })
  })
})
