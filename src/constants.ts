import type { AppState, HeaderTarget, Profile } from './types'

export const STORAGE_KEY = 'headerStudioState'
export const STATUS_KEY = 'headerStudioSyncStatus'

export const REQUEST_HEADER_NAMES = [
  'Accept', 'Accept-Encoding', 'Accept-Language', 'Authorization', 'Cache-Control',
  'Content-Type', 'Cookie', 'DNT', 'If-Modified-Since', 'If-None-Match', 'Origin',
  'Pragma', 'Referer', 'Sec-Fetch-Dest', 'Sec-Fetch-Mode', 'Sec-Fetch-Site',
  'User-Agent', 'X-API-Key', 'X-Forwarded-For', 'X-Requested-With', 'X-Request-ID',
]

export const RESPONSE_HEADER_NAMES = [
  'Access-Control-Allow-Credentials', 'Access-Control-Allow-Headers',
  'Access-Control-Allow-Methods', 'Access-Control-Allow-Origin', 'Cache-Control',
  'Content-Disposition', 'Content-Encoding', 'Content-Security-Policy', 'Content-Type',
  'ETag', 'Expires', 'Location', 'Pragma', 'Server', 'Set-Cookie',
  'Strict-Transport-Security', 'Vary', 'X-Content-Type-Options', 'X-Frame-Options',
  'X-Request-ID',
]

export const headerSuggestions = (target: HeaderTarget) =>
  target === 'request' ? REQUEST_HEADER_NAMES : RESPONSE_HEADER_NAMES

const uid = () => crypto.randomUUID()

export function createProfile(name = 'New profile'): Profile {
  return {
    id: uid(),
    name,
    enabled: true,
    matchers: [{ id: uid(), enabled: true, type: 'wildcard', value: '*' }],
    headers: [
      { id: uid(), enabled: true, target: 'request', operation: 'set', name: '', value: '' },
    ],
  }
}

export function createInitialState(): AppState {
  const profile = createProfile('Default')
  return { version: 1, selectedProfileId: profile.id, profiles: [profile] }
}
