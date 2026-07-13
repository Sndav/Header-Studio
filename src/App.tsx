import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle, Braces, Check, ChevronDown, CircleHelp, Copy, Globe2, Menu,
  Languages, Pause, Play, Plus, Search, Settings2, Trash2, X,
} from 'lucide-react'
import { createInitialState, createProfile, headerSuggestions, STATUS_KEY } from './constants'
import { createTranslator } from './i18n'
import { loadState, loadSyncStatus, saveState } from './storage'
import type { Locale, Translate } from './i18n'
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

function ProfileItem({ profile, selected, onSelect, onToggle, t }: {
  profile: Profile
  selected: boolean
  onSelect: () => void
  onToggle: (enabled: boolean) => void
  t: Translate
}) {
  const ruleCount = profile.headers.filter((header) => header.enabled && header.name.trim()).length
  return (
    <div className="profile-item" data-selected={selected}>
      <button type="button" className="profile-select" onClick={onSelect} aria-current={selected ? 'true' : undefined}>
        <span className="profile-state" data-active={profile.enabled} aria-hidden="true" />
        <span className="profile-copy">
          <strong>{profile.name || t('untitledProfile')}</strong>
          <span>{t('profileSummary', { headers: ruleCount, matchers: profile.matchers.length })}</span>
        </span>
      </button>
      <Switch
        checked={profile.enabled}
        onChange={onToggle}
        label={t(profile.enabled ? 'profileEnabled' : 'profileDisabled', { name: profile.name || t('untitledProfile') })}
      />
    </div>
  )
}

function HeaderRow({ entry, onChange, onRemove, t }: {
  entry: HeaderEntry
  onChange: (patch: Partial<HeaderEntry>) => void
  onRemove: () => void
  t: Translate
}) {
  const suggestions = headerSuggestions(entry.target)
  return (
    <div className="header-row" data-disabled={!entry.enabled}>
      <input
        className="row-checkbox"
        type="checkbox"
        checked={entry.enabled}
        onChange={(event) => onChange({ enabled: event.target.checked })}
        aria-label={t('enableHeader')}
      />
      <select
        className="operation-select"
        value={entry.operation}
        onChange={(event) => onChange({ operation: event.target.value as HeaderEntry['operation'] })}
        aria-label={t('headerOperation')}
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
        aria-label={t('headerName')}
        spellCheck={false}
      />
      <input
        className="header-value"
        value={entry.value}
        onChange={(event) => onChange({ value: event.target.value })}
        placeholder={entry.operation === 'remove' ? t('removeNoValue') : t('headerValue')}
        disabled={entry.operation === 'remove'}
        aria-label={t('headerValue')}
        spellCheck={false}
      />
      <button type="button" className="icon-button danger-hover" onClick={onRemove} aria-label={t('deleteHeader')}>
        <Trash2 size={15} />
      </button>
      <datalist id={`${entry.target}-header-names`}>
        {suggestions.map((name) => <option key={name} value={name} />)}
      </datalist>
    </div>
  )
}

