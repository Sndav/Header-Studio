import { describe, expect, it } from 'vitest'
import { compileRules, wildcardToRegex } from './rules'
import type { AppState } from './types'

describe('wildcardToRegex', () => {
  it('matches all http and https URLs', () => {
    const regex = new RegExp(wildcardToRegex('*'))
    expect(regex.test('https://example.com/path')).toBe(true)
    expect(regex.test('chrome://extensions')).toBe(false)
  })

  it('matches a root host and its subdomains', () => {
    const regex = new RegExp(wildcardToRegex('*.example.com'))
    expect(regex.test('https://example.com/')).toBe(true)
    expect(regex.test('https://api.example.com/v1')).toBe(true)
    expect(regex.test('https://notexample.com/')).toBe(false)
  })

  it('matches full URL wildcards', () => {
    const regex = new RegExp(wildcardToRegex('https://example.com/api/*'))
    expect(regex.test('https://example.com/api/users')).toBe(true)
    expect(regex.test('http://example.com/api/users')).toBe(false)
  })
})

describe('compileRules', () => {
  it('combines request and response operations for every active matcher', () => {
    const state: AppState = {
      version: 1,
      selectedProfileId: 'p1',
      profiles: [{
        id: 'p1',
        name: 'API',
        enabled: true,
        matchers: [
          { id: 'm1', enabled: true, type: 'wildcard', value: '*.example.com' },
          { id: 'm2', enabled: true, type: 'regex', value: '^https://internal\\.' },
        ],
        headers: [
          { id: 'h1', enabled: true, target: 'request', operation: 'set', name: 'X-Test', value: 'yes' },
          { id: 'h2', enabled: true, target: 'response', operation: 'remove', name: 'X-Frame-Options', value: '' },
        ],
      }],
    }

    const rules = compileRules(state)
    expect(rules).toHaveLength(2)
    expect(rules[0].action.requestHeaders?.[0]).toMatchObject({ header: 'X-Test', operation: 'set', value: 'yes' })
    expect(rules[0].action.responseHeaders?.[0]).toMatchObject({ header: 'X-Frame-Options', operation: 'remove' })
  })

  it('skips disabled profiles and empty header names', () => {
    const state: AppState = {
      version: 1,
      selectedProfileId: 'p1',
      profiles: [{
        id: 'p1', name: 'Off', enabled: false,
        matchers: [{ id: 'm1', enabled: true, type: 'wildcard', value: '*' }],
        headers: [{ id: 'h1', enabled: true, target: 'request', operation: 'set', name: '', value: '' }],
      }],
    }
    expect(compileRules(state)).toEqual([])
  })
})
