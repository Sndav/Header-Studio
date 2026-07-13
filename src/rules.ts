import type { AppState, HeaderEntry, UrlMatcher } from './types'

const RESOURCE_TYPES = [
  'main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object',
  'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'webtransport',
  'webbundle', 'other',
] as unknown as chrome.declarativeNetRequest.ResourceType[]

function escapeRegex(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
}

export function wildcardToRegex(input: string): string {
  const value = input.trim()
  if (!value || value === '*') return '^https?://'

  if (value.includes('://') || value.includes('/')) {
    return `^${escapeRegex(value).replace(/\*/g, '.*')}$`
  }

  const optionalSubdomain = value.startsWith('*.')
  const host = optionalSubdomain ? value.slice(2) : value
  const hostPattern = escapeRegex(host).replace(/\*/g, '[^/]*')
  const prefix = optionalSubdomain ? '(?:[^/]+\\.)?' : ''
  return `^https?://${prefix}${hostPattern}(?::\\d+)?(?:/|$)`
}

export function matcherToRegex(matcher: UrlMatcher): string {
  return matcher.type === 'regex' ? matcher.value.trim() : wildcardToRegex(matcher.value)
}

function toOperation(entry: HeaderEntry): chrome.declarativeNetRequest.ModifyHeaderInfo {
  const operation = entry.operation as unknown as chrome.declarativeNetRequest.HeaderOperation

  return {
    header: entry.name.trim(),
    operation,
    ...(entry.operation === 'remove' ? {} : { value: entry.value }),
  }
}

export function compileRules(state: AppState): chrome.declarativeNetRequest.Rule[] {
  const rules: chrome.declarativeNetRequest.Rule[] = []
  let id = 1

  state.profiles.forEach((profile, profileIndex) => {
    if (!profile.enabled) return

    const entries = profile.headers.filter((entry) => entry.enabled && entry.name.trim())
    if (!entries.length) return

    const requestHeaders = entries.filter((entry) => entry.target === 'request').map(toOperation)
    const responseHeaders = entries.filter((entry) => entry.target === 'response').map(toOperation)

    profile.matchers.filter((matcher) => matcher.enabled && matcher.value.trim()).forEach((matcher) => {
      rules.push({
        id: id++,
        priority: profileIndex + 1,
        action: {
          type: 'modifyHeaders',
          ...(requestHeaders.length ? { requestHeaders } : {}),
          ...(responseHeaders.length ? { responseHeaders } : {}),
        },
        condition: {
          regexFilter: matcherToRegex(matcher),
          resourceTypes: RESOURCE_TYPES,
        },
      })
    })
  })

  return rules
}
