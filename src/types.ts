import type { Locale } from './i18n'

export type HeaderTarget = 'request' | 'response'
export type HeaderOperation = 'set' | 'append' | 'remove'
export type MatcherType = 'wildcard' | 'regex'

export interface HeaderEntry {
  id: string
  enabled: boolean
  target: HeaderTarget
  operation: HeaderOperation
  name: string
  value: string
}

export interface UrlMatcher {
  id: string
  enabled: boolean
  type: MatcherType
  value: string
}

export interface Profile {
  id: string
  name: string
  enabled: boolean
  matchers: UrlMatcher[]
  headers: HeaderEntry[]
}

export interface AppState {
  version: 1
  locale?: Locale
  selectedProfileId: string
  profiles: Profile[]
}

export interface SyncStatus {
  ok: boolean
  ruleCount: number
  updatedAt: number
  message?: string
}
