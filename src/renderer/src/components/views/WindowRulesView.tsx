import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Monitor,
  Check,
  Layers,
} from 'lucide-react';
import type { WindowRule, ActiveWindow } from '../../../../preload/types';

interface WindowRulesViewProps {
  rules: WindowRule[];
  onChange: (newRules: WindowRule[]) => void;
  searchQuery?: string;
}

export const WindowRulesView: React.FC<WindowRulesViewProps> = ({
  rules,
  onChange,
  searchQuery = '',
}) => {
  const [activeWindows, setActiveWindows] = useState<ActiveWindow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form state for new / edit rule
  const [formAppId, setFormAppId] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formBlur, setFormBlur] = useState<boolean>(true);
  const [formOpacity, setFormOpacity] = useState<number>(0.85);
  const [formWidget, setFormWidget] = useState<boolean>(false);
  const [formDecoration, setFormDecoration] = useState<WindowRule['decoration']>('none');
  const [formPosX, setFormPosX] = useState<string>('');
  const [formPosY, setFormPosY] = useState<string>('');
  const [formWidth, setFormWidth] = useState<string>('');
  const [formHeight, setFormHeight] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchActive = async () => {
      try {
        if (window.driftAPI?.getActiveWindows) {
          const wins = await window.driftAPI.getActiveWindows();
          if (isMounted) setActiveWindows(wins);
        }
      } catch (err) {
        console.error('[WindowRulesView] Failed to get active windows:', err);
      }
    };

    fetchActive();
    const interval = setInterval(fetchActive, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const effectiveSearch = searchQuery;

  const handleToggleBlur = (index: number) => {
    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      blur: !updated[index].blur,
    };
    onChange(updated);
  };

  const handleOpacityChange = (index: number, opacity: number) => {
    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      opacity,
    };
    onChange(updated);
  };

  const handleDeleteRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddFromActive = (win: ActiveWindow) => {
    setFormAppId(win.app_id);
    setFormTitle(win.title);
    setFormBlur(true);
    setFormOpacity(0.85);
    setFormWidget(win.is_widget);
    setFormDecoration('none');
    setFormPosX(String(win.position[0]));
    setFormPosY(String(win.position[1]));
    setFormWidth(String(win.size[0]));
    setFormHeight(String(win.size[1]));
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAppId && !formTitle) return;

    const newRule: WindowRule = {
      app_id: formAppId ? formAppId.trim() : undefined,
      title: formTitle ? formTitle.trim() : undefined,
      blur: formBlur,
      opacity: formOpacity,
      widget: formWidget,
      decoration: formDecoration,
    };

    if (formPosX !== '' && formPosY !== '') {
      newRule.position = [parseInt(formPosX, 10) || 0, parseInt(formPosY, 10) || 0];
    }

    if (formWidth !== '' && formHeight !== '') {
      newRule.size = [parseInt(formWidth, 10) || 400, parseInt(formHeight, 10) || 300];
    }

    onChange([...rules, newRule]);
    setIsModalOpen(false);
  };

  const filteredRules = useMemo(() => {
    if (!effectiveSearch.trim()) return rules;
    const q = effectiveSearch.toLowerCase();
    return rules.filter(
      (r) =>
        (r.app_id && r.app_id.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q))
    );
  }, [rules, effectiveSearch]);

  const filteredActive = useMemo(() => {
    if (!effectiveSearch.trim()) return activeWindows;
    const q = effectiveSearch.toLowerCase();
    return activeWindows.filter(
      (w) => w.app_id.toLowerCase().includes(q) || w.title.toLowerCase().includes(q)
    );
  }, [activeWindows, effectiveSearch]);

  return (
    <div className="space-y-6 pb-6 select-none">
      {/* ── Section 1: Active Windows (Spotify Quick-Select Grid) ────────── */}
      <section className="bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-400 to-[#1ed760] flex items-center justify-center text-neutral-950 shadow-sm">
              <Monitor className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Активные окна в сессии driftwm
              </h2>
              <p className="text-[11px] text-white/40">
                Кликните на окно, чтобы мгновенно создать правило размытия или прозрачности
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 font-mono">
            {activeWindows.length} окон онлайн
          </span>
        </div>

        {filteredActive.length === 0 ? (
          <div className="text-center py-6 text-xs text-white/35 font-mono">
            Нет активных окон или они скрыты фильтром
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredActive.map((win, idx) => {
              const hasExistingRule = rules.some(
                (r) => r.app_id === win.app_id || (r.title && win.title.includes(r.title))
              );

              return (
                <div
                  key={`${win.app_id}-${idx}`}
                  onClick={() => handleAddFromActive(win)}
                  className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between group ${
                    win.is_focused
                      ? 'bg-white/[0.08] border-[#1ed760]/40 shadow-glow-green/20'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4 text-drift-cyan" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate group-hover:text-[#1ed760] transition-colors">
                        {win.app_id || 'Неизвестно'}
                      </div>
                      <div className="text-[10px] text-white/45 truncate mt-0.5">
                        {win.title || 'Без названия'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                    {hasExistingRule ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1ed760]/15 text-[#1ed760] font-mono border border-[#1ed760]/30 flex items-center space-x-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>есть</span>
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] group-hover:bg-[#1ed760] group-hover:text-neutral-950 text-white/60 font-mono transition-all">
                        + правило
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Section 2: Configured Window Rules ──────────────────────────── */}
      <section className="bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Настроенные правила окон ([window_rules])
              </h2>
              <p className="text-[11px] text-white/40">
                Размытие, прозрачность, декорации заголовка и геометрия
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormAppId('');
              setFormTitle('');
              setFormBlur(true);
              setFormOpacity(0.85);
              setFormWidget(false);
              setFormDecoration('none');
              setFormPosX('');
              setFormPosY('');
              setFormWidth('');
              setFormHeight('');
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#1ed760] text-neutral-950 font-semibold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-glow-green"
          >
            <Plus className="w-3.5 h-3.5 font-bold" />
            <span>Новое правило</span>
          </button>
        </div>

        {filteredRules.length === 0 ? (
          <div className="text-center py-8 text-xs text-white/35 font-mono">
            {effectiveSearch
              ? `По запросу "${effectiveSearch}" правил не найдено`
              : 'Список правил пуст'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.12] transition-all flex items-center justify-between gap-4 group"
              >
                {/* Selector */}
                <div className="min-w-[200px] max-w-[280px]">
                  {rule.app_id && (
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-drift-cyan bg-drift-cyan/10 px-2 py-0.5 rounded-full border border-drift-cyan/25 font-mono font-medium">
                        app_id
                      </span>
                      <span className="text-xs font-semibold text-white truncate font-mono">
                        {rule.app_id}
                      </span>
                    </div>
                  )}
                  {rule.title && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] text-drift-purple bg-drift-purple/10 px-2 py-0.5 rounded-full border border-drift-purple/25 font-mono font-medium">
                        title
                      </span>
                      <span className="text-xs text-white/70 truncate font-mono">
                        {rule.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Blur Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleToggleBlur(idx)}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                      rule.blur
                        ? 'bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/40 shadow-glow-green/20'
                        : 'bg-white/[0.05] text-white/40 border border-white/[0.08] hover:text-white/70'
                    }`}
                    title="Включить / выключить размытие под этим окном"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{rule.blur ? 'Блюр ВКЛ' : 'Без блюра'}</span>
                  </button>
                </div>

                {/* Opacity Slider */}
                <div className="flex items-center space-x-2.5 min-w-[150px]">
                  <span className="text-[11px] text-white/50 font-mono">
                    {Math.round((rule.opacity ?? 1.0) * 100)}%
                  </span>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={rule.opacity ?? 1.0}
                    onChange={(e) => handleOpacityChange(idx, parseFloat(e.target.value))}
                    className="w-24 cursor-pointer"
                    title="Прозрачность окна"
                  />
                </div>

                {/* Properties Badges */}
                <div className="flex flex-wrap items-center gap-1.5 min-w-[130px]">
                  {rule.widget && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-mono">
                      widget
                    </span>
                  )}
                  {rule.decoration && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.06] text-white/60 border border-white/[0.08] font-mono">
                      dec: {rule.decoration}
                    </span>
                  )}
                  {rule.sticky && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/25 font-mono">
                      sticky
                    </span>
                  )}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteRule(idx)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer"
                  title="Удалить правило"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Glass Modal: New / Edit Rule ────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form
            onSubmit={handleSaveModal}
            className="bg-[#121520]/85 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-glass backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Настройка правила окна
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-white/60 mb-1 font-medium">
                  app_id (селектор программы):
                </label>
                <input
                  type="text"
                  value={formAppId}
                  onChange={(e) => setFormAppId(e.target.value)}
                  placeholder="например: spotify, zen, kitty..."
                  className="w-full px-3.5 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white font-mono placeholder-white/30 focus:border-[#1ed760] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-medium">
                  title (заголовок окна, если нужен):
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="например: Picture-in-Picture"
                  className="w-full px-3.5 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white font-mono placeholder-white/30 focus:border-[#1ed760] focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center space-x-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] cursor-pointer hover:bg-white/[0.08] transition-colors">
                  <input
                    type="checkbox"
                    checked={formBlur}
                    onChange={(e) => setFormBlur(e.target.checked)}
                    className="rounded accent-[#1ed760]"
                  />
                  <span className="text-white/80">Размытие (blur)</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] cursor-pointer hover:bg-white/[0.08] transition-colors">
                  <input
                    type="checkbox"
                    checked={formWidget}
                    onChange={(e) => setFormWidget(e.target.checked)}
                    className="rounded accent-[#1ed760]"
                  />
                  <span className="text-white/80">Виджет (widget)</span>
                </label>
              </div>

              <div>
                <div className="flex justify-between text-white/60 mb-1.5 font-medium">
                  <span>Прозрачность окна (opacity):</span>
                  <span className="font-mono text-[#1ed760]">{Math.round(formOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={formOpacity}
                  onChange={(e) => setFormOpacity(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-medium">
                  Декорации заголовка:
                </label>
                <select
                  value={formDecoration || 'none'}
                  onChange={(e) => setFormDecoration(e.target.value as WindowRule['decoration'])}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/[0.1] rounded-xl text-white font-mono focus:border-[#1ed760] focus:outline-none cursor-pointer"
                >
                  <option value="none">none — без системных рамок</option>
                  <option value="minimal">minimal — тонкая линия</option>
                  <option value="client">client — клиентские кнопки</option>
                  <option value="server">server — оконный менеджер</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2.5 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs text-white/60 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full text-xs font-semibold text-neutral-950 bg-[#1ed760] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-glow-green"
              >
                Сохранить правило
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WindowRulesView;
