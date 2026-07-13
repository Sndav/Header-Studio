import { STATUS_KEY, STORAGE_KEY, createInitialState } from './constants'
import { compileRules } from './rules'
import type { AppState, SyncStatus } from './types'

async function setStatus(status: SyncStatus): Promise<void> {
  await chrome.storage.local.set({ [STATUS_KEY]: status })
  await chrome.action.setBadgeText({ text: status.ok && status.ruleCount ? String(status.ruleCount) : '' })
  await chrome.action.setBadgeBackgroundColor({ color: status.ok ? '#2e7d4f' : '#b42318' })
}

async function syncRules(state?: AppState): Promise<void> {
  try {
    const currentState = state ?? ((await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY] as AppState | undefined)
    const rules = compileRules(currentState ?? createInitialState())

    for (const rule of rules) {
      const regex = rule.condition.regexFilter
      if (!regex) continue
      const support = await chrome.declarativeNetRequest.isRegexSupported({ regex })
      if (!support.isSupported) {
        throw new Error(`正则不受 Chrome 支持：${support.reason ?? regex}`)
      }
    }

    const existing = await chrome.declarativeNetRequest.getDynamicRules()
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existing.map((rule) => rule.id),
      addRules: rules,
    })
    await setStatus({ ok: true, ruleCount: rules.length, updatedAt: Date.now() })
  } catch (error) {
    await setStatus({
      ok: false,
      ruleCount: 0,
      updatedAt: Date.now(),
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

chrome.runtime.onInstalled.addListener(() => { void syncRules() })
chrome.runtime.onStartup.addListener(() => { void syncRules() })
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) {
    void syncRules(changes[STORAGE_KEY].newValue as AppState)
  }
})
