import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle, Braces, Check, ChevronDown, CircleHelp, Copy, Globe2, Menu,
  MoreHorizontal, Pause, Play, Plus, Search, Settings2, Trash2, X,
} from 'lucide-react'
import { createInitialState, createProfile, headerSuggestions, STATUS_KEY } from './constants'
import { loadState, loadSyncStatus, saveState } from './storage'
import type { AppState, HeaderEntry, HeaderTarget, Profile, SyncStatus, UrlMatcher } from './types'

const uid = () => crypto.randomUUID()

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      className="switch"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      data-checked={checked}
      onClick={(event) => { event.stopPropagation(); onChange(!checked) }}
    >
      <span className="switch-thumb" />
    </button>
  )
}

function ProfileItem({ profile, selected, onSelect, onToggle }: {
  profile: Profile
  selected: boolean
  onSelect: () => void
  onToggle: (enabled: boolean) => void
}) {
  const ruleCount = profile.headers.filter((header) => header.enabled && header.name.trim()).length
  return (
    <div className="profile-item" data-selected={selected}>
      <button type="button" className="profile-select" onClick={onSelect} aria-current={selected ? 'true' : undefined}>
        <span className="profile-state" data-active={profile.enabled} aria-hidden="true" />
        <span className="profile-copy">
          <strong>{profile.name || 'Untitled profile'}</strong>
          <span>{ruleCount} headers · {profile.matchers.length} matches</span>
        </span>
      </button>
      <Switch checked={profile.enabled} onChange={onToggle} label={`${profile.name} ${profile.enabled ? '已启用' : '已禁用'}`} />
    </div>
  )
}

function HeaderRow({ entry, onChange, onRemove }: {
  entry: HeaderEntry
  onChange: (patch: Partial<HeaderEntry>) => void
  onRemove: () => void
}) {
  const suggestions = headerSuggestions(entry.target)
  return (
    <div className="header-row" data-disabled={!entry.enabled}>
      <input
        className="row-checkbox"
        type="checkbox"
        checked={entry.enabled}
        onChange={(event) => onChange({ enabled: event.target.checked })}
        aria-label="启用这条 Header 规则"
      />
      <select
        className="operation-select"
        value={entry.operation}
        onChange={(event) => onChange({ operation: event.target.value as HeaderEntry['operation'] })}
        aria-label="Header 操作"
      >
        <option value="set">Set</option>
        <option value="append">Append</option>
        <option value="remove">Remove</option>
      </select>
      <input
        className="header-name"
        value={entry.name}
        onChange={(event) => onChange({ name: event.target.value })}
        placeholder={entry.target === 'request' ? 'Authorization' : 'Access-Control-Allow-Origin'}
        list={`${entry.target}-header-names`}
        aria-label="Header 名称"
        spellCheck={false}
      />
      <input
        className="header-value"
        value={entry.value}
        onChange={(event) => onChange({ value: event.target.value })}
        placeholder={entry.operation === 'remove' ? 'Remove 不需要值' : 'Header value'}
        disabled={entry.operation === 'remove'}
        aria-label="Header 值"
        spellCheck={false}
      />
      <button type="button" className="icon-button danger-hover" onClick={onRemove} aria-label="删除 Header 规则">
        <Trash2 size={15} />
      </button>
      <datalist id={`${entry.target}-header-names`}>
        {suggestions.map((name) => <option key={name} value={name} />)}
      </datalist>
    </div>
  )
}

function MatcherRow({ matcher, onChange, onRemove }: {
  matcher: UrlMatcher
  onChange: (patch: Partial<UrlMatcher>) => void
  onRemove: () => void
}) {
  return (
    <div className="matcher-row" data-disabled={!matcher.enabled}>
      <input
        className="row-checkbox"
        type="checkbox"
        checked={matcher.enabled}
        onChange={(event) => onChange({ enabled: event.target.checked })}
        aria-label="启用这条匹配规则"
      />
      <select
        value={matcher.type}
        onChange={(event) => onChange({ type: event.target.value as UrlMatcher['type'] })}
        aria-label="匹配类型"
      >
        <option value="wildcard">Host / wildcard</option>
        <option value="regex">RE2 regex</option>
      </select>
      <div className="matcher-input-wrap">
        {matcher.type === 'regex' ? <Braces size={14} /> : <Globe2 size={14} />}
        <input
          value={matcher.value}
          onChange={(event) => onChange({ value: event.target.value })}
          placeholder={matcher.type === 'regex' ? '^https://api\\.example\\.com/' : '*.example.com'}
          aria-label="URL 或 Host 匹配表达式"
          spellCheck={false}
        />
      </div>
      <button type="button" className="icon-button danger-hover" onClick={onRemove} aria-label="删除匹配规则">
        <Trash2 size={15} />
      </button>
    </div>
  )
}

