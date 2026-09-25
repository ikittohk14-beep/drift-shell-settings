import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RotateCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AppWindow,
  Maximize2,
  Layers,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import Toggle from '../Toggle';
import { useI18n } from '../../i18n';
import type { WindowRule, ActiveWindow } from '../../../../preload/types';

interface WindowsViewProps {
  rules: WindowRule[];
  onChange: (newRules: WindowRule[]) => void;
}

interface RuleEditorProps {
  rule: WindowRule;
  onUpdate: (partial: Partial<WindowRule>) => void;
  onDelete?: () => void;
  onCollapse: () => void;
  onSaveNew?: () => void;
  isNew?: boolean;
  uniqueAppIds: string[];
  activeWindow?: ActiveWindow;
}

const RuleEditor: React.FC<RuleEditorProps> = ({
  rule,
  onUpdate,
  onDelete,
  onCollapse,
  onSaveNew,
  isNew,
  uniqueAppIds,
  activeWindow,
}) => {
  const { t, language } = useI18n();
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showAllChips, setShowAllChips] = useState<boolean>(false);

  const hasBlur = typeof rule.blur === 'boolean' ? rule.blur : true;
  const hasOpacity = typeof rule.opacity === 'number';
  const opacityVal = hasOpacity ? rule.opacity! : 0.85;

  const visibleAppChips = showAllChips ? uniqueAppIds : uniqueAppIds.slice(0, 6);

  return (
    <div className="p-4 space-y-4 border-t border-[#262529] bg-[#141316] text-[#e5e2e3]">
      {/* ── 1. Target Window Identification ───────────────────────── */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#929092] flex items-center space-x-1.5">
              <span>{t('windowsAppId')}</span>
              <span className="text-[#a6d189] text-[10px]">*</span>
            </label>
            <input
              type="text"
              value={rule.app_id || ''}
              onChange={(e) => onUpdate({ app_id: e.target.value })}
              placeholder={t('windowsAppIdPlaceholder')}
              className="w-full bg-[#1a191d] border border-[#262529] focus:border-[#e5e2e3] rounded-xl px-3 py-1.5 text-xs text-[#e5e2e3] outline-none placeholder:text-[#474648] font-mono transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#929092]">
              {t('windowsTitleMatcher')}
            </label>
            <input
              type="text"
              value={rule.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder={t('windowsTitleMatcherPlaceholder')}
              className="w-full bg-[#1a191d] border border-[#262529] focus:border-[#e5e2e3] rounded-xl px-3 py-1.5 text-xs text-[#e5e2e3] outline-none placeholder:text-[#474648] font-mono transition-colors"
            />
          </div>
        </div>

        {/* Quick Pick Chips (Compact & clean) */}
        {uniqueAppIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <span className="text-[10px] text-[#929092] mr-1">
              {language === 'ru' ? 'Запущенные:' : 'Active:'}
            </span>
            {visibleAppChips.map((appId) => (
              <button
                key={appId}
                type="button"
                onClick={() => onUpdate({ app_id: appId })}
                className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer font-mono ${
                  rule.app_id === appId
                    ? 'bg-[#e5e2e3]/20 border-[#e5e2e3] text-[#e5e2e3] font-semibold'
                    : 'bg-[#18171b] border-[#262529] text-[#929092] hover:text-[#e5e2e3] hover:border-[#36353b]'
                }`}
              >
                {appId}
              </button>
            ))}
            {uniqueAppIds.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllChips(!showAllChips)}
                className="text-[10px] text-[#8caaee] hover:underline px-1 py-0.5 cursor-pointer"
              >
                {showAllChips ? (language === 'ru' ? 'свернуть' : 'less') : `+${uniqueAppIds.length - 6}`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Decorations Mode (Segmented buttons) ───────────────── */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#929092]">
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
                onUpdate({
                  decoration: rule.decoration === dec.id ? undefined : (dec.id as any),
                })
              }
              className={`px-2.5 py-1.5 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                rule.decoration === dec.id
                  ? 'bg-[#e5e2e3] text-[#131315] border-[#e5e2e3] font-bold shadow-sm'
                  : 'bg-[#1a191d] border-[#262529] text-[#929092] hover:border-[#36353b] hover:text-[#e5e2e3]'
              }`}
            >
              {dec.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. Visual Effects & Behaviors (Structured 2-column grid) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Blur & Opacity */}
        <div className="p-3 bg-[#18171b] border border-[#262529] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#ca9ee6]" />
              <span className="text-xs font-medium text-[#e5e2e3]">
                {t('windowsBlur')}
              </span>
            </div>
            <Toggle
              checked={hasBlur}
              onChange={(val) => onUpdate({ blur: val })}
            />
          </div>

          <div className="pt-2 border-t border-[#262529] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#929092]">
                {t('windowsOpacity')}:{' '}
                <span className="text-[#e5e2e3] font-bold font-mono">
                  {hasOpacity ? `${Math.round(opacityVal * 100)}%` : '100%'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (hasOpacity) {
                    onUpdate({ opacity: undefined });
                  } else {
                    onUpdate({ opacity: 0.85 });
                  }
                }}
                className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                  hasOpacity
                    ? 'bg-[#ca9ee6]/20 border-[#ca9ee6]/50 text-[#ca9ee6]'
                    : 'bg-[#201f24] border-[#262529] text-[#929092] hover:text-[#e5e2e3]'
                }`}
              >
                {hasOpacity ? (language === 'ru' ? 'Сброс' : 'Reset') : (language === 'ru' ? 'Задать' : 'Set')}
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
                  onUpdate({
                    opacity: Math.round(parseFloat(e.target.value) * 100) / 100,
                  })
                }
                className="w-full cursor-pointer accent-[#ca9ee6]"
              />
            )}
          </div>
        </div>

        {/* Sticky & Widget Toggles */}
        <div className="p-3 bg-[#18171b] border border-[#262529] rounded-xl flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-[#8caaee]" />
              <div>
                <div className="text-xs font-medium text-[#e5e2e3]">{t('windowsWidget')}</div>
                <div className="text-[10px] text-[#929092]">
                  {language === 'ru' ? 'Фиксация на холсте рабочего стола' : 'Pin to canvas background'}
                </div>
              </div>
            </div>
            <Toggle
              checked={!!rule.widget}
              onChange={(val) => onUpdate({ widget: val ? true : undefined })}
            />
          </div>

          <div className="pt-2 border-t border-[#262529] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AppWindow className="w-3.5 h-3.5 text-[#a6d189]" />
              <div>
                <div className="text-xs font-medium text-[#e5e2e3]">{t('windowsSticky')}</div>
                <div className="text-[10px] text-[#929092]">
                  {language === 'ru' ? 'Показывать на всех воркспейсах' : 'Visible on all workspaces'}
                </div>
              </div>
            </div>
            <Toggle
              checked={!!rule.sticky}
              onChange={(val) => onUpdate({ sticky: val ? true : undefined })}
            />
          </div>
        </div>
      </div>

      {/* ── 4. Geometry & Advanced Section ────────────────────────── */}
      <div className="p-3 bg-[#18171b] border border-[#262529] rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-1.5 text-xs font-medium text-[#e5e2e3] hover:text-white cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#e5e2e3]" />
            <span>{t('windowsGeometry')}</span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5 ml-1 text-[#929092]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-1 text-[#929092]" />
            )}
          </button>

          {activeWindow && (
            <button
              type="button"
              onClick={() => {
                setShowAdvanced(true);
                onUpdate({
                  size: activeWindow.size,
                  position: activeWindow.position,
                });
              }}
              className="text-[10px] px-2.5 py-1 rounded-lg border border-[#262529] bg-[#201f24] hover:bg-[#28272d] text-[#e5e2e3] hover:border-[#36353b] transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>{t('windowsCopyCurrentGeometry')}</span>
              <span className="font-mono text-[#a6d189]">
                ({activeWindow.size[0]}×{activeWindow.size[1]})
              </span>
            </button>
          )}
        </div>

        {showAdvanced && (
          <div className="pt-2 border-t border-[#262529] grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Size */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#929092]">
                  {t('windowsSizeEnabled')}
                </span>
                <Toggle
                  checked={Array.isArray(rule.size)}
                  onChange={(val) =>
                    onUpdate({
                      size: val ? activeWindow?.size || [950, 580] : undefined,
                    })
                  }
                />
              </div>
              {Array.isArray(rule.size) && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-[#929092]">Ширина (W)</label>
                    <input
                      type="number"
                      value={rule.size[0] || ''}
                      onChange={(e) => {
                        const w = parseInt(e.target.value, 10) || 0;
                        onUpdate({ size: [w, rule.size![1]] });
                      }}
                      className="w-full mt-0.5 bg-[#141316] border border-[#262529] focus:border-[#e5e2e3] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#929092]">Высота (H)</label>
                    <input
                      type="number"
                      value={rule.size[1] || ''}
                      onChange={(e) => {
                        const h = parseInt(e.target.value, 10) || 0;
                        onUpdate({ size: [rule.size![0], h] });
                      }}
                      className="w-full mt-0.5 bg-[#141316] border border-[#262529] focus:border-[#e5e2e3] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] font-mono outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#929092]">
                  {t('windowsPosEnabled')}
                </span>
                <Toggle
                  checked={Array.isArray(rule.position)}
                  onChange={(val) =>
                    onUpdate({
                      position: val ? activeWindow?.position || [0, 0] : undefined,
                    })
                  }
                />
              </div>
              {Array.isArray(rule.position) && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-[#929092]">Позиция X</label>
                    <input
                      type="number"
                      value={rule.position[0] ?? ''}
                      onChange={(e) => {
                        const x = parseInt(e.target.value, 10) || 0;
                        onUpdate({ position: [x, rule.position![1]] });
                      }}
                      className="w-full mt-0.5 bg-[#141316] border border-[#262529] focus:border-[#e5e2e3] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#929092]">Позиция Y</label>
                    <input
                      type="number"
                      value={rule.position[1] ?? ''}
                      onChange={(e) => {
                        const y = parseInt(e.target.value, 10) || 0;
                        onUpdate({ position: [rule.position![0], y] });
                      }}
                      className="w-full mt-0.5 bg-[#141316] border border-[#262529] focus:border-[#e5e2e3] rounded-lg px-2.5 py-1 text-xs text-[#e5e2e3] font-mono outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 5. Actions Footer ─────────────────────────────────────── */}
      <div className="pt-2 flex items-center justify-between border-t border-[#262529]">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onCollapse}
            className="px-3.5 py-1.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-[#e5e2e3] font-medium text-xs transition-colors cursor-pointer"
          >
            {t('windowsCollapse')}
          </button>
          {isNew && onSaveNew && (
            <button
              type="button"
              onClick={onSaveNew}
              className="px-4 py-1.5 rounded-xl bg-[#e5e2e3] hover:bg-white text-[#131315] font-semibold text-xs transition-colors cursor-pointer"
            >
              {t('windowsSaveRule')}
            </button>
          )}
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-1.5 rounded-xl border border-[#ea999c]/30 hover:border-[#ea999c] text-[#ea999c] hover:bg-[#ea999c]/10 text-xs transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('windowsDeleteRule')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const WindowsView: React.FC<WindowsViewProps> = ({ rules, onChange }) => {
  const { t, language } = useI18n();

  // Navigation tab: 'rules' (All configured rules) | 'active' (Open windows from Wayland)
  const [activeTab, setActiveTab] = useState<'rules' | 'active'>('rules');

  // Filter preset for configured rules
  const [ruleFilter, setRuleFilter] = useState<'all' | 'widgets' | 'nodecor' | 'opacity'>('all');

  const [activeWindows, setActiveWindows] = useState<ActiveWindow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRuleIndex, setExpandedRuleIndex] = useState<number | null>(null);

  const ruleRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Fetch active windows from driftwm state
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

  const getActiveWinKey = (win: ActiveWindow) => {
    return `${win.app_id || 'noapp'}::${win.title || 'notitle'}`;
  };

  // Matcher for active window to a configured rule
  const getMatchingRule = (win: ActiveWindow) => {
    const winApp = (win.app_id || '').toLowerCase().trim();
    const winTitle = (win.title || '').trim();

    // 1. Exact match on app_id and title
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

    // 2. Title match
    foundIdx = rules.findIndex((r) => {
      const rTitle = (r.title || '').trim();
      return rTitle && (rTitle === winTitle || winTitle.includes(rTitle));
    });
    if (foundIdx >= 0) return { rule: rules[foundIdx], index: foundIdx };

    // 3. app_id match
    foundIdx = rules.findIndex((r) => {
      const rApp = (r.app_id || '').toLowerCase().trim();
      return rApp && rApp === winApp;
    });
    if (foundIdx >= 0) return { rule: rules[foundIdx], index: foundIdx };

    return null;
  };

  const uniqueAppIds = useMemo(() => {
    const set = new Set<string>();
    for (const win of activeWindows) {
      if (win.app_id && win.app_id.trim()) {
        set.add(win.app_id.trim());
      }
    }
    return Array.from(set);
  }, [activeWindows]);

  // Update a single rule
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

  // Add new empty rule
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

    setActiveTab('rules');
    onChange([newRule, ...rules]);
    setExpandedRuleIndex(0);
    setTimeout(() => {
      ruleRefs.current[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  // Quick-create rule for an active window
  const handleCreateRuleForActiveWin = (win: ActiveWindow) => {
    handleAddNewRule({
      app_id: win.app_id || '',
      title: !win.app_id ? win.title : undefined,
      size: win.size,
      position: win.position,
      widget: win.is_widget,
      decoration: 'none',
      blur: true,
      opacity: 0.85,
    });
  };

  // Filtered rules
  const filteredRules = useMemo(() => {
    let list = rules.map((rule, index) => ({ rule, index }));

    // Preset filter
    if (ruleFilter === 'widgets') {
      list = list.filter(({ rule }) => !!rule.widget);
    } else if (ruleFilter === 'nodecor') {
      list = list.filter(({ rule }) => rule.decoration === 'none');
    } else if (ruleFilter === 'opacity') {
      list = list.filter(({ rule }) => typeof rule.opacity === 'number');
    }

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(({ rule }) => {
        const matchApp = rule.app_id?.toLowerCase().includes(q);
        const matchTitle = rule.title?.toLowerCase().includes(q);
        return matchApp || matchTitle;
      });
    }

    return list;
  }, [rules, ruleFilter, searchQuery]);

  // Filtered active windows
  const filteredActiveWindows = useMemo(() => {
    if (!searchQuery.trim()) return activeWindows;
    const q = searchQuery.toLowerCase();
    return activeWindows.filter((win) => {
      const matchApp = win.app_id?.toLowerCase().includes(q);
      const matchTitle = win.title?.toLowerCase().includes(q);
      return matchApp || matchTitle;
    });
  }, [activeWindows, searchQuery]);

  return (
    <div className="space-y-4 max-w-3xl text-[#e5e2e3] font-mono text-sm pb-16">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e5e2e3]">
            {t('windowsTitle')}
          </h1>
          <p className="text-sm text-[#929092] mt-1">
            {rules.length} {t('windowsAllRulesCount')} • {activeWindows.length} {language === 'ru' ? 'открытых окон' : 'open windows'}
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => handleAddNewRule()}
            className="px-3.5 py-2 rounded-xl bg-[#e5e2e3] hover:bg-white text-[#131315] font-semibold text-xs transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('windowsAddRule')}</span>
          </button>
          <button
            type="button"
            onClick={fetchActive}
            className="w-9 h-9 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-[#929092] hover:text-[#e5e2e3] flex items-center justify-center transition-colors cursor-pointer"
            title={language === 'ru' ? 'Обновить окна' : 'Refresh Windows'}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Top Navigation & Search Bar (Segmented Control) ─────────── */}
      <div className="minimal-card p-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Main Segmented Tab Switcher */}
          <div className="flex items-center p-1 bg-[#131315] border border-[#262529] rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'rules'
                  ? 'bg-[#201f24] text-[#e5e2e3] shadow-sm border border-[#36353b]'
                  : 'text-[#929092] hover:text-[#e5e2e3]'
              }`}
            >
              <span>{t('windowsTabRules')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#131315] border border-[#262529] text-[#929092] font-mono">
                {rules.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'active'
                  ? 'bg-[#201f24] text-[#e5e2e3] shadow-sm border border-[#36353b]'
                  : 'text-[#929092] hover:text-[#e5e2e3]'
              }`}
            >
              <span>{t('windowsTabActive')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#131315] border border-[#262529] text-[#929092] font-mono">
                {activeWindows.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#929092]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'rules'
                  ? t('windowsSearchPlaceholder')
                  : t('windowsActiveFilterPlaceholder')
              }
              className="w-full pl-8 pr-3 py-1.5 bg-[#131315] border border-[#262529] focus:border-[#e5e2e3] rounded-xl text-xs text-[#e5e2e3] outline-none placeholder:text-[#474648] transition-colors font-mono"
            />
          </div>
        </div>

        {/* Filter Pills (Shown only on Rules tab) */}
        {activeTab === 'rules' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#262529]">
            {[
              { id: 'all', label: t('windowsFilterAll') },
              { id: 'widgets', label: t('windowsFilterWidgets') },
              { id: 'nodecor', label: t('windowsFilterNoDecor') },
              { id: 'opacity', label: t('windowsFilterCustomOpacity') },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setRuleFilter(f.id as any)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  ruleFilter === f.id
                    ? 'bg-[#e5e2e3]/15 border-[#e5e2e3] text-[#e5e2e3] font-semibold'
                    : 'bg-[#131315] border-[#262529] text-[#929092] hover:text-[#e5e2e3] hover:border-[#36353b]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TAB 1: CONFIGURED RULES LIST ────────────────────────────── */}
      {activeTab === 'rules' && (
        <div className="minimal-card overflow-hidden">
          {rules.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="text-sm text-[#929092]">{t('windowsNoRules')}</div>
              <button
                type="button"
                onClick={() => handleAddNewRule()}
                className="px-4 py-2 rounded-xl bg-[#e5e2e3] text-[#131315] font-semibold text-xs transition-colors cursor-pointer"
              >
                {t('windowsAddRule')}
              </button>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#929092]">
              {t('windowsNoMatchingRules')}
            </div>
          ) : (
            <div className="divide-y divide-[#262529]">
              {filteredRules.map(({ rule, index }) => {
                const isExpanded = expandedRuleIndex === index;

                return (
                  <div
                    key={`${rule.app_id || ''}-${rule.title || ''}-${index}`}
                    ref={(el) => (ruleRefs.current[index] = el)}
                    className="transition-colors"
                  >
                    {/* Collapsed Rule Header Row */}
                    <div
                      onClick={() => setExpandedRuleIndex(isExpanded ? null : index)}
                      className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#201f24]/50 transition-colors select-none ${
                        isExpanded ? 'bg-[#201f24]/70 border-l-2 border-[#e5e2e3]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1 min-w-0">
                          {/* App ID */}
                          {rule.app_id ? (
                            <span className="text-[#e5e2e3] font-bold text-xs shrink-0 font-mono">
                              [{rule.app_id}]
                            </span>
                          ) : (
                            <span className="text-[#929092] font-semibold text-xs shrink-0 font-mono">
                              [{t('windowsAppFallback')}]
                            </span>
                          )}

                          {/* Title */}
                          {rule.title && (
                            <span className="text-xs text-[#929092] truncate max-w-[220px]">
                              "{rule.title}"
                            </span>
                          )}

                          {/* Badges */}
                          {rule.widget && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#ca9ee6]/15 border-[#ca9ee6]/40 text-[#ca9ee6]">
                              {t('windowsWidgetBadge')}
                            </span>
                          )}

                          {rule.sticky && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#8caaee]/15 border-[#8caaee]/40 text-[#8caaee]">
                              sticky
                            </span>
                          )}

                          {rule.decoration && rule.decoration !== 'none' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#262529] border-[#36353b] text-[#929092]">
                              {rule.decoration}
                            </span>
                          )}

                          {typeof rule.opacity === 'number' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#e5e2e3]/10 border-[#e5e2e3]/30 text-[#e5e2e3] font-mono">
                              {Math.round(rule.opacity * 100)}%
                            </span>
                          )}

                          {rule.size && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#262529] border-[#36353b] text-[#929092] font-mono">
                              {rule.size[0]}×{rule.size[1]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center space-x-2 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRule(index);
                          }}
                          className="w-7 h-7 rounded-lg border border-[#262529] hover:border-[#ea999c] text-[#929092] hover:text-[#ea999c] flex items-center justify-center transition-colors cursor-pointer"
                          title={t('windowsDeleteRule')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[#e5e2e3] font-mono text-xs font-bold w-4 text-center select-none">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#e5e2e3]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#929092]" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Inline Expanded Editor */}
                    {isExpanded && (
                      <RuleEditor
                        rule={rule}
                        onUpdate={(partial) => updateRuleAt(index, partial)}
                        onDelete={() => handleDeleteRule(index)}
                        onCollapse={() => setExpandedRuleIndex(null)}
                        uniqueAppIds={uniqueAppIds}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ACTIVE RUNNING WINDOWS ───────────────────────────── */}
      {activeTab === 'active' && (
        <div className="minimal-card overflow-hidden">
          {activeWindows.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#929092]">
              {t('windowsNoActiveApps')}
            </div>
          ) : filteredActiveWindows.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#929092]">
              {t('windowsNoMatchingRules')}
            </div>
          ) : (
            <div className="divide-y divide-[#262529]">
              {filteredActiveWindows.map((win) => {
                const winKey = getActiveWinKey(win);
                const matched = getMatchingRule(win);
                const isConfigured = matched !== null;

                return (
                  <div
                    key={winKey}
                    className="px-4 py-3 flex items-center justify-between hover:bg-[#201f24]/40 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-3">
                      <div className="w-2 h-2 rounded-full shrink-0 bg-[#a6d189]" />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="text-xs font-bold text-[#e5e2e3] font-mono">
                            {win.app_id || t('windowsAppFallback')}
                          </span>
                          {win.is_focused && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#a6d189]/15 border-[#a6d189]/40 text-[#a6d189]">
                              {t('windowsFocused')}
                            </span>
                          )}
                          {win.is_widget && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#ca9ee6]/15 border-[#ca9ee6]/40 text-[#ca9ee6]">
                              {t('windowsWidgetBadge')}
                            </span>
                          )}
                          <span className="text-[9px] px-1.5 py-0.2 rounded border bg-[#262529] border-[#36353b] text-[#929092] font-mono">
                            {win.size[0]}×{win.size[1]}
                          </span>
                        </div>
                        {win.title && (
                          <div className="text-[11px] text-[#929092] truncate mt-0.5 max-w-[380px]">
                            "{win.title}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2">
                      {isConfigured && matched ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('rules');
                            setExpandedRuleIndex(matched.index);
                            setTimeout(() => {
                              ruleRefs.current[matched.index]?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                              });
                            }, 50);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[#a6d189]/40 bg-[#a6d189]/10 text-[#a6d189] hover:bg-[#a6d189]/20 text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>{t('windowsConfigured')}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCreateRuleForActiveWin(win)}
                          className="px-2.5 py-1 rounded-lg border border-[#e5e2e3]/30 bg-[#e5e2e3]/10 hover:bg-[#e5e2e3] hover:text-[#131315] text-[#e5e2e3] text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{t('windowsCreateRuleForWin')}</span>
                        </button>
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
  );
};

export default WindowsView;