function MatcherRow({ matcher, onChange, onRemove, t }: {
  matcher: UrlMatcher
  onChange: (patch: Partial<UrlMatcher>) => void
  onRemove: () => void
  t: Translate
}) {
  return (
    <div className="matcher-row" data-disabled={!matcher.enabled}>
      <input
        className="row-checkbox"
        type="checkbox"
        checked={matcher.enabled}
        onChange={(event) => onChange({ enabled: event.target.checked })}
        aria-label={t('enableMatcher')}
      />
      <select
        value={matcher.type}
        onChange={(event) => onChange({ type: event.target.value as UrlMatcher['type'] })}
        aria-label={t('matchType')}
      >
        <option value="wildcard">{t('hostWildcard')}</option>
        <option value="regex">{t('regex')}</option>
      </select>
      <div className="matcher-input-wrap">
        {matcher.type === 'regex' ? <Braces size={14} /> : <Globe2 size={14} />}
        <input
          value={matcher.value}
          onChange={(event) => onChange({ value: event.target.value })}
          placeholder={matcher.type === 'regex' ? '^https://api\\.example\\.com/' : '*.example.com'}
          aria-label={t('matchExpression')}
          spellCheck={false}
        />
      </div>
      <button type="button" className="icon-button danger-hover" onClick={onRemove} aria-label={t('deleteMatcher')}>
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
  const locale: Locale = state.locale ?? 'zh-CN'
  const t = useMemo(() => createTranslator(locale), [locale])

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
    const profile = createProfile(t('newProfile', { count: state.profiles.length + 1 }))
    setState((current) => ({ ...current, selectedProfileId: profile.id, profiles: [...current.profiles, profile] }))
  }

  const duplicateProfile = () => {
    if (!selectedProfile) return
    const clone: Profile = {
      ...structuredClone(selectedProfile),
      id: uid(),
      name: `${selectedProfile.name} ${t('copySuffix')}`,
      matchers: selectedProfile.matchers.map((matcher) => ({ ...matcher, id: uid() })),
      headers: selectedProfile.headers.map((header) => ({ ...header, id: uid() })),
    }
    setState((current) => ({ ...current, selectedProfileId: clone.id, profiles: [...current.profiles, clone] }))
  }

  const deleteProfile = () => {
    if (!selectedProfile || state.profiles.length === 1) return
    if (!window.confirm(t('confirmDelete', { name: selectedProfile.name }))) return
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
  const toggleLocale = () => {
    setState((current) => ({ ...current, locale: (current.locale ?? 'zh-CN') === 'zh-CN' ? 'en' : 'zh-CN' }))
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true"><Settings2 size={17} /></div>
        <div className="brand-copy">
          <strong>Header Studio</strong>
          <span>{t('profilesActive', { count: enabledProfiles })}</span>
        </div>
        <div className="sync-status" data-error={status ? !status.ok : false} title={status?.message}>
          {status?.ok === false ? <AlertCircle size={14} /> : <Check size={14} />}
          <span>{status?.ok === false ? t('syncFailed') : t('rulesSynced', { count: status?.ruleCount ?? 0 })}</span>
        </div>
        <button type="button" className="language-button" onClick={toggleLocale} aria-label={t('switchToEnglish')} title={t('switchToEnglish')}>
          <Languages size={14} />
          <span>{locale === 'zh-CN' ? 'EN' : '中文'}</span>
        </button>
        <button type="button" className="icon-button" aria-label={t('help')} title={t('privacyTitle')}><CircleHelp size={16} /></button>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Profiles">
          <div className="sidebar-tools">
            <div className="search-field">
              <Search size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchProfile')} aria-label={t('searchProfile')} />
              {search ? <button type="button" onClick={() => setSearch('')} aria-label={t('clearSearch')}><X size={13} /></button> : null}
            </div>
            <button type="button" className="add-profile-button" onClick={addProfile} aria-label={t('addProfile')}><Plus size={16} /></button>
          </div>
          <div className="profile-list">
            {filteredProfiles.map((profile) => (
              <ProfileItem
                key={profile.id}
                profile={profile}
                selected={profile.id === selectedProfile?.id}
                onSelect={() => setState((current) => ({ ...current, selectedProfileId: profile.id }))}
                onToggle={(enabled) => updateProfile(profile.id, (current) => ({ ...current, enabled }))}
                t={t}
              />
            ))}
            {!filteredProfiles.length ? <div className="no-results">{t('noProfiles')}</div> : null}
          </div>
          <div className="privacy-note"><span className="privacy-dot" /> {t('localNoTelemetry')}</div>
        </aside>

        {selectedProfile ? (
          <section className="editor" aria-label={t('profileEditor')}>
            <div className="profile-header">
              <div className="profile-title-block">
                <input
                  className="profile-name-input"
                  value={selectedProfile.name}
                  onChange={(event) => patchSelected({ name: event.target.value })}
                  aria-label={t('profileName')}
                />
                <div className="profile-subline">
                  {selectedProfile.enabled ? <Play size={12} /> : <Pause size={12} />}
                  <span>{t(selectedProfile.enabled ? 'enabledDescription' : 'pausedDescription')}</span>
                </div>
              </div>
              <div className="profile-actions">
                <button type="button" className="secondary-button" onClick={duplicateProfile}><Copy size={14} />{t('copy')}</button>
                <button type="button" className="icon-button" onClick={deleteProfile} disabled={state.profiles.length === 1} aria-label={t('deleteProfile')}><Trash2 size={15} /></button>
                <Switch checked={selectedProfile.enabled} onChange={(enabled) => patchSelected({ enabled })} label={t('enableProfile')} />
              </div>
            </div>

            <div className="matcher-section">
              <button type="button" className="section-disclosure" onClick={() => setShowMatchers((value) => !value)} aria-expanded={showMatchers}>
                <ChevronDown size={15} data-open={showMatchers} />
                <Globe2 size={15} />
                <strong>{t('urlHostMatch')}</strong>
                <span>{t('ruleCount', { count: selectedProfile.matchers.filter((matcher) => matcher.enabled).length })}</span>
              </button>
              {showMatchers ? (
                <div className="matcher-content">
                  {selectedProfile.matchers.map((matcher) => (
                    <MatcherRow
                      key={matcher.id}
                      matcher={matcher}
                      onChange={(patch) => updateMatcher(matcher.id, patch)}
                      onRemove={() => removeMatcher(matcher.id)}
                      t={t}
                    />
                  ))}
                  <div className="matcher-footer">
                    <button type="button" className="text-button" onClick={addMatcher}><Plus size={14} />{t('addMatcher')}</button>
                    <span>{t('matcherHelp')}</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="header-tabs" role="tablist" aria-label={t('headerType')}>
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
                    {t(target === 'request' ? 'requestHeaders' : 'responseHeaders')}
                    <span>{count}</span>
                  </button>
                )
              })}
            </div>

            <div className="headers-panel" role="tabpanel">
              <div className="header-columns" aria-hidden="true">
                <span />
                <span>{t('operation')}</span>
                <span>{t('headerName')}</span>
                <span>{t('value')}</span>
                <span />
              </div>
              <div className="header-list">
                {visibleHeaders.map((entry) => (
                  <HeaderRow
                    key={entry.id}
                    entry={entry}
                    onChange={(patch) => updateHeader(entry.id, patch)}
                    onRemove={() => removeHeader(entry.id)}
                    t={t}
                  />
                ))}
                {!visibleHeaders.length ? (
                  <div className="empty-state">
                    <Menu size={20} />
                    <strong>{t('emptyHeaders', { target: activeTab })}</strong>
                    <span>{t('emptyHeadersHelp')}</span>
                  </div>
                ) : null}
              </div>
              <div className="panel-footer">
                <button type="button" className="primary-button" onClick={addHeader}><Plus size={15} />{t('addHeader')}</button>
                <span>{t('autoSave')}</span>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
