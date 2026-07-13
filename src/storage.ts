import { STATUS_KEY, STORAGE_KEY, createInitialState } from './constants'
import type { AppState, SyncStatus } from './types'

const hasChromeStorage = () => typeof chrome !== 'undefined' && Boolean(chrome.storage?.local)

export async function loadState(): Promise<AppState> {
  if (!hasChromeStorage()) {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as AppState : createInitialState()
  }
  const result = await chrome.storage.local.get(STORAGE_KEY)
  return (result[STORAGE_KEY] as AppState | undefined) ?? createInitialState()
}

export async function saveState(state: AppState): Promise<void> {
  if (!hasChromeStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return
  }
  await chrome.storage.local.set({ [STORAGE_KEY]: state })
}

export async function loadSyncStatus(): Promise<SyncStatus | null> {
  if (!hasChromeStorage()) return null
  const result = await chrome.storage.local.get(STATUS_KEY)
  return (result[STATUS_KEY] as SyncStatus | undefined) ?? null
}
