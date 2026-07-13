import { describe, expect, it } from 'vitest'
import { createTranslator } from './i18n'

describe('i18n', () => {
  it('uses Chinese messages by default in the initial state', async () => {
    const { createInitialState } = await import('./constants')
    expect(createInitialState().locale).toBe('zh-CN')
  })

  it('translates and interpolates both supported locales', () => {
    expect(createTranslator('zh-CN')('rulesSynced', { count: 3 })).toBe('3 条规则已同步')
    expect(createTranslator('en')('rulesSynced', { count: 3 })).toBe('3 rule(s) synced')
  })
})
