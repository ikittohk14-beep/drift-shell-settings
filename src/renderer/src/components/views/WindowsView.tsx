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
  const formRef = useRef<HTMLDivElement>(null);

  const [activeWindows, setActiveWindows] = useState<ActiveWindow[]>([]);
  const [activeSearch, setActiveSearch] = useState('');
  const [rulesSearch, setRulesSearch] = useState('');
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  // Form State for Adding / Editing a Rule
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form Fields
  const [formAppId, setFormAppId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formBlurExplicit, setFormBlurExplicit] = useState(true);
  const [formBlur, setFormBlur] = useState(true);
  const [formOpacityExplicit, setFormOpacityExplicit] = useState(true);
  const [formOpacity, setFormOpacity] = useState(0.85);
  const [formDecoration, setFormDecoration] = useState<'' | 'client' | 'minimal' | 'none' | 'server'>('none');
  const [formSticky, setFormSticky] = useState(false);
  const [formWidget, setFormWidget] = useState(false);

  // Advanced Geometry
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasCustomSize, setHasCustomSize] = useState(false);
  const [sizeW, setSizeW] = useState('');
  const [sizeH, setSizeH] = useState('');
  const [hasCustomPos, setHasCustomPos] = useState(false);
  const [posX, setPosX] = useState('');
  const [posY, setPosY] = useState('');
  const [hasCustomBorders, setHasCustomBorders] = useState(false);
  const [borderWidth, setBorderWidth] = useState('');
  const [cornerRadius, setCornerRadius] = useState('');

  // Fetch running Wayland windows from driftwm state
  const fetchActive = async () => {
    try {
      if (window.driftAPI?.getActiveWindows) {
        const wins = await window.driftAPI.getActiveWindows();
        setActiveWindows(wins.filter((w) => (w.app_id && w.app_id.trim()) || (w.title && w.title.trim())));
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

  // Smooth scroll directly to the form whenever opened
  const scrollToForm = () => {
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  // Smart matching between an active window and configured rules
  const getMatchingRule = (win: ActiveWindow) => {
    const winApp = (win.app_id || '').toLowerCase().trim();
    const winTitle = (win.title || '').trim();

    // 1. Both app_id and title match
    let foundIdx = rules.findIndex((r) => {
      const rApp = (r.app_id || '').toLowerCase().trim();
      const rTitle = (r.title || '').trim();
      return rApp && rTitle && rApp === winApp && (rTitle === winTitle || winTitle.includes(rTitle) || rTitle.includes(winTitle));
    });
    if (foundIdx >= 0) return { rule: rules[foundIdx], index: foundIdx };

    // 2. Specific title match (e.g. drift-clock, Picture-in-Picture)
    foundIdx = rules.findIndex((r) => {
      const rTitle = (r.title || '').trim();
      return rTitle && (rTitle === winTitle || winTitle.includes(rTitle));
    });
    if (foundIdx >= 0) return { rule: rules[foundIdx], index: foundIdx };

    // 3. app_id match (case-insensitive)
    foundIdx = rules.findIndex((r) => {
      const rApp = (r.app_id || '').toLowerCase().trim();
      return rApp && rApp === winApp;
    });
    if (foundIdx >= 0) return { rule: rules[foundIdx], index: foundIdx };

    return null;
  };

  // Unique app IDs for quick suggestion chips
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

  // Open Form to create new rule
  const openCreateRule = (
    initialAppId = '',
    initialTitle = '',
    initialSize?: [number, number],
    initialPos?: [number, number],
    isWidget = false
  ) => {
    setEditingIndex(null);
    setFormAppId(initialAppId);
    setFormTitle(initialTitle);
    setFormBlurExplicit(true);
    setFormBlur(true);
    setFormOpacityExplicit(true);
    setFormOpacity(0.85);
    setFormDecoration('none');
    setFormSticky(false);
    setFormWidget(isWidget);

    if (initialSize && Array.isArray(initialSize) && initialSize.length === 2) {
      setHasCustomSize(true);
      setSizeW(String(initialSize[0]));
      setSizeH(String(initialSize[1]));
    } else {
      setHasCustomSize(false);
      setSizeW('');
      setSizeH('');
    }

    if (initialPos && Array.isArray(initialPos) && initialPos.length === 2) {
      setHasCustomPos(true);
      setPosX(String(initialPos[0]));
      setPosY(String(initialPos[1]));
    } else {
      setHasCustomPos(false);
      setPosX('');
      setPosY('');
    }

    setHasCustomBorders(false);
    setBorderWidth('');
    setCornerRadius('');
    setShowAdvanced(Boolean(initialSize || initialPos));
    setIsFormOpen(true);
    scrollToForm();
  };

  // Open Form to edit an existing rule
  const openEditRule = (index: number) => {
    const r = rules[index];
    if (!r) return;
    setIsRulesExpanded(true);
    setEditingIndex(index);
    setFormAppId(r.app_id || '');
    setFormTitle(r.title || '');
    setFormBlurExplicit(typeof r.blur === 'boolean');
    setFormBlur(typeof r.blur === 'boolean' ? r.blur : true);
    setFormOpacityExplicit(typeof r.opacity === 'number');
    setFormOpacity(typeof r.opacity === 'number' ? r.opacity : 0.85);
    setFormDecoration(r.decoration || '');
    setFormSticky(!!r.sticky);
    setFormWidget(!!r.widget);

    const hasSize = Array.isArray(r.size) && r.size.length === 2;
    setHasCustomSize(hasSize);
    setSizeW(hasSize ? String(r.size![0]) : '');
    setSizeH(hasSize ? String(r.size![1]) : '');

    const hasPos = Array.isArray(r.position) && r.position.length === 2;
    setHasCustomPos(hasPos);
    setPosX(hasPos ? String(r.position![0]) : '');
    setPosY(hasPos ? String(r.position![1]) : '');

    const hasBorder = typeof r.border_width === 'number' || typeof r.corner_radius === 'number';
    setHasCustomBorders(hasBorder);
    setBorderWidth(typeof r.border_width === 'number' ? String(r.border_width) : '');
    setCornerRadius(typeof r.corner_radius === 'number' ? String(r.corner_radius) : '');

    setShowAdvanced(hasSize || hasPos || hasBorder);
    setIsFormOpen(true);
    scrollToForm();
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingIndex(null);
  };

  // Save rule
  const handleSaveRule = () => {
    const trimmedAppId = formAppId.trim();
    const trimmedTitle = formTitle.trim();

    if (!trimmedAppId && !trimmedTitle) {
      return;
    }

    const savedRule: WindowRule = {};
    if (trimmedAppId) savedRule.app_id = trimmedAppId;
    if (trimmedTitle) savedRule.title = trimmedTitle;
    if (formBlurExplicit) savedRule.blur = formBlur;
    if (formOpacityExplicit) savedRule.opacity = Math.round(formOpacity * 100) / 100;
    if (formDecoration) savedRule.decoration = formDecoration;
    if (formSticky) savedRule.sticky = true;
    if (formWidget) savedRule.widget = true;

    if (hasCustomSize && sizeW.trim() && sizeH.trim()) {
      const w = parseInt(sizeW, 10);
      const h = parseInt(sizeH, 10);
      if (!isNaN(w) && !isNaN(h)) {
        savedRule.size = [w, h];
      }
    }

    if (hasCustomPos && posX.trim() && posY.trim()) {
      const x = parseInt(posX, 10);
      const y = parseInt(posY, 10);
      if (!isNaN(x) && !isNaN(y)) {
        savedRule.position = [x, y];
      }
    }

    if (hasCustomBorders) {
      if (borderWidth.trim()) {
        const bw = parseInt(borderWidth, 10);
        if (!isNaN(bw)) savedRule.border_width = bw;
      }
      if (cornerRadius.trim()) {
        const cr = parseInt(cornerRadius, 10);
        if (!isNaN(cr)) savedRule.corner_radius = cr;
      }
    }

    let updatedRules: WindowRule[];
    if (editingIndex !== null && editingIndex >= 0 && editingIndex < rules.length) {
      updatedRules = [...rules];
      updatedRules[editingIndex] = savedRule;
    } else {
      updatedRules = [...rules, savedRule];
    }

    onChange(updatedRules);
    setIsFormOpen(false);
    setEditingIndex(null);
  };

  // Delete a rule
  const handleDeleteRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    onChange(updated);
    if (editingIndex === index) {
      setIsFormOpen(false);
      setEditingIndex(null);
    }
  };

  // Quick inline blur toggle on active window row
  const handleToggleActiveWindowBlur = (win: ActiveWindow, enable: boolean) => {
    const matched = getMatchingRule(win);
    if (matched) {
      const updated = [...rules];
      updated[matched.index] = { ...updated[matched.index], blur: enable };
      onChange(updated);
    } else {
      const newRule: WindowRule = {
        app_id: win.app_id || undefined,
        title: !win.app_id ? win.title : undefined,
        blur: enable,
        opacity: 0.85,
        decoration: 'none',
      };
      onChange([...rules, newRule]);
    }
  };

  // Quick inline blur toggle on an existing rule
  const handleQuickBlurToggle = (ruleIndex: number, enabled: boolean) => {
    const updated = [...rules];
    updated[ruleIndex] = { ...updated[ruleIndex], blur: enabled };
    onChange(updated);
  };

  // Quick inline opacity slider on an existing rule
  const handleQuickOpacityChange = (ruleIndex: number, op: number) => {
    const updated = [...rules];
    updated[ruleIndex] = { ...updated[ruleIndex], opacity: op };
    onChange(updated);
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
    <div className="space-y-3.5 max-w-2xl text-[#e5e2e3] font-mono text-xs pb-12">
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
            onClick={() => openCreateRule()}
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

      {/* ── Bento Grid: Row 2 (ACTIVE WINDOWS AT THE VERY BEGINNING) ─ */}
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
              const ruleBlur = matched?.rule.blur !== false;

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

                      {win.is_focused && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#859aea]/15 border-[#859aea]/30 text-[#859aea]">
                          {t('windowsFocused')}
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
                    {/* Quick Blur Toggle for active window */}
                    <Toggle
                      checked={isConfigured ? ruleBlur : false}
                      onChange={(val) => handleToggleActiveWindowBlur(win, val)}
                    />

                    {isConfigured ? (
                      <button
                        type="button"
                        onClick={() => openEditRule(matched!.index)}
                        className="px-2.5 py-1 rounded-lg bg-[#131315] border border-[#262529] hover:border-[#859aea] text-[11px] text-[#859aea] transition-colors cursor-pointer"
                      >
                        {t('windowsEditRule')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          openCreateRule(
                            win.app_id,
                            win.title,
                            win.size,
                            win.position,
                            win.is_widget
                          )
                        }
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

      {/* ── Bento Grid: Row 3 (RULE CREATOR / EDITOR CARD) ──────────── */}
      {isFormOpen && (
        <div
          ref={formRef}
          className="minimal-card p-5 border-[#859aea]/50 bg-[#1a191d] space-y-4 shadow-none"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#262529]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#859aea]/20 border border-[#859aea]/50 flex items-center justify-center text-xs font-bold text-[#859aea]">
                *
              </div>
              <span className="text-sm font-semibold text-[#e5e2e3]">
                {editingIndex !== null ? t('windowsEditRule') : t('windowsAddRule')}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-xs text-[#929092] hover:text-[#e5e2e3] px-2 py-1 rounded-lg hover:bg-[#201f21] transition-colors cursor-pointer"
            >
              ✕ {t('windowsCancel')}
            </button>
          </div>

          {/* Form Fields Container */}
          <div className="space-y-3.5">
            {/* Field: App ID & Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#e5e2e3]">
                  {t('windowsAppId')}
                </label>
                <input
                  type="text"
                  value={formAppId}
                  onChange={(e) => setFormAppId(e.target.value)}
                  placeholder={t('windowsAppIdPlaceholder')}
                  className="w-full bg-[#131315] border border-[#262529] focus:border-[#859aea] rounded-xl px-3 py-2 text-xs text-[#e5e2e3] outline-none placeholder:text-[#474648] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#e5e2e3]">
                  {t('windowsTitleMatcher')}
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={t('windowsTitleMatcherPlaceholder')}
                  className="w-full bg-[#131315] border border-[#262529] focus:border-[#859aea] rounded-xl px-3 py-2 text-xs text-[#e5e2e3] outline-none placeholder:text-[#474648] font-mono"
                />
              </div>
            </div>

            {/* Quick Pick Chips from Active Windows */}
            {uniqueAppIds.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-[#929092]">
                  {t('windowsQuickPickApp')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueAppIds.map((appId) => (
                    <button
                      key={appId}
                      type="button"
                      onClick={() => setFormAppId(appId)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        formAppId === appId
                          ? 'bg-[#859aea]/20 border-[#859aea] text-[#859aea]'
                          : 'bg-[#131315] border-[#262529] text-[#929092] hover:text-[#e5e2e3] hover:border-[#36353b]'
                      }`}
                    >
                      {appId}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Effects: Blur & Opacity */}
            <div className="p-3 bg-[#131315] border border-[#262529] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[#e5e2e3]">{t('windowsBlur')}</div>
                  <div className="text-[10px] text-[#929092] mt-0.5">
                    {language === 'ru'
                      ? 'Аппаратное размытие подложки окна'
                      : 'Dual Kawase hardware background blur'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Toggle
                    checked={formBlur}
                    onChange={(val) => {
                      setFormBlur(val);
                      setFormBlurExplicit(true);
                    }}
                  />
                </div>
              </div>

              {/* Opacity Setting */}
              <div className="pt-2 border-t border-[#262529] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#e5e2e3]">
                    {t('windowsOpacity')}:{' '}
                    <span className="text-[#859aea] font-bold">
                      {Math.round(formOpacity * 100)}%
                    </span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormOpacityExplicit(!formOpacityExplicit)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        formOpacityExplicit
                          ? 'bg-[#859aea]/15 border-[#859aea]/40 text-[#859aea]'
                          : 'bg-[#1a191d] border-[#262529] text-[#929092]'
                      }`}
                    >
                      {formOpacityExplicit
                        ? language === 'ru'
                          ? 'Активно'
                          : 'Active'
                        : language === 'ru'
                          ? 'Не задано'
                          : 'Default'}
                    </button>
                  </div>
                </div>
                {formOpacityExplicit && (
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={formOpacity}
                    onChange={(e) => setFormOpacity(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-[#859aea]"
                  />
                )}
              </div>
            </div>

            {/* Window Decorations */}
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
                      setFormDecoration(formDecoration === dec.id ? '' : (dec.id as any))
                    }
                    className={`px-2.5 py-1.5 text-[11px] rounded-xl border text-center transition-colors cursor-pointer ${
                      formDecoration === dec.id
                        ? 'bg-[#859aea]/20 border-[#859aea] text-[#859aea] font-medium'
                        : 'bg-[#131315] border-[#262529] text-[#929092] hover:border-[#36353b] hover:text-[#e5e2e3]'
                    }`}
                  >
                    {dec.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Window Behaviors: Sticky & Widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-[#131315] border border-[#262529] rounded-xl flex items-center justify-between">
                <div className="pr-2">
                  <div className="text-xs font-medium text-[#e5e2e3]">{t('windowsSticky')}</div>
                  <div className="text-[10px] text-[#929092] mt-0.5">{t('windowsStickyDesc')}</div>
                </div>
                <Toggle checked={formSticky} onChange={setFormSticky} />
              </div>

              <div className="p-3 bg-[#131315] border border-[#262529] rounded-xl flex items-center justify-between">
                <div className="pr-2">
                  <div className="text-xs font-medium text-[#e5e2e3]">{t('windowsWidget')}</div>
                  <div className="text-[10px] text-[#929092] mt-0.5">{t('windowsWidgetDesc')}</div>
                </div>
                <Toggle checked={formWidget} onChange={setFormWidget} />
              </div>
            </div>

            {/* Collapsible Advanced Geometry (Size, Position, Borders) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[11px] text-[#859aea] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>{showAdvanced ? '▼' : '▶'}</span>
                <span>{t('windowsGeometry')}</span>
              </button>

              {showAdvanced && (
                <div className="mt-2.5 p-3.5 bg-[#131315] border border-[#262529] rounded-xl space-y-3.5">
                  {/* Size */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#e5e2e3]">{t('windowsSizeEnabled')}</span>
                      <Toggle checked={hasCustomSize} onChange={setHasCustomSize} />
                    </div>
                    {hasCustomSize && (
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="text-[10px] text-[#929092]">{t('windowsWidth')}</label>
                          <input
                            type="number"
                            value={sizeW}
                            onChange={(e) => setSizeW(e.target.value)}
                            placeholder="950"
                            className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#929092]">{t('windowsHeight')}</label>
                          <input
                            type="number"
                            value={sizeH}
                            onChange={(e) => setSizeH(e.target.value)}
                            placeholder="580"
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
                      <Toggle checked={hasCustomPos} onChange={setHasCustomPos} />
                    </div>
                    {hasCustomPos && (
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="text-[10px] text-[#929092]">{t('windowsPosX')}</label>
                          <input
                            type="number"
                            value={posX}
                            onChange={(e) => setPosX(e.target.value)}
                            placeholder="0"
                            className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#929092]">{t('windowsPosY')}</label>
                          <input
                            type="number"
                            value={posY}
                            onChange={(e) => setPosY(e.target.value)}
                            placeholder="0"
                            className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Borders and Corners */}
                  <div className="space-y-2 pt-2 border-t border-[#262529]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#e5e2e3]">{t('windowsBorders')}</span>
                      <Toggle checked={hasCustomBorders} onChange={setHasCustomBorders} />
                    </div>
                    {hasCustomBorders && (
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="text-[10px] text-[#929092]">{t('windowsBorderWidth')}</label>
                          <input
                            type="number"
                            value={borderWidth}
                            onChange={(e) => setBorderWidth(e.target.value)}
                            placeholder="2"
                            className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#929092]">{t('windowsCornerRadius')}</label>
                          <input
                            type="number"
                            value={cornerRadius}
                            onChange={(e) => setCornerRadius(e.target.value)}
                            placeholder="24"
                            className="w-full mt-1 bg-[#1a191d] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-[#262529]">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSaveRule}
                  disabled={!formAppId.trim() && !formTitle.trim()}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                    formAppId.trim() || formTitle.trim()
                      ? 'bg-[#859aea] hover:bg-[#9cb0f5] text-[#131315]'
                      : 'bg-[#262529] text-[#929092] cursor-not-allowed'
                  }`}
                >
                  {t('windowsSaveRule')}
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3.5 py-2 rounded-xl bg-[#131315] border border-[#262529] hover:border-[#36353b] text-[#929092] hover:text-[#e5e2e3] text-xs transition-colors cursor-pointer"
                >
                  {t('windowsCancel')}
                </button>
              </div>

              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={() => handleDeleteRule(editingIndex)}
                  className="px-3 py-2 rounded-xl border border-[#ffb4ab]/30 hover:border-[#ffb4ab] text-[#ffb4ab] text-xs transition-colors cursor-pointer"
                >
                  {t('windowsDeleteRule')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bento Grid: Row 4 (CONFIGURED RULES ACCORDION CARD) ─────── */}
      <div className="minimal-card overflow-hidden">
        <div
          onClick={() => setIsRulesExpanded(!isRulesExpanded)}
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#201f21]/40 transition-colors select-none"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              2
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#e5e2e3]">
                {t('windowsRulesHeader')}
              </span>
              <span className="text-[10px] text-[#929092]">
                ({rules.length} {t('windowsAllRulesCount')})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[11px] text-[#859aea] font-medium">
              {isRulesExpanded ? `[ ▼ ${t('windowsRulesHide')} ]` : `[ ▶ ${t('windowsRulesShow')} ]`}
            </span>
          </div>
        </div>

        {isRulesExpanded && (
          <div className="border-t border-[#262529]">
            {/* Search Filter Header */}
            <div className="px-4 py-2 bg-[#131315]/50 border-b border-[#262529] flex items-center justify-between">
              <span className="text-[10px] text-[#929092]">
                {filteredRules.length} / {rules.length}
              </span>
              <div className="w-56">
                <input
                  type="text"
                  value={rulesSearch}
                  onChange={(e) => setRulesSearch(e.target.value)}
                  placeholder={t('windowsSearchPlaceholder')}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[#131315] border border-[#262529] focus:border-[#859aea] rounded-lg px-2.5 py-1 text-[11px] text-[#e5e2e3] outline-none placeholder:text-[#474648]"
                />
              </div>
            </div>

            {rules.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#929092]">
                {t('windowsNoRules')}
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#929092]">
                {t('windowsNoMatchingRules')}
              </div>
            ) : (
              <div className="divide-y divide-[#262529]">
            {filteredRules.map(({ rule, index }) => {
              const hasBlur = rule.blur !== false;
              const opacity = rule.opacity ?? 1.0;

              return (
                <div
                  key={`${rule.app_id || ''}-${rule.title || ''}-${index}`}
                  className="px-4 py-3 space-y-2 hover:bg-[#201f21]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0 flex-wrap gap-y-1">
                      {rule.app_id && (
                        <span className="text-[#859aea] font-semibold text-[11px] shrink-0">
                          [{rule.app_id}]
                        </span>
                      )}
                      {rule.title && (
                        <span className="text-[#e5e2e3] text-xs truncate">
                          "{rule.title}"
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => openEditRule(index)}
                        className="px-2 py-0.5 rounded border border-[#262529] hover:border-[#859aea] text-[11px] text-[#929092] hover:text-[#859aea] transition-colors cursor-pointer"
                      >
                        {language === 'ru' ? 'ред.' : 'edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(index)}
                        className="px-1.5 py-0.5 rounded border border-[#262529] hover:border-[#ffb4ab] text-[11px] text-[#929092] hover:text-[#ffb4ab] transition-colors cursor-pointer"
                        title={t('windowsDeleteRule')}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Badges of active properties */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {typeof rule.blur === 'boolean' && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border ${
                          rule.blur
                            ? 'bg-[#a3d4a0]/10 border-[#a3d4a0]/30 text-[#a3d4a0]'
                            : 'bg-[#ffb4ab]/10 border-[#ffb4ab]/30 text-[#ffb4ab]'
                        }`}
                      >
                        {rule.blur
                          ? language === 'ru'
                            ? 'блюр: вкл'
                            : 'blur: on'
                          : language === 'ru'
                            ? 'блюр: выкл'
                            : 'blur: off'}
                      </span>
                    )}

                    {typeof rule.opacity === 'number' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded border bg-[#e8cf8d]/10 border-[#e8cf8d]/30 text-[#e8cf8d]">
                        {language === 'ru' ? 'прозрачность' : 'opacity'}:{' '}
                        {Math.round(rule.opacity * 100)}%
                      </span>
                    )}

                    {rule.decoration && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded border bg-[#c0c6dc]/10 border-[#c0c6dc]/30 text-[#c0c6dc]">
                        {language === 'ru' ? 'рамки' : 'decor'}: {rule.decoration}
                      </span>
                    )}

                    {rule.sticky && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded border bg-[#859aea]/10 border-[#859aea]/30 text-[#859aea]">
                        {language === 'ru' ? 'закреплено' : 'sticky'}
                      </span>
                    )}

                    {rule.widget && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded border bg-[#859aea]/10 border-[#859aea]/30 text-[#859aea]">
                        {language === 'ru' ? 'виджет' : 'widget'}
                      </span>
                    )}

                    {rule.size && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded border bg-[#262529] border-[#36353b] text-[#929092]">
                        {rule.size[0]}×{rule.size[1]}
                      </span>
                    )}

                    {rule.position && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded border bg-[#262529] border-[#36353b] text-[#929092]">
                        pos: {rule.position[0]},{rule.position[1]}
                      </span>
                    )}
                  </div>

                  {/* Inline quick toggle for blur & opacity */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#262529]/60">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-[#929092]">
                        {language === 'ru' ? 'Размытие' : 'Blur'}:
                      </span>
                      <Toggle
                        checked={hasBlur}
                        onChange={(val) => handleQuickBlurToggle(index, val)}
                      />
                    </div>

                    {hasBlur && (
                      <div className="flex items-center space-x-2 w-48">
                        <span className="text-[10px] text-[#929092] shrink-0">
                          {Math.round(opacity * 100)}%
                        </span>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={opacity}
                          onChange={(e) =>
                            handleQuickOpacityChange(index, parseFloat(e.target.value))
                          }
                          className="w-full cursor-pointer accent-[#859aea]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}
    </div>
  </div>
  );
};

export default WindowsView;
