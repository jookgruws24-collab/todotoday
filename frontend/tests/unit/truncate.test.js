import { describe, it, expect } from 'vitest'
import { truncate } from '../../src/utils/truncate'

describe('Truncate Utility', () => {
  it('returns original text if shorter than max length', () => {
    expect(truncate('Short text', 100)).toBe('Short text')
  })

  it('truncates text at max length and adds ellipsis', () => {
    const text = 'a'.repeat(150)
    const result = truncate(text, 100)
    expect(result).toBe('a'.repeat(100) + '...')
    expect(result.length).toBe(103)
  })

  it('returns empty string for null or undefined', () => {
    expect(truncate(null)).toBe('')
    expect(truncate(undefined)).toBe('')
    expect(truncate('')).toBe('')
  })

  it('uses default max length of 100', () => {
    const text = 'a'.repeat(101)
    const result = truncate(text)
    expect(result).toBe('a'.repeat(100) + '...')
  })

  it('returns original text if exactly at max length', () => {
    const text = 'a'.repeat(100)
    expect(truncate(text, 100)).toBe(text)
  })

  it('works with custom max lengths', () => {
    const text = 'This is a longer text that needs truncation'
    expect(truncate(text, 10)).toBe('This is a ...')
    expect(truncate(text, 20)).toBe('This is a longer tex...')
  })
})