export function App() {
  const [state, setState] = useState<AppState>(() => createInitialState())
  const [loaded, setLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<HeaderTarget>('request')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SyncStatus | null>(null)
  const [showMatchers, setShowMatchers] = useState(true)

  useEffect(() => {
    void Promise.all([loadState(), loadSyncStatus()]).then(([stored, syncStatus]) => {
      setState(stored)
      setStatus(syncStatus)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loaded) return
    const timer = window.setTimeout(() => { void saveState(state) }, 180)
    return () => window.clearTimeout(timer)
  }, [loaded, state])

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && changes[STATUS_KEY]?.newValue) {
        setStatus(changes[STATUS_KEY].newValue as SyncStatus)
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  const selectedProfile = useMemo(
    () => state.profiles.find((profile) => profile.id === state.selectedProfileId) ?? state.profiles[0],
    [state.profiles, state.selectedProfileId],
  )

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return query ? state.profiles.filter((profile) => profile.name.toLocaleLowerCase().includes(query)) : state.profiles
  }, [search, state.profiles])

  const updateProfile = useCallback((profileId: string, updater: (profile: Profile) => Profile) => {
    setState((current) => ({
      ...current,
      profiles: current.profiles.map((profile) => profile.id === profileId ? updater(profile) : profile),
    }))
  }, [])

  const patchSelected = (patch: Partial<Profile>) => {
    if (!selectedProfile) return
    updateProfile(selectedProfile.id, (profile) => ({ ...profile, ...patch }))
  }

  const addProfile = () => {
    const profile = createProfile(`Profile ${state.profiles.length + 1}`)
    setState((current) => ({ ...current, selectedProfileId: profile.id, profiles: [...current.profiles, profile] }))
  }

  const duplicateProfile = () => {
    if (!selectedProfile) return
    const clone: Profile = {
      ...structuredClone(selectedProfile),
      id: uid(),
      name: `${selectedProfile.name} copy`,
      matchers: selectedProfile.matchers.map((matcher) => ({ ...matcher, id: uid() })),
      headers: selectedProfile.headers.map((header) => ({ ...header, id: uid() })),
    }
    setState((current) => ({ ...current, selectedProfileId: clone.id, profiles: [...current.profiles, clone] }))
  }

  const deleteProfile = () => {
    if (!selectedProfile || state.profiles.length === 1) return
    if (!window.confirm(`删除 “${selectedProfile.name}”？此操作不可撤销。`)) return
    const profiles = state.profiles.filter((profile) => profile.id !== selectedProfile.id)
    setState((current) => ({ ...current, selectedProfileId: profiles[0].id, profiles }))
  }

  const addHeader = () => {
    if (!selectedProfile) return
    patchSelected({
      headers: [...selectedProfile.headers, {
        id: uid(), enabled: true, target: activeTab, operation: 'set', name: '', value: '',
      }],
    })
  }

  const updateHeader = (id: string, patch: Partial<HeaderEntry>) => {
    if (!selectedProfile) return
    patchSelected({ headers: selectedProfile.headers.map((header) => header.id === id ? { ...header, ...patch } : header) })
  }

  const removeHeader = (id: string) => {
    if (!selectedProfile) return
    patchSelected({ headers: selectedProfile.headers.filter((header) => header.id !== id) })
  }

  const addMatcher = () => {
    if (!selectedProfile) return
    patchSelected({ matchers: [...selectedProfile.matchers, { id: uid(), enabled: true, type: 'wildcard', value: '' }] })
  }

  const updateMatcher = (id: string, patch: Partial<UrlMatcher>) => {
    if (!selectedProfile) return
    patchSelected({ matchers: selectedProfile.matchers.map((matcher) => matcher.id === id ? { ...matcher, ...patch } : matcher) })
  }

  const removeMatcher = (id: string) => {
    if (!selectedProfile) return
    patchSelected({ matchers: selectedProfile.matchers.filter((matcher) => matcher.id !== id) })
  }

  const visibleHeaders = selectedProfile?.headers.filter((header) => header.target === activeTab) ?? []
  const enabledProfiles = state.profiles.filter((profile) => profile.enabled).length

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true"><Settings2 size={17} /></div>
        <div className="brand-copy">
          <strong>Header Studio</strong>
          <span>{enabledProfiles} profile{enabledProfiles === 1 ? '' : 's'} active</span>
        </div>
        <div className="sync-status" data-error={status ? !status.ok : false} title={status?.message}>
          {status?.ok === false ? <AlertCircle size={14} /> : <Check size={14} />}
          <span>{status?.ok === false ? '规则同步失败' : `${status?.ruleCount ?? 0} 条规则已同步`}</span>
        </div>
        <button type="button" className="icon-button" aria-label="帮助" title="数据仅保存在 chrome.storage.local"><CircleHelp size={16} /></button>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Profiles">
          <div className="sidebar-tools">
            <div className="search-field">
              <Search size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索 Profile" aria-label="搜索 Profile" />
              {search ? <button type="button" onClick={() => setSearch('')} aria-label="清除搜索"><X size={13} /></button> : null}
            </div>
            <button type="button" className="add-profile-button" onClick={addProfile} aria-label="新增 Profile"><Plus size={16} /></button>
          </div>
          <div className="profile-list">
            {filteredProfiles.map((profile) => (
              <ProfileItem
                key={profile.id}
                profile={profile}
                selected={profile.id === selectedProfile?.id}
                onSelect={() => setState((current) => ({ ...current, selectedProfileId: profile.id }))}
                onToggle={(enabled) => updateProfile(profile.id, (current) => ({ ...current, enabled }))}
              />
            ))}
            {!filteredProfiles.length ? <div className="no-results">没有匹配的 Profile</div> : null}
          </div>
          <div className="privacy-note"><span className="privacy-dot" /> 本地存储 · 无遥测</div>
        </aside>

        {selectedProfile ? (
          <section className="editor" aria-label="Profile 编辑器">
            <div className="profile-header">
              <div className="profile-title-block">
                <input
                  className="profile-name-input"
                  value={selectedProfile.name}
                  onChange={(event) => patchSelected({ name: event.target.value })}
                  aria-label="Profile 名称"
                />
                <div className="profile-subline">
                  {selectedProfile.enabled ? <Play size={12} /> : <Pause size={12} />}
                  <span>{selectedProfile.enabled ? '已启用，将按下方 URL 规则生效' : '已暂停，不会修改任何请求'}</span>
                </div>
              </div>
              <div className="profile-actions">
                <button type="button" className="secondary-button" onClick={duplicateProfile}><Copy size={14} />复制</button>
                <button type="button" className="icon-button" onClick={deleteProfile} disabled={state.profiles.length === 1} aria-label="删除 Profile"><Trash2 size={15} /></button>
                <Switch checked={selectedProfile.enabled} onChange={(enabled) => patchSelected({ enabled })} label="启用 Profile" />
              </div>
            </div>

            <div className="matcher-section">
              <button type="button" className="section-disclosure" onClick={() => setShowMatchers((value) => !value)} aria-expanded={showMatchers}>
                <ChevronDown size={15} data-open={showMatchers} />
                <Globe2 size={15} />
                <strong>URL / Host 匹配</strong>
                <span>{selectedProfile.matchers.filter((matcher) => matcher.enabled).length} 条</span>
              </button>
              {showMatchers ? (
                <div className="matcher-content">
                  {selectedProfile.matchers.map((matcher) => (
                    <MatcherRow
                      key={matcher.id}
                      matcher={matcher}
                      onChange={(patch) => updateMatcher(matcher.id, patch)}
                      onRemove={() => removeMatcher(matcher.id)}
                    />
                  ))}
                  <div className="matcher-footer">
                    <button type="button" className="text-button" onClick={addMatcher}><Plus size={14} />添加匹配规则</button>
                    <span>多条规则为“任一匹配”；正则使用 Chrome RE2 语法</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="header-tabs" role="tablist" aria-label="Header 类型">
              {(['request', 'response'] as HeaderTarget[]).map((target) => {
                const count = selectedProfile.headers.filter((header) => header.target === target).length
                return (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === target}
                    data-selected={activeTab === target}
                    key={target}
                    onClick={() => setActiveTab(target)}
                  >
                    {target === 'request' ? 'Request headers' : 'Response headers'}
                    <span>{count}</span>
                  </button>
                )
              })}
            </div>

            <div className="headers-panel" role="tabpanel">
              <div className="header-columns" aria-hidden="true">
                <span />
                <span>操作</span>
                <span>Header 名称</span>
                <span>值</span>
                <span />
              </div>
              <div className="header-list">
                {visibleHeaders.map((entry) => (
                  <HeaderRow
                    key={entry.id}
                    entry={entry}
                    onChange={(patch) => updateHeader(entry.id, patch)}
                    onRemove={() => removeHeader(entry.id)}
                  />
                ))}
                {!visibleHeaders.length ? (
                  <div className="empty-state">
                    <Menu size={20} />
                    <strong>还没有 {activeTab} header</strong>
                    <span>添加一行后，输入 Header 名称会显示常用建议。</span>
                  </div>
                ) : null}
              </div>
              <div className="panel-footer">
                <button type="button" className="primary-button" onClick={addHeader}><Plus size={15} />添加 Header</button>
                <span>更改将自动保存并同步到 Chrome</span>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
