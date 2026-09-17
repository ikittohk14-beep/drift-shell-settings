import React, { useState, useEffect, useMemo, useRef } from 'react';
import Toggle from '../Toggle';
import { useI18n } from '../../i18n';
import type { WindowRule, ActiveWindow } from '../../../../preload/types';

interface WindowsViewProps {
  rules: WindowRule[];
  onChange: (newRules: WindowRule[]) => void;
}

export const WindowsView: React.FC<WindowsViewProps> = ({ rules, onChange }) => {
  const { t, language } = useI18n();

  const [activeWindows, setActiveWindows] = useState<ActiveWindow[]>([]);
  const [activeSearch, setActiveSearch] = useState('');
  const [rulesSearch, setRulesSearch] = useState('');

  // Accordion state: which rule index is currently expanded (null = all collapsed)
  const [expandedRuleIndex, setExpandedRuleIndex] = useState<number | null>(null);

  // References to rule card elements for smooth scrolling
  const ruleRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Collapsible geometry states per rule
  const [showAdvancedFor, setShowAdvancedFor] = useState<{ [key: number]: boolean }>({});

  // Fetch active Wayland windows
  const fetchActive = async () => {
    try {
      if (window.driftAPI?.getActiveWindows) {
        const wins = await window.driftAPI.getActiveWindows();
        setActiveWindows(
          wins.filter((w) => (w.app_id && w.app_id.trim()) || (w.title && w.title.trim()))
        );
      }
    } catch (err) {
      console.error('[WindowsView] Error fetching active windows:', err);
    }
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 2500);
    return () => clearInterval(interval);
  }, []);

  // Expand and smooth scroll directly to a rule
  const expandAndScrollToRule = (index: number) => {
    setExpandedRuleIndex(index);
    setTimeout(() => {
      ruleRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  // Smart matcher to find configured rule for a given active window
  const getMatchingRule = (win: ActiveWindow) => {
    const winApp = (win.app_id || '').toLowerCase().trim();
    const winTitle = (win.title || '').trim();

    // 1. Exact match on both app_id AND title
    let foundIdx = rules.findIndex((r) => {
      const rApp = (r.app_id || '').toLowerCase().trim();
      const rTitle = (r.title || '').trim();
      return (
        rApp &&
        rTitle &&
        rApp === winApp &&
        (rTitle === winTitle || winTitle.includes(rTitle) || rTitle.includes(winTitle))
      );
    });
    if (foundIdx >= 0) return { rule: rules[foundIdx], index: foundIdx };

    // 2. Match on title (e.g. drift-clock, Picture-in-Picture)
    foundIdx = rules.findIndex((r) => {
      const rTitle = (r.title || '').trim();
      return rTitle && (rTitle === winTitle || winTitle.includes(rTitle));
    });
    if (foundIdx >= 0) return { rule: rules[foundIdx], index: foundIdx };

    // 3. Match on app_id (case-insensitive)
    foundIdx = rules.findIndex((r) => {
      const rApp = (r.app_id || '').toLowerCase().trim();
      return rApp && rApp === winApp;
    });
    if (foundIdx >= 0) return { rule: rules[foundIdx], index: foundIdx };

    return null;
  };

  // Unique app IDs for suggestion chips
  const uniqueAppIds = useMemo(() => {
    const set = new Set<string>();
    for (const win of activeWindows) {
      if (win.app_id && win.app_id.trim()) {
        set.add(win.app_id.trim());
      }
    }
    return Array.from(set);
  }, [activeWindows]);

  // Filtered active windows
  const filteredActiveWindows = useMemo(() => {
    if (!activeSearch.trim()) return activeWindows;
    const q = activeSearch.toLowerCase();
    return activeWindows.filter((win) => {
      const matchApp = win.app_id?.toLowerCase().includes(q);
      const matchTitle = win.title?.toLowerCase().includes(q);
      return matchApp || matchTitle;
    });
  }, [activeWindows, activeSearch]);

  // Update a single rule directly
  const updateRuleAt = (index: number, partial: Partial<WindowRule>) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], ...partial };
    onChange(updated);
  };

  // Delete a rule
  const handleDeleteRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedRuleIndex === index) {
      setExpandedRuleIndex(null);
    } else if (expandedRuleIndex !== null && expandedRuleIndex > index) {
      setExpandedRuleIndex(expandedRuleIndex - 1);
    }
  };

  // Add a new empty rule and expand it at the top
  const handleAddNewRule = (initial?: Partial<WindowRule>) => {
    const newRule: WindowRule = {
      app_id: initial?.app_id || '',
      title: initial?.title,
      blur: typeof initial?.blur === 'boolean' ? initial.blur : true,
      opacity: typeof initial?.opacity === 'number' ? initial.opacity : 0.85,
      decoration: initial?.decoration || 'none',
      sticky: initial?.sticky,
      widget: initial?.widget,
      size: initial?.size,
      position: initial?.position,
    };

    onChange([newRule, ...rules]);
    setExpandedRuleIndex(0);
    setTimeout(() => {
      ruleRefs.current[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  // Create rule directly from an active window
  const handleCreateRuleForActiveWindow = (win: ActiveWindow) => {
    handleAddNewRule({
      app_id: win.app_id,
      title: !win.app_id ? win.title : undefined,
      size: win.size,
      position: win.position,
      widget: win.is_widget,
      blur: true,
      opacity: 0.85,
      decoration: 'none',
    });
  };

  // Filter configured rules
  const filteredRules = useMemo(() => {
    if (!rulesSearch.trim()) return rules.map((rule, index) => ({ rule, index }));
    const q = rulesSearch.toLowerCase();
    return rules
      .map((rule, index) => ({ rule, index }))
      .filter(({ rule }) => {
        const appIdMatch = rule.app_id?.toLowerCase().includes(q);
        const titleMatch = rule.title?.toLowerCase().includes(q);
        return appIdMatch || titleMatch;
      });
  }, [rules, rulesSearch]);

  return (
    <div className="space-y-3.5 max-w-2xl text-[#e5e2e3] font-mono text-xs pb-16">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e3]">
            {t('windowsTitle')}
          </h1>
          <p className="text-xs text-[#929092] mt-0.5">
            {t('windowsDesc')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleAddNewRule()}
            className="px-3 py-1.5 rounded-xl bg-[#859aea] hover:bg-[#9cb0f5] text-[#131315] font-semibold text-xs transition-colors cursor-pointer"
          >
            {t('windowsAddRule')}
          </button>
          <button
            type="button"
            onClick={fetchActive}
            className="w-8 h-8 rounded-xl bg-[#1a191d] border border-[#262529] hover:border-[#36353b] text-[#859aea] flex items-center justify-center text-xs transition-colors cursor-pointer"
            title={language === 'ru' ? 'Обновить окна' : 'Refresh Windows'}
          >
            ::
          </button>
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Metric Tiles) ──────────────────────── */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: Compositor Mode */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              1
            </div>
            <span className="text-[10px] text-[#474648] font-mono">xdg_shell</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">
              {language === 'ru' ? 'Композитор' : 'Compositor'}
            </div>
            <div className="text-xl font-bold text-[#e5e2e3] tracking-tight">
              driftwm
            </div>
            <div className="text-[10px] mt-0.5 text-[#a3d4a0]">
              ● Wayland wlr_scene
            </div>
          </div>
        </div>

        {/* Tile 2: Metrics */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                {activeWindows.length}
              </span>
              <span className="text-xs text-[#929092] ml-1.5 font-medium">
                {language === 'ru' ? 'окон' : 'windows'}
              </span>
            </div>
            <span className="text-[10px] text-[#474648] font-mono">
              config.toml
            </span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">
              {language === 'ru' ? 'Настроено правил' : 'Configured Rules'}
            </div>
            <div className="text-sm font-semibold text-[#859aea]">
              {rules.length} {t('windowsAllRulesCount')}
            </div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">
              {language === 'ru' ? 'Шейдер Dual Kawase' : 'Dual Kawase Shader Pipeline'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (ACTIVE WINDOWS AT THE BEGINNING) ─────── */}
      <div className="minimal-card overflow-hidden">
        <div className="px-4 py-3 border-b border-[#262529] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full border border-[#859aea]/50 bg-[#859aea]/10 flex items-center justify-center text-xs font-semibold text-[#859aea]">
              ●
            </div>
            <span className="text-xs font-semibold text-[#e5e2e3]">
              {t('windowsActiveApps')}
            </span>
            <span className="text-[10px] text-[#929092]">
              ({filteredActiveWindows.length} / {activeWindows.length})
            </span>
          </div>

          <div className="w-48">
            <input
              type="text"
              value={activeSearch}
              onChange={(e) => setActiveSearch(e.target.value)}
              placeholder={t('windowsActiveFilterPlaceholder')}
              className="w-full bg-[#131315] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-[11px] text-[#e5e2e3] outline-none placeholder:text-[#474648]"
            />
          </div>
        </div>

        {activeWindows.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#929092]">
            {t('windowsNoActiveApps')}
          </div>
        ) : filteredActiveWindows.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#929092]">
            {t('windowsNoMatchingRules')}
          </div>
        ) : (
          <div className="divide-y divide-[#262529]">
            {filteredActiveWindows.map((win, idx) => {
              const matched = getMatchingRule(win);
              const isConfigured = matched !== null;

              return (
                <div
                  key={`${win.app_id}-${win.title}-${idx}`}
                  className="px-4 py-3 flex items-center justify-between hover:bg-[#201f21]/40 transition-colors"
                >
                  <div className="min-w-0 pr-3 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {win.app_id && (
                        <span className="text-[#859aea] font-semibold text-[11px] shrink-0">
                          [{win.app_id}]
                        </span>
                      )}

                      {isConfigured ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#a3d4a0]/15 border-[#a3d4a0]/30 text-[#a3d4a0]">
                          {t('windowsConfigured')}
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#262529] border-[#36353b] text-[#929092]">
                          {t('windowsNotConfigured')}
                        </span>
                      )}

                      {win.is_widget && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#c0c6dc]/15 border-[#c0c6dc]/30 text-[#c0c6dc]">
                          {t('windowsWidgetBadge')}
                        </span>
                      )}

                      <span className="text-[10px] text-[#474648] font-mono">
                        {win.size[0]}×{win.size[1]}
                      </span>
                    </div>

                    <div className="text-xs text-[#e5e2e3] truncate">
                      {win.title || t('windowsAppFallback')}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    {isConfigured ? (
                      <button
                        type="button"
                        onClick={() => expandAndScrollToRule(matched!.index)}
                        className="px-2.5 py-1 rounded-lg bg-[#131315] border border-[#262529] hover:border-[#859aea] text-[11px] text-[#859aea] transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <span>{t('windowsEditRule')}</span>
                        <span className="text-[9px]">▶</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCreateRuleForActiveWindow(win)}
                        className="px-2.5 py-1 rounded-lg bg-[#859aea]/15 border border-[#859aea]/40 hover:bg-[#859aea]/25 text-[11px] text-[#859aea] font-medium transition-colors cursor-pointer"
                      >
                        {t('windowsQuickAdd')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bento Grid: Row 3 (CONFIGURED RULES - ACCORDION LIST) ─────── */}
      <div className="space-y-2">
        {/* Rules Header Bar with Search */}
        <div className="minimal-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              2
            </div>
            <div>
              <span className="text-xs font-semibold text-[#e5e2e3]">
                {t('windowsRulesHeader')}
              </span>
              <span className="text-[10px] text-[#929092] ml-2">
                ({filteredRules.length} / {rules.length})
              </span>
            </div>
          </div>

          <div className="w-56">
            <input
              type="text"
              value={rulesSearch}
              onChange={(e) => setRulesSearch(e.target.value)}
              placeholder={t('windowsSearchPlaceholder')}
              className="w-full bg-[#131315] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-[11px] text-[#e5e2e3] outline-none placeholder:text-[#474648]"
            />
          </div>
        </div>

        {/* Rules Accordion Items */}
        {rules.length === 0 ? (
          <div className="minimal-card px-4 py-8 text-center text-[#929092]">
            {t('windowsNoRules')}
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="minimal-card px-4 py-8 text-center text-[#929092]">
            {t('windowsNoMatchingRules')}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRules.map(({ rule, index }) => {
              const isExpanded = expandedRuleIndex === index;
              const hasBlur = typeof rule.blur === 'boolean' ? rule.blur : true;
              const hasOpacity = typeof rule.opacity === 'number';
              const opacityVal = hasOpacity ? rule.opacity! : 0.85;
              const isAdvancedOpen = showAdvancedFor[index] ?? (Boolean(rule.size || rule.position || rule.border_width));

              return (
                <div
                  key={`${rule.app_id || ''}-${rule.title || ''}-${index}`}
                  ref={(el) => (ruleRefs.current[index] = el)}
                  className={`minimal-card overflow-hidden transition-all border ${
                    isExpanded
                      ? 'border-[#859aea]/50 bg-[#1a191d]'
                      : 'border-[#262529] hover:border-[#36353b]'
                  }`}
                >
                  {/* Rule Header Row: Always visible, acts as accordion trigger */}
                  <div
                    onClick={() => setExpandedRuleIndex(isExpanded ? null : index)}
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#201f21]/40 transition-colors select-none"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      {/* Arrow indicator */}
                      <span className="text-[#859aea] text-xs transition-transform duration-200 shrink-0">
                        {isExpanded ? '▼' : '▶'}
                      </span>

                      {/* Rule target identifiers */}
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1 min-w-0">
                        {rule.app_id ? (
                          <span className="text-[#859aea] font-bold text-xs shrink-0">
                            [{rule.app_id}]
                          </span>
                        ) : (
                          <span className="text-[#929092] font-semibold text-xs shrink-0">
                            [{t('windowsAppFallback')}]
                          </span>
                        )}

                        {rule.title && (
                          <span className="text-xs text-[#e5e2e3] truncate max-w-[200px]">
                            "{rule.title}"
                          </span>
                        )}

                        {/* Property summary badges (visible in collapsed state) */}
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          {typeof rule.blur === 'boolean' && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded border ${
                                rule.blur
                                  ? 'bg-[#a3d4a0]/10 border-[#a3d4a0]/30 text-[#a3d4a0]'
                                  : 'bg-[#ffb4ab]/10 border-[#ffb4ab]/30 text-[#ffb4ab]'
                              }`}
                            >
                              {rule.blur ? (language === 'ru' ? 'блюр' : 'blur') : (language === 'ru' ? 'без блюра' : 'no blur')}
                            </span>
                          )}

                          {typeof rule.opacity === 'number' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#e8cf8d]/10 border-[#e8cf8d]/30 text-[#e8cf8d]">
                              {Math.round(rule.opacity * 100)}%
                            </span>
                          )}

                          {rule.decoration && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#c0c6dc]/10 border-[#c0c6dc]/30 text-[#c0c6dc]">
                              {rule.decoration}
                            </span>
                          )}

                          {rule.sticky && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#859aea]/10 border-[#859aea]/30 text-[#859aea]">
                              sticky
                            </span>
                          )}

                          {rule.widget && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#859aea]/10 border-[#859aea]/30 text-[#859aea]">
                              widget
                            </span>
                          )}

                          {rule.size && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#262529] border-[#36353b] text-[#929092]">
                              {rule.size[0]}×{rule.size[1]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <span className="text-[10px] text-[#859aea] hover:underline font-medium">
                        {isExpanded ? t('windowsCollapse') : t('windowsExpand')}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRule(index);
                        }}
                        className="w-6 h-6 rounded-lg border border-[#262529] hover:border-[#ffb4ab] text-[12px] text-[#929092] hover:text-[#ffb4ab] flex items-center justify-center transition-colors cursor-pointer"
                        title={t('windowsDeleteRule')}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* ── Inline Sliding Settings (Visible only when Expanded) ─ */}
                  {isExpanded && (
                    <div className="p-4 space-y-3.5 border-t border-[#262529] bg-[#161518]/90">
                      {/* Matchers: App ID & Window Title */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-[#e5e2e3]">
                            {t('windowsAppId')}
                          </label>
                          <input
                            type="text"
                            value={rule.app_id || ''}
                            onChange={(e) => updateRuleAt(index, { app_id: e.target.value })}
                            placeholder={t('windowsAppIdPlaceholder')}
                            className="w-full bg-[#131315] border border-[#262529] focus:border-[#859aea] rounded-xl px-3 py-1.5 text-xs text-[#e5e2e3] outline-none placeholder:text-[#474648] font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-[#e5e2e3]">
                            {t('windowsTitleMatcher')}
                          </label>
                          <input
                            type="text"
                            value={rule.title || ''}
                            onChange={(e) => updateRuleAt(index, { title: e.target.value })}
                            placeholder={t('windowsTitleMatcherPlaceholder')}
                            className="w-full bg-[#131315] border border-[#262529] focus:border-[#859aea] rounded-xl px-3 py-1.5 text-xs text-[#e5e2e3] outline-none placeholder:text-[#474648] font-mono"
                          />
                        </div>
                      </div>

                      {/* Quick Pick Chips for App ID */}
                      {uniqueAppIds.length > 0 && (
                        <div className="space-y-1 pt-0.5">
                          <span className="text-[10px] text-[#929092]">
                            {t('windowsQuickPickApp')}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {uniqueAppIds.map((appId) => (
                              <button
                                key={appId}
                                type="button"
                                onClick={() => updateRuleAt(index, { app_id: appId })}
                                className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                                  rule.app_id === appId
                                    ? 'bg-[#859aea]/20 border-[#859aea] text-[#859aea]'
                                    : 'bg-[#131315] border-[#262529] text-[#929092] hover:text-[#e5e2e3]'
                                }`}
                              >
                                {appId}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Visual Effects: Blur & Opacity */}
                      <div className="p-3 bg-[#131315] border border-[#262529] rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-medium text-[#e5e2e3]">
                              {t('windowsBlur')}
                            </div>
                            <div className="text-[10px] text-[#929092] mt-0.5">
                              {language === 'ru'
                                ? 'Аппаратное размытие подложки Dual Kawase'
                                : 'Dual Kawase hardware background blur'}
                            </div>
                          </div>
                          <Toggle
                            checked={hasBlur}
                            onChange={(val) => updateRuleAt(index, { blur: val })}
                          />
                        </div>

                        {/* Opacity Slider */}
                        <div className="pt-2 border-t border-[#262529] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[#e5e2e3]">
                              {t('windowsOpacity')}:{' '}
                              <span className="text-[#859aea] font-bold">
                                {hasOpacity ? `${Math.round(opacityVal * 100)}%` : (language === 'ru' ? '100% (по умолч.)' : '100% (default)')}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (hasOpacity) {
                                  updateRuleAt(index, { opacity: undefined });
                                } else {
                                  updateRuleAt(index, { opacity: 0.85 });
                                }
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                hasOpacity
                                  ? 'bg-[#859aea]/15 border-[#859aea]/40 text-[#859aea]'
                                  : 'bg-[#1a191d] border-[#262529] text-[#929092]'
                              }`}
                            >
                              {hasOpacity
                                ? (language === 'ru' ? 'Задана' : 'Custom')
                                : (language === 'ru' ? 'По умолчанию' : 'Default')}
                            </button>
                          </div>

                          {hasOpacity && (
                            <input
                              type="range"
                              min="0.1"
                              max="1.0"
                              step="0.05"
                              value={opacityVal}
                              onChange={(e) =>
                                updateRuleAt(index, {
                                  opacity: Math.round(parseFloat(e.target.value) * 100) / 100,
                                })
                              }
                              className="w-full cursor-pointer accent-[#859aea]"
                            />
                          )}
                        </div>
                      </div>

                      {/* Window Decorations Mode */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#e5e2e3]">
                          {t('windowsDecoration')}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'none', label: t('windowsDecorNone') },
                            { id: 'minimal', label: t('windowsDecorMinimal') },
                            { id: 'client', label: t('windowsDecorClient') },
                            { id: 'server', label: t('windowsDecorServer') },
                          ].map((dec) => (
                            <button
                              key={dec.id}
                              type="button"
                              onClick={() =>
                                updateRuleAt(index, {
                                  decoration: rule.decoration === dec.id ? undefined : (dec.id as any),
                                })
                              }
                              className={`px-2.5 py-1.5 text-[11px] rounded-xl border text-center transition-colors cursor-pointer ${
                                rule.decoration === dec.id
                                  ? 'bg-[#859aea]/20 border-[#859aea] text-[#859aea] font-medium'
                                  : 'bg-[#131315] border-[#262529] text-[#929092] hover:border-[#36353b] hover:text-[#e5e2e3]'
                              }`}
                            >
                              {dec.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Behaviors: Sticky & Widget */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-[#131315] border border-[#262529] rounded-xl flex items-center justify-between">
                          <div className="pr-2">
                            <div className="text-xs font-medium text-[#e5e2e3]">{t('windowsSticky')}</div>
                            <div className="text-[10px] text-[#929092] mt-0.5">{t('windowsStickyDesc')}</div>
                          </div>
                          <Toggle
                            checked={!!rule.sticky}
                            onChange={(val) => updateRuleAt(index, { sticky: val ? true : undefined })}
                          />
                        </div>

                        <div className="p-3 bg-[#131315] border border-[#262529] rounded-xl flex items-center justify-between">
                          <div className="pr-2">
                            <div className="text-xs font-medium text-[#e5e2e3]">{t('windowsWidget')}</div>
                            <div className="text-[10px] text-[#929092] mt-0.5">{t('windowsWidgetDesc')}</div>
                          </div>
                          <Toggle
                            checked={!!rule.widget}
                            onChange={(val) => updateRuleAt(index, { widget: val ? true : undefined })}
                          />
                        </div>
                      </div>

                      {/* Collapsible Advanced Geometry */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setShowAdvancedFor((prev) => ({
                              ...prev,
                              [index]: !isAdvancedOpen,
                            }))
                          }
                          className="text-[11px] text-[#859aea] hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{isAdvancedOpen ? '▼' : '▶'}</span>
                          <span>{t('windowsGeometry')}</span>
                        </button>

                        {isAdvancedOpen && (
                          <div className="mt-2.5 p-3.5 bg-[#131315] border border-[#262529] rounded-xl space-y-3.5">
                            {/* Size */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#e5e2e3]">{t('windowsSizeEnabled')}</span>
                                <Toggle
                                  checked={Array.isArray(rule.size)}
                                  onChange={(val) =>
                                    updateRuleAt(index, {
                                      size: val ? [950, 580] : undefined,
                                    })
                                  }
                                />
                              </div>
                              {Array.isArray(rule.size) && (
                                <div className="grid grid-cols-2 gap-2.5 pt-1">
                                  <div>
                                    <label className="text-[10px] text-[#929092]">{t('windowsWidth')}</label>
                                    <input
                                      type="number"
                                      value={rule.size[0] || ''}
                                      onChange={(e) => {
                                        const w = parseInt(e.target.value, 10) || 0;
                                        updateRuleAt(index, { size: [w, rule.size![1]] });
                                      }}
                                      className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-[#929092]">{t('windowsHeight')}</label>
                                    <input
                                      type="number"
                                      value={rule.size[1] || ''}
                                      onChange={(e) => {
                                        const h = parseInt(e.target.value, 10) || 0;
                                        updateRuleAt(index, { size: [rule.size![0], h] });
                                      }}
                                      className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Position */}
                            <div className="space-y-2 pt-2 border-t border-[#262529]">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#e5e2e3]">{t('windowsPosEnabled')}</span>
                                <Toggle
                                  checked={Array.isArray(rule.position)}
                                  onChange={(val) =>
                                    updateRuleAt(index, {
                                      position: val ? [0, 0] : undefined,
                                    })
                                  }
                                />
                              </div>
                              {Array.isArray(rule.position) && (
                                <div className="grid grid-cols-2 gap-2.5 pt-1">
                                  <div>
                                    <label className="text-[10px] text-[#929092]">{t('windowsPosX')}</label>
                                    <input
                                      type="number"
                                      value={rule.position[0] ?? ''}
                                      onChange={(e) => {
                                        const x = parseInt(e.target.value, 10) || 0;
                                        updateRuleAt(index, { position: [x, rule.position![1]] });
                                      }}
                                      className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-[#929092]">{t('windowsPosY')}</label>
                                    <input
                                      type="number"
                                      value={rule.position[1] ?? ''}
                                      onChange={(e) => {
                                        const y = parseInt(e.target.value, 10) || 0;
                                        updateRuleAt(index, { position: [rule.position![0], y] });
                                      }}
                                      className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Borders & Corners */}
                            <div className="space-y-2 pt-2 border-t border-[#262529]">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#e5e2e3]">{t('windowsBorders')}</span>
                                <Toggle
                                  checked={
                                    typeof rule.border_width === 'number' ||
                                    typeof rule.corner_radius === 'number'
                                  }
                                  onChange={(val) =>
                                    updateRuleAt(index, {
                                      border_width: val ? 2 : undefined,
                                      corner_radius: val ? 16 : undefined,
                                    })
                                  }
                                />
                              </div>
                              {(typeof rule.border_width === 'number' ||
                                typeof rule.corner_radius === 'number') && (
                                <div className="grid grid-cols-2 gap-2.5 pt-1">
                                  <div>
                                    <label className="text-[10px] text-[#929092]">
                                      {t('windowsBorderWidth')}
                                    </label>
                                    <input
                                      type="number"
                                      value={rule.border_width ?? ''}
                                      onChange={(e) => {
                                        const bw = parseInt(e.target.value, 10);
                                        updateRuleAt(index, {
                                          border_width: isNaN(bw) ? undefined : bw,
                                        });
                                      }}
                                      placeholder="2"
                                      className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-[#929092]">
                                      {t('windowsCornerRadius')}
                                    </label>
                                    <input
                                      type="number"
                                      value={rule.corner_radius ?? ''}
                                      onChange={(e) => {
                                        const cr = parseInt(e.target.value, 10);
                                        updateRuleAt(index, {
                                          corner_radius: isNaN(cr) ? undefined : cr,
                                        });
                                      }}
                                      placeholder="16"
                                      className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Rule Footer Actions */}
                      <div className="pt-2 flex items-center justify-between border-t border-[#262529]">
                        <button
                          type="button"
                          onClick={() => setExpandedRuleIndex(null)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#859aea]/15 hover:bg-[#859aea]/25 text-[#859aea] font-medium text-xs transition-colors cursor-pointer"
                        >
                          {t('windowsCollapse')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRule(index)}
                          className="px-3 py-1.5 rounded-xl border border-[#ffb4ab]/30 hover:border-[#ffb4ab] text-[#ffb4ab] text-xs transition-colors cursor-pointer"
                        >
                          {t('windowsDeleteRule')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WindowsView;
